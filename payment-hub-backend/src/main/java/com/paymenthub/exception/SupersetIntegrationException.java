package com.paymenthub.exception;

/**
 * Thrown when communication with the Apache Superset API fails.
 */
public class SupersetIntegrationException extends RuntimeException {

    public SupersetIntegrationException(String message) {
        super(message);
    }

    public SupersetIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
