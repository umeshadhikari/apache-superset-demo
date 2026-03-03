package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    private Long totalPayments;
    private BigDecimal totalAmount;
    private Long pendingCount;
    private Long completedCount;
    private Long failedCount;
    private Long processingCount;
}
