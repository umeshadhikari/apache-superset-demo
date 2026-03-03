package com.paymenthub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentStatusUpdateDto {

    @NotBlank
    private String paymentReference;

    @NotBlank
    private String status;

    private String errorCode;
    private String errorMessage;
}
