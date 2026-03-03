package com.paymenthub.service;

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

    public List<PaymentFeedback> getFeedbackByPaymentReference(String reference) {
        Payment payment = paymentRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + reference));
        return feedbackRepository.findByPayment(payment);
    }

    @Transactional
    public PaymentFeedback createFeedback(PaymentFeedback feedback) {
        return feedbackRepository.save(feedback);
    }
}
