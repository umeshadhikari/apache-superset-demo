package com.paymenthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_file_id")
    private PaymentFile paymentFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debit_account_id", nullable = false)
    private Account debitAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_account_id", nullable = false)
    private Account creditAccount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED, REJECTED, REVERSED

    @Column(nullable = false)
    private String paymentType; // DOMESTIC, INTERNATIONAL, INTER_BANK, INTRA_BANK

    @Column(nullable = false)
    private String channel; // WEB, MOBILE, API, BATCH

    private String description;

    private LocalDate valueDate;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    private String errorCode;
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
