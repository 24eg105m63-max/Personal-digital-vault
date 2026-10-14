package com.digitalvault.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> details = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) details.put(error.getField(), error.getDefaultMessage());
        Map<String, Object> response = response(HttpStatus.BAD_REQUEST, "Validation failed", request);
        response.put("details", details);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, Object> response = response(HttpStatus.BAD_REQUEST, "Request constraints were not satisfied", request);
        response.put("details", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(response(HttpStatus.BAD_REQUEST, ex.getMessage(), request));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus()).body(response(ex.getStatus(), ex.getMessage(), request));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(response(HttpStatus.UNAUTHORIZED, "Invalid email or password", request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response(HttpStatus.FORBIDDEN, "Access denied", request));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        logger.error("Unexpected runtime exception while handling request", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
        logger.error("Unexpected exception while handling request", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", request));
    }

    private Map<String, Object> response(HttpStatus status, String message, HttpServletRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("message", message);
        body.put("path", request.getRequestURI());
        return body;
    }
}
