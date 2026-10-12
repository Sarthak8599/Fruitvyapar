package com.fruitvyapar.dto;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private Boolean isFirstTimeUser;
    private Long userId;
    private T data;

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, Boolean isFirstTimeUser, Long userId, T data) {
        this.success = success;
        this.message = message;
        this.isFirstTimeUser = isFirstTimeUser;
        this.userId = userId;
        this.data = data;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Boolean getIsFirstTimeUser() { return isFirstTimeUser; }
    public Long getUserId() { return userId; }
    public T getData() { return data; }

    public void setSuccess(boolean success) { this.success = success; }
    public void setMessage(String message) { this.message = message; }
    public void setIsFirstTimeUser(Boolean isFirstTimeUser) { this.isFirstTimeUser = isFirstTimeUser; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setData(T data) { this.data = data; }

    public static <T> Builder<T> builder() { return new Builder<>(); }

    public static class Builder<T> {
        private boolean success;
        private String message;
        private Boolean isFirstTimeUser;
        private Long userId;
        private T data;

        public Builder<T> success(boolean success) { this.success = success; return this; }
        public Builder<T> message(String message) { this.message = message; return this; }
        public Builder<T> isFirstTimeUser(Boolean isFirstTimeUser) { this.isFirstTimeUser = isFirstTimeUser; return this; }
        public Builder<T> userId(Long userId) { this.userId = userId; return this; }
        public Builder<T> data(T data) { this.data = data; return this; }

        public ApiResponse<T> build() {
            return new ApiResponse<>(success, message, isFirstTimeUser, userId, data);
        }
    }
}
