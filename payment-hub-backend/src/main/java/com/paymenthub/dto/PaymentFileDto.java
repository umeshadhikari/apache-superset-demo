package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFileDto {

    private Long id;
    private String fileName;
    private String fileReference;
    private String fileType;
    private String status;
    private BigDecimal totalAmount;
    private Integer totalCount;
    private String currency;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
