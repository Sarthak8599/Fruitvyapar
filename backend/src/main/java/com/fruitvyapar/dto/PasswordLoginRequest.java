package com.fruitvyapar.dto;

public class PasswordLoginRequest {
    private String phoneNumber;
    private String email;
    private String password;

    public PasswordLoginRequest() {}

    public String getPhoneNumber() { return phoneNumber; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
}
