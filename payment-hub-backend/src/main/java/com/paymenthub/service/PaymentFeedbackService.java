package com.paymenthub.service;

import com.paymenthub.dto.PaymentFeedbackDto;
import com.paymenthub.model.Payment;
import com.paymenthub.model.PaymentFeedback;
import com.paymenthub.repository.PaymentFeedbackRepository;
import com.paymenthub.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentFeedbackService {

    private final PaymentFeedbackRepository feedbackRepository;
    private final PaymentRepository paymentRepository;

    public List<PaymentFeedbackDto> getFeedbackByPaymentReference(String reference) {
        Payment payment = paymentRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + reference));
        return feedbackRepository.findByPayment(payment).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PaymentFeedbackDto createFeedback(PaymentFeedbackDto dto) {
        Payment payment = paymentRepository.findByPaymentReference(dto.getPaymentReference())
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + dto.getPaymentReference()));
        PaymentFeedback feedback = PaymentFeedback.builder()
                .payment(payment)
                .feedbackCode(dto.getFeedbackCode())
                .feedbackMessage(dto.getFeedbackMessage())
                .feedbackStatus(dto.getFeedbackStatus())
                .externalReference(dto.getExternalReference())
                .processedBy(dto.getProcessedBy())
                .build();
        return toDto(feedbackRepository.save(feedback));
    }

    private PaymentFeedbackDto toDto(PaymentFeedback feedback) {
        return PaymentFeedbackDto.builder()
                .id(feedback.getId())
                .paymentReference(feedback.getPayment().getPaymentReference())
                .feedbackCode(feedback.getFeedbackCode())
                .feedbackMessage(feedback.getFeedbackMessage())
                .feedbackStatus(feedback.getFeedbackStatus())
                .externalReference(feedback.getExternalReference())
                .processedBy(feedback.getProcessedBy())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
