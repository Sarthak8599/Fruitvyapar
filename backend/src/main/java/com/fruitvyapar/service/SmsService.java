package com.fruitvyapar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    @Value("${fast2sms.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendOtpSms(String phoneNumber, String otpCode) {
        String cleanPhone = phoneNumber.replaceAll("\\D", "");
        if (cleanPhone.length() > 10) {
            cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
        }

        String url = "https://www.fast2sms.com/dev/bulkV2";

        HttpHeaders headers = new HttpHeaders();
        headers.set("authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("variables_values", otpCode);
        body.put("route", "otp");
        body.put("numbers", cleanPhone);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            System.out.println("[INFO] Fast2SMS Response for " + cleanPhone + ": " + response.getBody() + " | [OTP: " + otpCode + "]");
            return response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().contains("\"status_code\":9");
        } catch (Exception e) {
            System.err.println("[ERROR] Fast2SMS dispatch failed for " + cleanPhone + ": " + e.getMessage() + " | [Generated OTP: " + otpCode + "]");
            return false;
        }
    }
}
