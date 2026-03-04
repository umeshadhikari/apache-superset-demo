package com.paymenthub.controller;

import com.paymenthub.dto.DailyStatDto;
import com.paymenthub.dto.DashboardStatsDto;
import com.paymenthub.dto.PaymentRequestDto;
import com.paymenthub.dto.PaymentStatusUpdateDto;
import com.paymenthub.model.Payment;
import com.paymenthub.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getPayments() {
        return ResponseEntity.ok(paymentService.getPayments());
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@Valid @RequestBody PaymentRequestDto dto) {
        return ResponseEntity.ok(paymentService.createPayment(dto));
    }

    @GetMapping("/{reference}")
    public ResponseEntity<Payment> getPaymentByReference(@PathVariable String reference) {
        return ResponseEntity.ok(paymentService.getPaymentByReference(reference));
    }

    @PutMapping("/{reference}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable String reference,
            @Valid @RequestBody PaymentStatusUpdateDto dto) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(reference, dto));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(paymentService.getPaymentStats());
    }

    @GetMapping("/daily-stats")
    public ResponseEntity<List<DailyStatDto>> getDailyStats() {
        return ResponseEntity.ok(paymentService.getDailyStats());
    }
}
