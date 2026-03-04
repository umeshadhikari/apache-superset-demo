package com.paymenthub.controller;

import com.paymenthub.dto.PaymentFileDto;
import com.paymenthub.service.PaymentFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-files")
@RequiredArgsConstructor
public class PaymentFileController {

    private final PaymentFileService paymentFileService;

    @GetMapping
    public ResponseEntity<List<PaymentFileDto>> getPaymentFiles() {
        return ResponseEntity.ok(paymentFileService.getPaymentFiles());
    }

    @PostMapping
    public ResponseEntity<PaymentFileDto> createPaymentFile(@RequestBody PaymentFileDto paymentFileDto) {
        return ResponseEntity.ok(paymentFileService.createPaymentFile(paymentFileDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentFileDto> getPaymentFileById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentFileService.getPaymentFileById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentFileDto> updateFileStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(paymentFileService.updateFileStatus(id, status));
    }
}
