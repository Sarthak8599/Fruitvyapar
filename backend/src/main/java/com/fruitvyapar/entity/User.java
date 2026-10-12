package com.fruitvyapar.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "phone_number", unique = true)
    private String phoneNumber;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "terms_accepted")
    private Boolean termsAccepted = false;

    @Column(name = "terms_accepted_at")
    private LocalDateTime termsAcceptedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @OneToMany(mappedBy = "farmer", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private java.util.List<FruitListing> listings = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private java.util.List<UserLoginLog> loginLogs = new java.util.ArrayList<>();

    public User() {}

    public User(Long userId, String phoneNumber, String email, String passwordHash,
                String firstName, String lastName, Role role,
                Boolean termsAccepted, LocalDateTime termsAcceptedAt,
                LocalDateTime createdAt, LocalDateTime lastLoginAt) {
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.termsAccepted = termsAccepted;
        this.termsAcceptedAt = termsAcceptedAt;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    // Getters
    public Long getUserId() { return userId; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Role getRole() { return role; }
    public Boolean getTermsAccepted() { return termsAccepted; }
    public LocalDateTime getTermsAcceptedAt() { return termsAcceptedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }

    // Setters
    public void setUserId(Long userId) { this.userId = userId; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setRole(Role role) { this.role = role; }
    public void setTermsAccepted(Boolean termsAccepted) { this.termsAccepted = termsAccepted; }
    public void setTermsAcceptedAt(LocalDateTime termsAcceptedAt) { this.termsAcceptedAt = termsAcceptedAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId;
        private String phoneNumber;
        private String email;
        private String passwordHash;
        private String firstName;
        private String lastName;
        private Role role;
        private Boolean termsAccepted = false;
        private LocalDateTime termsAcceptedAt;
        private LocalDateTime createdAt;
        private LocalDateTime lastLoginAt;

        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder termsAccepted(Boolean termsAccepted) { this.termsAccepted = termsAccepted; return this; }
        public Builder termsAcceptedAt(LocalDateTime termsAcceptedAt) { this.termsAcceptedAt = termsAcceptedAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder lastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; return this; }

        public User build() {
            return new User(userId, phoneNumber, email, passwordHash,
                    firstName, lastName, role, termsAccepted, termsAcceptedAt, createdAt, lastLoginAt);
        }
    }
}
