package com.fruitvyapar.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_login_logs")
public class UserLoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "login_time")
    private LocalDateTime loginTime;

    @Column(name = "ip_address")
    private String ipAddress;

    public UserLoginLog() {}

    public UserLoginLog(Long logId, User user, LocalDateTime loginTime, String ipAddress) {
        this.logId = logId;
        this.user = user;
        this.loginTime = loginTime;
        this.ipAddress = ipAddress;
    }

    public Long getLogId() { return logId; }
    public User getUser() { return user; }
    public LocalDateTime getLoginTime() { return loginTime; }
    public String getIpAddress() { return ipAddress; }

    public void setLogId(Long logId) { this.logId = logId; }
    public void setUser(User user) { this.user = user; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long logId;
        private User user;
        private LocalDateTime loginTime;
        private String ipAddress;

        public Builder logId(Long logId) { this.logId = logId; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder loginTime(LocalDateTime loginTime) { this.loginTime = loginTime; return this; }
        public Builder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }

        public UserLoginLog build() {
            return new UserLoginLog(logId, user, loginTime, ipAddress);
        }
    }
}
