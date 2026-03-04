package com.paymenthub.controller;

import com.paymenthub.model.PaymentFeedback;
import com.paymenthub.service.PaymentFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class PaymentFeedbackController {

    private final PaymentFeedbackService feedbackService;

    @GetMapping("/{paymentReference}")
    public ResponseEntity<List<PaymentFeedback>> getFeedbackByPaymentReference(
            @PathVariable String paymentReference) {
        return ResponseEntity.ok(feedbackService.getFeedbackByPaymentReference(paymentReference));
    }

    @PostMapping
    public ResponseEntity<PaymentFeedback> createFeedback(@RequestBody PaymentFeedback feedback) {
        return ResponseEntity.ok(feedbackService.createFeedback(feedback));
    }
}
