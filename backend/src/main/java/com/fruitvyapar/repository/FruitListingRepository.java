package com.fruitvyapar.repository;

import com.fruitvyapar.entity.FruitListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FruitListingRepository extends JpaRepository<FruitListing, Long> {

    @Query("SELECT f FROM FruitListing f WHERE f.farmer.userId = :userId AND f.createdAt >= :cutoff ORDER BY f.createdAt DESC")
    List<FruitListing> findByFarmerUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT f FROM FruitListing f WHERE f.farmer.userId = :userId ORDER BY f.createdAt DESC")
    List<FruitListing> findByFarmerUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM (" +
            "SELECT f.*, " +
            "(6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians(:buyerLat)) * cos(radians(COALESCE(f.latitude, :buyerLat))) * cos(radians(COALESCE(f.longitude, :buyerLng)) - radians(:buyerLng)) + sin(radians(:buyerLat)) * sin(radians(COALESCE(f.latitude, :buyerLat))))))) AS distance " +
            "FROM fruit_listings f " +
            "WHERE f.created_at >= :cutoff " +
            ") sub " +
            "WHERE (sub.distance <= :radiusKm OR sub.distance IS NULL) " +
            "ORDER BY sub.created_at DESC", nativeQuery = true)
    List<FruitListing> findNearbyListings(@Param("buyerLat") Double buyerLat,
                                         @Param("buyerLng") Double buyerLng,
                                         @Param("radiusKm") Double radiusKm,
                                         @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COUNT(f) FROM FruitListing f WHERE ((:userId IS NOT NULL AND f.farmer.userId = :userId) OR f.farmerPhoneNumber = :phone) AND f.createdAt >= :cutoff")
    long countRecentListingsByUserOrPhone(@Param("userId") Long userId, @Param("phone") String phone, @Param("cutoff") LocalDateTime cutoff);

    List<FruitListing> findByCreatedAtBefore(LocalDateTime cutoff);

    @Modifying
    @Transactional
    @Query("DELETE FROM FruitListing f WHERE f.createdAt < :cutoff")
    int deleteExpiredListings(@Param("cutoff") LocalDateTime cutoff);
}
