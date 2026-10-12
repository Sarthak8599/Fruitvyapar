package com.fruitvyapar.dto;

public class SendOtpRequest {
    private String phoneNumber;
    private String email;

    public String getPhoneNumber() { return phoneNumber; }
    public String getEmail() { return email; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setEmail(String email) { this.email = email; }
}
