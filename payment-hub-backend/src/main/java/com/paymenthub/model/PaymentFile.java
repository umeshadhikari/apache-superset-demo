package com.paymenthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, unique = true)
    private String fileReference;

    @Column(nullable = false)
    private String fileType; // BULK, SINGLE, BATCH

    @Column(nullable = false)
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED, REJECTED

    @Column(precision = 19, scale = 4)
    private BigDecimal totalAmount;

    private Integer totalCount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
