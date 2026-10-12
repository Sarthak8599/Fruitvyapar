package com.fruitvyapar.controller;

import com.fruitvyapar.dto.*;
import com.fruitvyapar.entity.Role;
import com.fruitvyapar.entity.User;
import com.fruitvyapar.entity.UserLoginLog;
import com.fruitvyapar.repository.UserLoginLogRepository;
import com.fruitvyapar.repository.UserRepository;
import com.fruitvyapar.service.EmailService;
import com.fruitvyapar.service.OtpService;
import com.fruitvyapar.service.SmsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")

public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLoginLogRepository userLoginLogRepository;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestBody(required = false) SendOtpRequest request,
                                                     @RequestParam(required = false) String phoneNumber,
                                                     @RequestParam(required = false) String email) {
        String targetPhone = (request != null && request.getPhoneNumber() != null) ? request.getPhoneNumber() : phoneNumber;
        String targetEmail = (request != null && request.getEmail() != null) ? request.getEmail() : email;

        if ((targetPhone == null || targetPhone.trim().isEmpty()) && (targetEmail == null || targetEmail.trim().isEmpty())) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Please provide either a phone number or email address")
                    .build());
        }

        boolean isEmail = targetEmail != null && !targetEmail.trim().isEmpty();
        String safeEmail = targetEmail != null ? targetEmail : "";
        String safePhone = targetPhone != null ? targetPhone : "";
        String targetKey = isEmail ? safeEmail.toLowerCase().trim() : safePhone.trim();

        // Generate 6-digit OTP and store in memory keyed by user identifier
        String otpCode = otpService.generateOtp(targetKey);

        boolean dispatchSent = true;
        if (isEmail) {
            dispatchSent = emailService.sendOtpEmail(targetKey, otpCode);
        } else {
            dispatchSent = smsService.sendOtpSms(targetKey, otpCode);
        }

        String msg;
        if (isEmail && !dispatchSent) {
            msg = "Email delivery pending. Please check your email or retry.";
        } else if (!isEmail && !dispatchSent) {
            msg = "SMS delivery pending. Please retry.";
        } else {
            msg = "Verification code sent successfully to " + targetKey;
        }

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message(msg)
                .build());
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<User>> verifyOtp(@RequestBody VerifyOtpRequest request,
                                                       HttpServletRequest httpRequest) {
        String targetKey = (request.getEmail() != null && !request.getEmail().trim().isEmpty())
                ? request.getEmail().toLowerCase().trim()
                : (request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);

        if (targetKey == null || request.getOtp() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("Missing target identifier or OTP code")
                    .build());
        }

        boolean isValid = otpService.verifyOtp(targetKey, request.getOtp());
        if (!isValid) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("Invalid or expired OTP code")
                    .build());
        }

        boolean isEmail = targetKey.contains("@");
        Optional<User> existingUserOpt = isEmail
                ? userRepository.findByEmail(targetKey)
                : userRepository.findByPhoneNumber(targetKey);

        User user;
        boolean isFirstTimeUser = false;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            if (user.getTermsAccepted() == null || !user.getTermsAccepted()) {
                isFirstTimeUser = true;
            }
        } else {
            isFirstTimeUser = true;
            user = User.builder()
                    .email(isEmail ? targetKey : null)
                    .phoneNumber(!isEmail ? targetKey : null)
                    .role(Role.BUYER)
                    .termsAccepted(false)
                    .createdAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
        }

        // Log login access
        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null) {
            clientIp = httpRequest.getRemoteAddr();
        }
        UserLoginLog log = UserLoginLog.builder()
                .user(user)
                .ipAddress(clientIp)
                .loginTime(LocalDateTime.now())
                .build();
        userLoginLogRepository.save(log);

        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("OTP verified successfully")
                .isFirstTimeUser(isFirstTimeUser)
                .userId(user.getUserId())
                .data(user)
                .build());
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<User>> completeProfile(@RequestBody CompleteProfileRequest request) {
        if (request.getUserId() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("User ID is required")
                    .build());
        }

        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("You must accept the Terms and Conditions to create your account.")
                    .build());
        }

        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("User not found")
                    .build());
        }

        User user = userOpt.get();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String cleanPhone = request.getPhoneNumber().trim();
            Optional<User> phoneOwner = userRepository.findByPhoneNumber(cleanPhone);
            if (phoneOwner.isPresent() && !phoneOwner.get().getUserId().equals(user.getUserId())) {
                return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                        .success(false)
                        .message("This mobile number (" + cleanPhone + ") is already registered with another account.")
                        .build());
            }
            user.setPhoneNumber(cleanPhone);
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String cleanEmail = request.getEmail().toLowerCase().trim();
            Optional<User> emailOwner = userRepository.findByEmail(cleanEmail);
            if (emailOwner.isPresent() && !emailOwner.get().getUserId().equals(user.getUserId())) {
                return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                        .success(false)
                        .message("This email (" + cleanEmail + ") is already registered with another account.")
                        .build());
            }
            user.setEmail(cleanEmail);
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(request.getPassword());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        user.setTermsAccepted(true);
        user.setTermsAcceptedAt(LocalDateTime.now());

        try {
            user = userRepository.save(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("Account creation failed: This mobile number or email is already in use.")
                    .build());
        }

        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("Account created and terms accepted successfully")
                .data(user)
                .build());
    }

    @PostMapping("/login-password")
    public ResponseEntity<ApiResponse<User>> loginPassword(@RequestBody PasswordLoginRequest request,
                                                           HttpServletRequest httpRequest) {
        String targetKey = (request.getEmail() != null && !request.getEmail().trim().isEmpty())
                ? request.getEmail().toLowerCase().trim()
                : (request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);

        if (targetKey == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("Target email/phone and password are required")
                    .build());
        }

        boolean isEmail = targetKey.contains("@");
        Optional<User> userOpt = isEmail
                ? userRepository.findByEmail(targetKey)
                : userRepository.findByPhoneNumber(targetKey);

        if (userOpt.isEmpty() || !request.getPassword().equals(userOpt.get().getPasswordHash())) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("Invalid phone/email or password")
                    .build());
        }

        User user = userOpt.get();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null) {
            clientIp = httpRequest.getRemoteAddr();
        }
        userLoginLogRepository.save(UserLoginLog.builder()
                .user(user)
                .ipAddress(clientIp)
                .loginTime(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("Logged in successfully")
                .isFirstTimeUser(false)
                .userId(user.getUserId())
                .data(user)
                .build());
    }

    @GetMapping("/user-profile")
    public ResponseEntity<ApiResponse<User>> getUserProfile(@RequestParam(required = false) Long userId,
                                                           @RequestParam(required = false) String email) {
        Optional<User> userOpt = Optional.empty();
        if (userId != null) {
            userOpt = userRepository.findById(userId);
        } else if (email != null && !email.trim().isEmpty()) {
            userOpt = userRepository.findByEmail(email.toLowerCase().trim());
        }

        if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getTermsAccepted()) && userOpt.get().getFirstName() != null) {
            return ResponseEntity.ok(ApiResponse.<User>builder()
                    .success(true)
                    .message("User profile fetched successfully")
                    .data(userOpt.get())
                    .build());
        } else {
            return ResponseEntity.status(404).body(ApiResponse.<User>builder()
                    .success(false)
                    .message("User not found or terms not accepted")
                    .build());
        }
    }

    @PostMapping("/update-profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody UpdateProfileRequest request) {
        if (request.getUserId() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("User ID is required")
                    .build());
        }

        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                    .success(false)
                    .message("User not found")
                    .build());
        }

        User user = userOpt.get();
        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String cleanPhone = request.getPhoneNumber().trim();
            Optional<User> phoneOwner = userRepository.findByPhoneNumber(cleanPhone);
            if (phoneOwner.isPresent() && !phoneOwner.get().getUserId().equals(user.getUserId())) {
                return ResponseEntity.badRequest().body(ApiResponse.<User>builder()
                        .success(false)
                        .message("This mobile number (" + cleanPhone + ") is already registered with another account.")
                        .build());
            }
            user.setPhoneNumber(cleanPhone);
        }

        user = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(user)
                .build());
    }
}
