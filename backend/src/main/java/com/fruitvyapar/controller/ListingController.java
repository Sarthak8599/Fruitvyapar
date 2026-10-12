package com.fruitvyapar.controller;

import com.fruitvyapar.dto.ApiResponse;
import com.fruitvyapar.dto.FruitListingDto;
import com.fruitvyapar.entity.FruitListing;
import com.fruitvyapar.entity.ListingStatus;
import com.fruitvyapar.entity.User;
import com.fruitvyapar.repository.FruitListingRepository;
import com.fruitvyapar.repository.UserRepository;
import com.fruitvyapar.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/listings")

public class ListingController {

    @Autowired
    private FruitListingRepository fruitListingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private com.fruitvyapar.service.FruitListingCleanupService fruitListingCleanupService;

    @DeleteMapping("/clear-demo")
    public ResponseEntity<ApiResponse<String>> clearDemoListings() {
        fruitListingRepository.deleteAll();
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("All demo/test listings cleared successfully.")
                .data("Cleared")
                .build());
    }

    @PostMapping(value = "/sell", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<FruitListingDto>> createListing(
            @RequestParam("fruitName") String fruitName,
            @RequestParam(value = "pricePerKg", required = false) BigDecimal pricePerKg,
            @RequestParam(value = "quantityKg", required = false) BigDecimal quantityKg,
            @RequestParam("farmerPhoneNumber") String farmerPhoneNumber,
            @RequestParam(value = "whatsappNumber", required = false) String whatsappNumber,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "farmerId", required = false) Long farmerId,
            @RequestParam(value = "farmerEmail", required = false) String farmerEmail,
            @RequestParam(value = "imageUrl", required = false) String imageUrlParam,
            @RequestParam(value = "videoUrl", required = false) String videoUrlParam,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "video", required = false) MultipartFile video
    ) {
        LocalDateTime cutoff24h = LocalDateTime.now().minusHours(24);
        long countRecent = fruitListingRepository.countRecentListingsByUserOrPhone(farmerId, farmerPhoneNumber, cutoff24h);
        if (countRecent >= 2) {
            return ResponseEntity.badRequest().body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Daily limit reached: You can only upload a maximum of 2 fruit listings per day.")
                    .build());
        }

        String imageUrl = imageUrlParam;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.saveFileLocally(image, "photos");
        } else if (imageUrlParam != null && imageUrlParam.startsWith("data:")) {
            imageUrl = fileStorageService.saveBase64FileLocally(imageUrlParam, "photos");
        }

        String videoUrl = videoUrlParam;
        if (video != null && !video.isEmpty()) {
            videoUrl = fileStorageService.saveFileLocally(video, "videos");
        } else if (videoUrlParam != null && videoUrlParam.startsWith("data:")) {
            videoUrl = fileStorageService.saveBase64FileLocally(videoUrlParam, "videos");
        }

        User farmer = null;
        if (farmerId != null) {
            farmer = userRepository.findById(farmerId).orElse(null);
        } else if (farmerEmail != null && !farmerEmail.trim().isEmpty()) {
            farmer = userRepository.findByEmail(farmerEmail.toLowerCase().trim()).orElse(null);
        }

        FruitListing listing = FruitListing.builder()
                .fruitName(fruitName)
                .pricePerKg(pricePerKg)
                .quantityKg(quantityKg)
                .farmerPhoneNumber(farmerPhoneNumber)
                .whatsappNumber(whatsappNumber != null ? whatsappNumber : farmerPhoneNumber)
                .latitude(latitude != null ? latitude : 18.5204)
                .longitude(longitude != null ? longitude : 73.8567)
                .address(address)
                .farmer(farmer)
                .imageUrl(imageUrl)
                .videoUrl(videoUrl)
                .callsCount(0)
                .editCount(0)
                .status(ListingStatus.AVAILABLE)
                .createdAt(LocalDateTime.now())
                .build();

        listing = fruitListingRepository.save(listing);

        return ResponseEntity.ok(ApiResponse.<FruitListingDto>builder()
                .success(true)
                .message("Listing created successfully")
                .data(FruitListingDto.fromEntity(listing, true))
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<FruitListingDto>> createJsonListing(@RequestBody FruitListingDto dto) {
        LocalDateTime cutoff24h = LocalDateTime.now().minusHours(24);
        long countRecent = fruitListingRepository.countRecentListingsByUserOrPhone(dto.getFarmerId(), dto.getFarmerPhoneNumber(), cutoff24h);
        if (countRecent >= 2) {
            return ResponseEntity.badRequest().body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Daily limit reached: You can only upload a maximum of 2 fruit listings per day.")
                    .build());
        }

        User farmer = null;
        if (dto.getFarmerId() != null) {
            farmer = userRepository.findById(dto.getFarmerId()).orElse(null);
        }

        FruitListing listing = FruitListing.builder()
                .fruitName(dto.getFruitName() != null ? dto.getFruitName() : "Mango")
                .pricePerKg(dto.getPricePerKg() != null ? dto.getPricePerKg() : BigDecimal.valueOf(100))
                .quantityKg(dto.getQuantityKg() != null ? dto.getQuantityKg() : BigDecimal.valueOf(100))
                .farmerPhoneNumber(dto.getFarmerPhoneNumber() != null ? dto.getFarmerPhoneNumber() : "9822011223")
                .whatsappNumber(dto.getWhatsappNumber() != null ? dto.getWhatsappNumber() : dto.getFarmerPhoneNumber())
                .latitude(dto.getLatitude() != null ? dto.getLatitude() : 18.5204)
                .longitude(dto.getLongitude() != null ? dto.getLongitude() : 73.8567)
                .address(dto.getAddress())
                .farmer(farmer)
                .imageUrl(dto.getImageUrl())
                .videoUrl(dto.getVideoUrl())
                .callsCount(0)
                .editCount(0)
                .status(ListingStatus.AVAILABLE)
                .createdAt(LocalDateTime.now())
                .build();

        listing = fruitListingRepository.save(listing);

        return ResponseEntity.ok(ApiResponse.<FruitListingDto>builder()
                .success(true)
                .message("Listing created successfully")
                .data(FruitListingDto.fromEntity(listing, true))
                .build());
    }

    @PostMapping(value = "/{listingId:[0-9]+}/update", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<FruitListingDto>> updateListingMultipart(
            @PathVariable("listingId") Long listingId,
            @RequestParam(value = "fruitName", required = false) String fruitName,
            @RequestParam(value = "pricePerKg", required = false) BigDecimal pricePerKg,
            @RequestParam(value = "quantityKg", required = false) BigDecimal quantityKg,
            @RequestParam(value = "farmerPhoneNumber", required = false) String farmerPhoneNumber,
            @RequestParam(value = "whatsappNumber", required = false) String whatsappNumber,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "imageUrl", required = false) String imageUrlParam,
            @RequestParam(value = "videoUrl", required = false) String videoUrlParam,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "video", required = false) MultipartFile video
    ) {
        Optional<FruitListing> opt = fruitListingRepository.findById(listingId);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Listing not found")
                    .build());
        }

        FruitListing listing = opt.get();
        if (listing.getEditCount() != null && listing.getEditCount() >= 2) {
            return ResponseEntity.badRequest().body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Edit limit reached: This fruit listing has already been edited 2 times and cannot be edited again.")
                    .build());
        }

        if (fruitName != null) listing.setFruitName(fruitName);
        if (pricePerKg != null) listing.setPricePerKg(pricePerKg);
        if (quantityKg != null) listing.setQuantityKg(quantityKg);
        if (farmerPhoneNumber != null) listing.setFarmerPhoneNumber(farmerPhoneNumber);
        if (whatsappNumber != null) listing.setWhatsappNumber(whatsappNumber);
        if (latitude != null) listing.setLatitude(latitude);
        if (longitude != null) listing.setLongitude(longitude);
        if (address != null) listing.setAddress(address);

        if (image != null && !image.isEmpty()) {
            listing.setImageUrl(fileStorageService.saveFileLocally(image, "photos"));
        } else if (imageUrlParam != null) {
            if (imageUrlParam.startsWith("data:")) {
                listing.setImageUrl(fileStorageService.saveBase64FileLocally(imageUrlParam, "photos"));
            } else {
                listing.setImageUrl(imageUrlParam);
            }
        }

        if (video != null && !video.isEmpty()) {
            listing.setVideoUrl(fileStorageService.saveFileLocally(video, "videos"));
        } else if (videoUrlParam != null) {
            if (videoUrlParam.startsWith("data:")) {
                listing.setVideoUrl(fileStorageService.saveBase64FileLocally(videoUrlParam, "videos"));
            } else {
                listing.setVideoUrl(videoUrlParam);
            }
        }

        listing.setEditCount((listing.getEditCount() != null ? listing.getEditCount() : 0) + 1);
        listing = fruitListingRepository.save(listing);

        return ResponseEntity.ok(ApiResponse.<FruitListingDto>builder()
                .success(true)
                .message("Listing updated successfully")
                .data(FruitListingDto.fromEntity(listing, true))
                .build());
    }

    @PostMapping("/{listingId}/update-json")
    public ResponseEntity<ApiResponse<FruitListingDto>> updateListingJson(
            @PathVariable("listingId") Long listingId,
            @RequestBody FruitListingDto dto
    ) {
        Optional<FruitListing> opt = fruitListingRepository.findById(listingId);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Listing not found")
                    .build());
        }

        FruitListing listing = opt.get();
        if (listing.getEditCount() != null && listing.getEditCount() >= 2) {
            return ResponseEntity.badRequest().body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Edit limit reached: This fruit listing has already been edited 2 times and cannot be edited again.")
                    .build());
        }

        if (dto.getFruitName() != null) listing.setFruitName(dto.getFruitName());
        if (dto.getPricePerKg() != null) listing.setPricePerKg(dto.getPricePerKg());
        if (dto.getQuantityKg() != null) listing.setQuantityKg(dto.getQuantityKg());
        if (dto.getFarmerPhoneNumber() != null) listing.setFarmerPhoneNumber(dto.getFarmerPhoneNumber());
        if (dto.getWhatsappNumber() != null) listing.setWhatsappNumber(dto.getWhatsappNumber());
        if (dto.getLatitude() != null) listing.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) listing.setLongitude(dto.getLongitude());
        if (dto.getAddress() != null) listing.setAddress(dto.getAddress());
        if (dto.getImageUrl() != null) listing.setImageUrl(dto.getImageUrl());
        if (dto.getVideoUrl() != null) listing.setVideoUrl(dto.getVideoUrl());

        listing.setEditCount((listing.getEditCount() != null ? listing.getEditCount() : 0) + 1);
        listing = fruitListingRepository.save(listing);

        return ResponseEntity.ok(ApiResponse.<FruitListingDto>builder()
                .success(true)
                .message("Listing updated successfully")
                .data(FruitListingDto.fromEntity(listing, true))
                .build());
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<FruitListingDto>>> getNearbyListings(
            @RequestParam(value = "buyerLat", defaultValue = "18.5204") Double buyerLat,
            @RequestParam(value = "buyerLng", defaultValue = "73.8567") Double buyerLng,
            @RequestParam(value = "radiusKm", defaultValue = "500") Double radiusKm,
            @RequestParam(value = "isLoggedIn", defaultValue = "false") Boolean isLoggedIn
    ) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(2);
        try {
            fruitListingCleanupService.cleanupExpiredListings();
        } catch (Exception ignored) {}
        List<FruitListing> listings = fruitListingRepository.findNearbyListings(buyerLat, buyerLng, radiusKm, cutoff);
        List<FruitListingDto> dtos = listings.stream()
                .map(l -> FruitListingDto.fromEntity(l, isLoggedIn))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<FruitListingDto>>builder()
                .success(true)
                .message("Nearby listings fetched successfully")
                .data(dtos)
                .build());
    }

    @GetMapping("/my-listings")
    public ResponseEntity<ApiResponse<List<FruitListingDto>>> getMyListings(
            @RequestParam("userId") Long userId
    ) {
        LocalDateTime cutoff2days = LocalDateTime.now().minusDays(2);
        List<FruitListing> listings = fruitListingRepository.findByFarmerUserIdAndCreatedAtAfter(userId, cutoff2days);
        List<FruitListingDto> dtos = listings.stream()
                .map(l -> FruitListingDto.fromEntity(l, true))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<FruitListingDto>>builder()
                .success(true)
                .message("User listings fetched successfully")
                .data(dtos)
                .build());
    }

    @PostMapping("/{listingId}/log-call")
    public ResponseEntity<ApiResponse<Void>> logCall(@PathVariable("listingId") Long listingId) {
        Optional<FruitListing> listingOpt = fruitListingRepository.findById(listingId);
        if (listingOpt.isPresent()) {
            FruitListing listing = listingOpt.get();
            listing.setCallsCount((listing.getCallsCount() != null ? listing.getCallsCount() : 0) + 1);
            fruitListingRepository.save(listing);
        }
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Call logged successfully")
                .build());
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FruitListingDto>>> getAllListings() {
        List<FruitListing> listings = fruitListingRepository.findAll();
        List<FruitListingDto> dtos = listings.stream()
                .map(l -> FruitListingDto.fromEntity(l, true))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<FruitListingDto>>builder()
                .success(true)
                .message("All listings fetched successfully")
                .data(dtos)
                .build());
    }

    @GetMapping("/{listingId:[0-9]+}")
    public ResponseEntity<ApiResponse<FruitListingDto>> getListingById(@PathVariable("listingId") Long listingId) {
        Optional<FruitListing> opt = fruitListingRepository.findById(listingId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.<FruitListingDto>builder()
                    .success(false)
                    .message("Listing not found")
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.<FruitListingDto>builder()
                .success(true)
                .message("Listing fetched successfully")
                .data(FruitListingDto.fromEntity(opt.get(), true))
                .build());
    }

    @PostMapping("/{listingId:[0-9]+}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteListingPost(@PathVariable("listingId") Long listingId) {
        Optional<FruitListing> opt = fruitListingRepository.findById(listingId);
        if (opt.isPresent()) {
            FruitListing listing = opt.get();
            if (listing.getImageUrl() != null) fileStorageService.deleteFile(listing.getImageUrl());
            if (listing.getVideoUrl() != null) fileStorageService.deleteFile(listing.getVideoUrl());
            fruitListingRepository.delete(listing);
        }
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Listing deleted successfully")
                .build());
    }

    @DeleteMapping("/{listingId:[0-9]+}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable("listingId") Long listingId) {
        return deleteListingPost(listingId);
    }
}
