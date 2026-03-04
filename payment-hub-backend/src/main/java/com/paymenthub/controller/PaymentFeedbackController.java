package com.paymenthub.controller;

import com.paymenthub.model.PaymentFeedback;
import com.paymenthub.service.PaymentFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
// TODO [review]: @CrossOrigin here is redundant – CorsConfig already handles it globally. Remove.
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PaymentFeedbackController {

    private final PaymentFeedbackService feedbackService;

    @GetMapping("/{paymentReference}")
    public ResponseEntity<List<PaymentFeedback>> getFeedbackByPaymentReference(
            @PathVariable String paymentReference) {
        return ResponseEntity.ok(feedbackService.getFeedbackByPaymentReference(paymentReference));
    }

    // TODO [review]: Accept a dedicated FeedbackRequestDto instead of the JPA entity,
    //   and add @Valid so bean-validation annotations on the DTO are enforced.
    @PostMapping
    public ResponseEntity<PaymentFeedback> createFeedback(@RequestBody PaymentFeedback feedback) {
        return ResponseEntity.ok(feedbackService.createFeedback(feedback));
    }
}
