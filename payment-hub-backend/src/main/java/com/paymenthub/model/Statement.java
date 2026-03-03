package com.paymenthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "statements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Statement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, unique = true)
    private String transactionReference;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false)
    private LocalDate valueDate;

    private String description;

    @Column(precision = 19, scale = 4)
    private BigDecimal debitAmount;

    @Column(precision = 19, scale = 4)
    private BigDecimal creditAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @Column(nullable = false)
    private String transactionType; // DEBIT, CREDIT

    private String channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
