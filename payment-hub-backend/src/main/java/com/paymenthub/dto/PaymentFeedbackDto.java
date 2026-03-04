package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFeedbackDto {

    private Long id;
    private String paymentReference;
    private String feedbackCode;
    private String feedbackMessage;
    private String feedbackStatus;
    private String externalReference;
    private String processedBy;
    private LocalDateTime createdAt;
}
