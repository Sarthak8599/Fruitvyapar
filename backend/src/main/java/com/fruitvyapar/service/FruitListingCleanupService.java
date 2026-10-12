package com.fruitvyapar.service;

import com.fruitvyapar.entity.FruitListing;
import com.fruitvyapar.repository.FruitListingRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FruitListingCleanupService {

    private static final Logger log = LoggerFactory.getLogger(FruitListingCleanupService.class);

    @Autowired
    private FruitListingRepository fruitListingRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // Run automatically on startup
    @PostConstruct
    public void onStartup() {
        cleanupExpiredListings();
    }

    // Run every hour to automatically delete listings older than 2 days
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredListings() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(2);
            log.info("Running automated 2-day cleanup for listings created before: {}", cutoff);

            List<FruitListing> expiredListings = fruitListingRepository.findByCreatedAtBefore(cutoff);
            if (expiredListings.isEmpty()) {
                log.info("No expired listings found older than 2 days.");
                return;
            }

            int fileCount = 0;
            for (FruitListing listing : expiredListings) {
                if (listing.getImageUrl() != null && !listing.getImageUrl().trim().isEmpty()) {
                    fileStorageService.deleteFile(listing.getImageUrl());
                    fileCount++;
                }
                if (listing.getVideoUrl() != null && !listing.getVideoUrl().trim().isEmpty()) {
                    fileStorageService.deleteFile(listing.getVideoUrl());
                    fileCount++;
                }
            }

            int deletedCount = fruitListingRepository.deleteExpiredListings(cutoff);
            log.info("Successfully deleted {} expired fruit listings (and {} media files) older than 2 days from database.", deletedCount, fileCount);
        } catch (Exception ex) {
            log.error("Error during automated deletion of expired fruit listings: {}", ex.getMessage(), ex);
        }
    }
}
