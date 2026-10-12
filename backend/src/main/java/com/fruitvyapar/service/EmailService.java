package com.fruitvyapar.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:kisanvyapar44@gmail.com}")
    private String senderEmail;

    public boolean sendOtpEmail(String recipientEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(recipientEmail.trim());
        message.setSubject("KisanVyapar - Account Verification Code");
        message.setText("नमस्कार!\n\nKisanVyapar अकाऊंट पडताळणीसाठी तुमचा ६-अंकी OTP पासवर्ड आहे: " 
                       + otpCode + 
                       "\n\nहा कोड कोणासोबतही शेअर करू नका. हा OTP पुढील ५ मिनिटांसाठी वैध आहे.\n\nधन्यवाद,\nKisanVyapar टीम");
        if (mailSender != null) {
            try {
                mailSender.send(message);
                System.out.println("[INFO] Dynamic email OTP sent to: " + recipientEmail + " [OTP: " + otpCode + "]");
                return true;
            } catch (Exception e) {
                System.err.println("[WARN] Email dispatch failed for " + recipientEmail + ": " + e.getMessage() + " | [Generated OTP: " + otpCode + "]");
                return false;
            }
        } else {
            System.err.println("[WARN] JavaMailSender is null, cannot dispatch SMTP email to " + recipientEmail + " | [Generated OTP: " + otpCode + "]");
            return false;
        }
    }
}
