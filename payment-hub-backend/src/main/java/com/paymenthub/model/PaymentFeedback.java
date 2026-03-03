package com.paymenthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_feedbacks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(nullable = false)
    private String feedbackCode;

    @Column(nullable = false)
    private String feedbackMessage;

    @Column(nullable = false)
    private String feedbackStatus; // SUCCESS, FAILED, PENDING, RETURNED

    private String externalReference;

    @Column(nullable = false)
    private String processedBy;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
