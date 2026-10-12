package com.fruitvyapar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final String uploadDirPrefix;

    public FileStorageService(@Value("${file.upload-dir:uploads/fruitvyapar}") String uploadDir) {
        String cleanDir = uploadDir.replace("\\", "/");
        if (cleanDir.startsWith("/")) {
            cleanDir = cleanDir.substring(1);
        }
        if (cleanDir.endsWith("/")) {
            cleanDir = cleanDir.substring(0, cleanDir.length() - 1);
        }
        this.uploadDirPrefix = "/" + cleanDir;
        this.fileStorageLocation = Paths.get(cleanDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String saveFileLocally(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String rawFileName = Objects.requireNonNullElse(file.getOriginalFilename(), "file");
            String originalFileName = StringUtils.cleanPath(rawFileName);
            String extension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                extension = originalFileName.substring(i);
            }

            String newFileName = UUID.randomUUID().toString() + extension;

            Path targetDir = this.fileStorageLocation.resolve(subfolder != null ? subfolder : "");
            Files.createDirectories(targetDir);

            Path targetLocation = targetDir.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return this.uploadDirPrefix + "/" + (subfolder != null ? subfolder + "/" : "") + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    public String saveBase64FileLocally(String base64Data, String subfolder) {
        if (base64Data == null || base64Data.trim().isEmpty()) {
            return null;
        }
        if (!base64Data.startsWith("data:")) {
            return base64Data;
        }
        try {
            String extension = ".jpg";
            if (base64Data.contains("data:image/png")) {
                extension = ".png";
            } else if (base64Data.contains("data:image/webp")) {
                extension = ".webp";
            } else if (base64Data.contains("data:video/mp4")) {
                extension = ".mp4";
            }

            int commaIdx = base64Data.indexOf(',');
            String rawBase64 = commaIdx >= 0 ? base64Data.substring(commaIdx + 1) : base64Data;
            byte[] decoded = java.util.Base64.getDecoder().decode(rawBase64);

            String newFileName = UUID.randomUUID().toString() + extension;
            Path targetDir = this.fileStorageLocation.resolve(subfolder != null ? subfolder : "");
            Files.createDirectories(targetDir);

            Path targetLocation = targetDir.resolve(newFileName);
            Files.write(targetLocation, decoded);

            return this.uploadDirPrefix + "/" + (subfolder != null ? subfolder + "/" : "") + newFileName;
        } catch (Exception ex) {
            return null;
        }
    }

    public void deleteFile(String relativeUrl) {
        if (relativeUrl == null || relativeUrl.trim().isEmpty()) {
            return;
        }
        try {
            String path = relativeUrl;
            if (path.contains("/uploads/")) {
                path = path.substring(path.indexOf("/uploads/") + "/uploads/".length());
            } else if (path.startsWith("/")) {
                path = path.substring(1);
            }
            // Check direct relative to uploads
            Path path1 = Paths.get("uploads").resolve(path).toAbsolutePath().normalize();
            Files.deleteIfExists(path1);

            // Also check under backend/uploads
            Path path2 = Paths.get("backend/uploads").resolve(path).toAbsolutePath().normalize();
            Files.deleteIfExists(path2);

            // Also check fruitvyapar/kisanvyapar subfolders if path has fileName only
            Path fileNameOnly = Paths.get(path).getFileName();
            if (fileNameOnly != null) {
                String fn = fileNameOnly.toString();
                for (String folder : new String[]{"fruitvyapar", "kisanvyapar"}) {
                    for (String sub : new String[]{"photos", "videos"}) {
                        Files.deleteIfExists(Paths.get("uploads", folder, sub, fn).toAbsolutePath().normalize());
                        Files.deleteIfExists(Paths.get("backend/uploads", folder, sub, fn).toAbsolutePath().normalize());
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }
    }
}
