package com.fruitvyapar.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fruit_listings")
public class FruitListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Long listingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @Column(name = "fruit_name", nullable = false)
    private String fruitName;

    @Column(name = "price_per_kg")
    private BigDecimal pricePerKg;

    @Column(name = "quantity_kg")
    private BigDecimal quantityKg;

    @Column(name = "farmer_phone_number")
    private String farmerPhoneNumber;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "address")
    private String address;

    @Column(name = "calls_count")
    private Integer callsCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ListingStatus status = ListingStatus.AVAILABLE;

    @Column(name = "edit_count")
    private Integer editCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FruitListing() {}

    // Getters
    public Long getListingId() { return listingId; }
    public User getFarmer() { return farmer; }
    public String getFruitName() { return fruitName; }
    public BigDecimal getPricePerKg() { return pricePerKg; }
    public BigDecimal getQuantityKg() { return quantityKg; }
    public String getFarmerPhoneNumber() { return farmerPhoneNumber; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public String getImageUrl() { return imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getAddress() { return address; }
    public Integer getCallsCount() { return callsCount; }
    public Integer getEditCount() { return editCount; }
    public ListingStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setListingId(Long listingId) { this.listingId = listingId; }
    public void setFarmer(User farmer) { this.farmer = farmer; }
    public void setFruitName(String fruitName) { this.fruitName = fruitName; }
    public void setPricePerKg(BigDecimal pricePerKg) { this.pricePerKg = pricePerKg; }
    public void setQuantityKg(BigDecimal quantityKg) { this.quantityKg = quantityKg; }
    public void setFarmerPhoneNumber(String farmerPhoneNumber) { this.farmerPhoneNumber = farmerPhoneNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setAddress(String address) { this.address = address; }
    public void setCallsCount(Integer callsCount) { this.callsCount = callsCount; }
    public void setEditCount(Integer editCount) { this.editCount = editCount; }
    public void setStatus(ListingStatus status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long listingId;
        private User farmer;
        private String fruitName;
        private BigDecimal pricePerKg;
        private BigDecimal quantityKg;
        private String farmerPhoneNumber;
        private String whatsappNumber;
        private String imageUrl;
        private String videoUrl;
        private Double latitude;
        private Double longitude;
        private String address;
        private Integer callsCount = 0;
        private Integer editCount = 0;
        private ListingStatus status = ListingStatus.AVAILABLE;
        private LocalDateTime createdAt;

        public Builder listingId(Long v) { this.listingId = v; return this; }
        public Builder farmer(User v) { this.farmer = v; return this; }
        public Builder fruitName(String v) { this.fruitName = v; return this; }
        public Builder pricePerKg(BigDecimal v) { this.pricePerKg = v; return this; }
        public Builder quantityKg(BigDecimal v) { this.quantityKg = v; return this; }
        public Builder farmerPhoneNumber(String v) { this.farmerPhoneNumber = v; return this; }
        public Builder whatsappNumber(String v) { this.whatsappNumber = v; return this; }
        public Builder imageUrl(String v) { this.imageUrl = v; return this; }
        public Builder videoUrl(String v) { this.videoUrl = v; return this; }
        public Builder latitude(Double v) { this.latitude = v; return this; }
        public Builder longitude(Double v) { this.longitude = v; return this; }
        public Builder address(String v) { this.address = v; return this; }
        public Builder callsCount(Integer v) { this.callsCount = v; return this; }
        public Builder editCount(Integer v) { this.editCount = v; return this; }
        public Builder status(ListingStatus v) { this.status = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public FruitListing build() {
            FruitListing f = new FruitListing();
            f.listingId = this.listingId;
            f.farmer = this.farmer;
            f.fruitName = this.fruitName;
            f.pricePerKg = this.pricePerKg;
            f.quantityKg = this.quantityKg;
            f.farmerPhoneNumber = this.farmerPhoneNumber;
            f.whatsappNumber = this.whatsappNumber;
            f.imageUrl = this.imageUrl;
            f.videoUrl = this.videoUrl;
            f.latitude = this.latitude;
            f.longitude = this.longitude;
            f.address = this.address;
            f.callsCount = this.callsCount;
            f.editCount = this.editCount;
            f.status = this.status;
            f.createdAt = this.createdAt;
            return f;
        }
    }
}
