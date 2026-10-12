package com.fruitvyapar.dto;

public class VerifyOtpRequest {
    private String phoneNumber;
    private String email;
    private String otp;

    public String getPhoneNumber() { return phoneNumber; }
    public String getEmail() { return email; }
    public String getOtp() { return otp; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setEmail(String email) { this.email = email; }
    public void setOtp(String otp) { this.otp = otp; }
}
