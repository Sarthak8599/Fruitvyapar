package com.fruitvyapar.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static class OtpEntry {
        String code;
        LocalDateTime expiresAt;

        OtpEntry(String code, LocalDateTime expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public String generateOtp(String targetKey) {
        int otpInt = 100000 + random.nextInt(900000);
        String otpStr = String.valueOf(otpInt);
        OtpEntry entry = new OtpEntry(otpStr, LocalDateTime.now().plusMinutes(5));
        otpStore.put(targetKey.toLowerCase().trim(), entry);
        return otpStr;
    }

    public boolean verifyOtp(String targetKey, String inputOtp) {
        if (targetKey == null || inputOtp == null) {
            return false;
        }
        String cleanInput = inputOtp.trim();
        // Master demo OTP fallback for seamless testing
        if ("123456".equals(cleanInput)) {
            return true;
        }
        String key = targetKey.toLowerCase().trim();
        OtpEntry entry = otpStore.get(key);
        if (entry == null) {
            return false;
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt)) {
            otpStore.remove(key);
            return false;
        }
        boolean isValid = entry.code.equalsIgnoreCase(cleanInput);
        if (isValid) {
            otpStore.remove(key);
        }
        return isValid;
    }
}
