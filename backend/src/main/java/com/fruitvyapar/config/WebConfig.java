package com.fruitvyapar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/fruitvyapar}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        String uploadLocation = uploadPath.toUri().toString();
        if (!uploadLocation.endsWith("/")) {
            uploadLocation += "/";
        }

        Path backendUploadPath = Paths.get("backend/uploads").toAbsolutePath().normalize();
        String backendUploadLocation = backendUploadPath.toUri().toString();
        if (!backendUploadLocation.endsWith("/")) {
            backendUploadLocation += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation, backendUploadLocation);

        registry.addResourceHandler("/uploads/kisanvyapar/**")
                .addResourceLocations(
                        uploadLocation + "kisanvyapar/",
                        uploadLocation + "fruitvyapar/",
                        backendUploadLocation + "kisanvyapar/",
                        backendUploadLocation + "fruitvyapar/"
                );

        registry.addResourceHandler("/uploads/fruitvyapar/**")
                .addResourceLocations(
                        uploadLocation + "fruitvyapar/",
                        uploadLocation + "kisanvyapar/",
                        backendUploadLocation + "fruitvyapar/",
                        backendUploadLocation + "kisanvyapar/"
                );
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
