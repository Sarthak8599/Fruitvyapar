package com.fruitvyapar.dto;

import com.fruitvyapar.entity.FruitListing;
import com.fruitvyapar.entity.ListingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FruitListingDto {

    private Long farmerId;
    private Long listingId;
    private String fruitName;
    private BigDecimal pricePerKg;
    private BigDecimal quantityKg;
    private String farmerPhoneNumber;
    private String whatsappNumber;
    private String whatsappLink;
    private String imageUrl;
    private String videoUrl;
    private Double latitude;
    private Double longitude;
    private String address;
    private Integer callsCount;
    private Integer editCount;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private String farmerName;

    public FruitListingDto() {}

    public Long getFarmerId() { return farmerId; }
    public Long getListingId() { return listingId; }
    public String getFruitName() { return fruitName; }
    public BigDecimal getPricePerKg() { return pricePerKg; }
    public BigDecimal getQuantityKg() { return quantityKg; }
    public String getFarmerPhoneNumber() { return farmerPhoneNumber; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public String getWhatsappLink() { return whatsappLink; }
    public String getImageUrl() { return imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getAddress() { return address; }
    public Integer getCallsCount() { return callsCount; }
    public Integer getEditCount() { return editCount; }
    public ListingStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getFarmerName() { return farmerName; }

    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }
    public void setFruitName(String fruitName) { this.fruitName = fruitName; }
    public void setPricePerKg(BigDecimal pricePerKg) { this.pricePerKg = pricePerKg; }
    public void setQuantityKg(BigDecimal quantityKg) { this.quantityKg = quantityKg; }
    public void setFarmerPhoneNumber(String farmerPhoneNumber) { this.farmerPhoneNumber = farmerPhoneNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    public void setWhatsappLink(String whatsappLink) { this.whatsappLink = whatsappLink; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setAddress(String address) { this.address = address; }
    public void setCallsCount(Integer callsCount) { this.callsCount = callsCount; }
    public void setEditCount(Integer editCount) { this.editCount = editCount; }
    public void setStatus(ListingStatus status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long listingId;
        private String fruitName;
        private BigDecimal pricePerKg;
        private BigDecimal quantityKg;
        private String farmerPhoneNumber;
        private String whatsappNumber;
        private String whatsappLink;
        private String imageUrl;
        private String videoUrl;
        private Double latitude;
        private Double longitude;
        private String address;
        private Integer callsCount;
        private Integer editCount;
        private ListingStatus status;
        private LocalDateTime createdAt;
        private String farmerName;

        public Builder listingId(Long listingId) { this.listingId = listingId; return this; }
        public Builder fruitName(String fruitName) { this.fruitName = fruitName; return this; }
        public Builder pricePerKg(BigDecimal pricePerKg) { this.pricePerKg = pricePerKg; return this; }
        public Builder quantityKg(BigDecimal quantityKg) { this.quantityKg = quantityKg; return this; }
        public Builder farmerPhoneNumber(String farmerPhoneNumber) { this.farmerPhoneNumber = farmerPhoneNumber; return this; }
        public Builder whatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; return this; }
        public Builder whatsappLink(String whatsappLink) { this.whatsappLink = whatsappLink; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder videoUrl(String videoUrl) { this.videoUrl = videoUrl; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder callsCount(Integer callsCount) { this.callsCount = callsCount; return this; }
        public Builder editCount(Integer editCount) { this.editCount = editCount; return this; }
        public Builder status(ListingStatus status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder farmerName(String farmerName) { this.farmerName = farmerName; return this; }

        public FruitListingDto build() {
            FruitListingDto dto = new FruitListingDto();
            dto.listingId = this.listingId;
            dto.fruitName = this.fruitName;
            dto.pricePerKg = this.pricePerKg;
            dto.quantityKg = this.quantityKg;
            dto.farmerPhoneNumber = this.farmerPhoneNumber;
            dto.whatsappNumber = this.whatsappNumber;
            dto.whatsappLink = this.whatsappLink;
            dto.imageUrl = this.imageUrl;
            dto.videoUrl = this.videoUrl;
            dto.latitude = this.latitude;
            dto.longitude = this.longitude;
            dto.address = this.address;
            dto.callsCount = this.callsCount;
            dto.editCount = this.editCount;
            dto.status = this.status;
            dto.createdAt = this.createdAt;
            dto.farmerName = this.farmerName;
            return dto;
        }
    }

    public static FruitListingDto fromEntity(FruitListing listing, boolean isLoggedIn) {
        String farmerName = listing.getFarmer() != null
                ? listing.getFarmer().getFirstName() + " " + listing.getFarmer().getLastName()
                : "Farmer";

        String rawPhone = listing.getFarmerPhoneNumber();
        String maskedPhone = maskPhoneNumber(rawPhone);

        if (!isLoggedIn) {
            return FruitListingDto.builder()
                    .listingId(listing.getListingId())
                    .fruitName(listing.getFruitName())
                    .pricePerKg(listing.getPricePerKg())
                    .quantityKg(listing.getQuantityKg())
                    .farmerPhoneNumber(maskedPhone)
                    .whatsappNumber(null)
                    .whatsappLink(null)
                    .imageUrl(listing.getImageUrl())
                    .videoUrl(listing.getVideoUrl())
                    .latitude(null)
                    .longitude(null)
                    .address("Location available after login")
                    .callsCount(listing.getCallsCount())
                    .editCount(listing.getEditCount())
                    .status(listing.getStatus())
                    .createdAt(listing.getCreatedAt())
                    .farmerName("Farmer")
                    .build();
        } else {
            String waNum = listing.getWhatsappNumber() != null ? listing.getWhatsappNumber() : rawPhone;
            String cleanWa = waNum != null ? waNum.replaceAll("\\D", "") : "";
            String waLink = !cleanWa.isEmpty()
                    ? "https://wa.me/91" + (cleanWa.length() == 10 ? cleanWa : cleanWa.substring(Math.max(0, cleanWa.length() - 10)))
                    : null;

            return FruitListingDto.builder()
                    .listingId(listing.getListingId())
                    .fruitName(listing.getFruitName())
                    .pricePerKg(listing.getPricePerKg())
                    .quantityKg(listing.getQuantityKg())
                    .farmerPhoneNumber(rawPhone)
                    .whatsappNumber(waNum)
                    .whatsappLink(waLink)
                    .imageUrl(listing.getImageUrl())
                    .videoUrl(listing.getVideoUrl())
                    .latitude(listing.getLatitude())
                    .longitude(listing.getLongitude())
                    .address(listing.getAddress())
                    .callsCount(listing.getCallsCount())
                    .editCount(listing.getEditCount())
                    .status(listing.getStatus())
                    .createdAt(listing.getCreatedAt())
                    .farmerName(farmerName)
                    .build();
        }
    }

    private static String maskPhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            return "**********";
        }
        String clean = phone.replaceAll("\\D", "");
        if (clean.length() >= 10) {
            String start = clean.substring(0, 2);
            String end = clean.substring(clean.length() - 3);
            return start + "*****" + end;
        } else if (clean.length() > 4) {
            return clean.substring(0, 2) + "*****" + clean.substring(clean.length() - 2);
        }
        return "**********";
    }
}
