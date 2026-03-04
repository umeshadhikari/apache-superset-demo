package com.paymenthub.controller;

import com.paymenthub.model.PaymentFile;
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
    public ResponseEntity<List<PaymentFile>> getPaymentFiles() {
        return ResponseEntity.ok(paymentFileService.getPaymentFiles());
    }

    @PostMapping
    public ResponseEntity<PaymentFile> createPaymentFile(@RequestBody PaymentFile paymentFile) {
        return ResponseEntity.ok(paymentFileService.createPaymentFile(paymentFile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentFile> getPaymentFileById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentFileService.getPaymentFileById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentFile> updateFileStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(paymentFileService.updateFileStatus(id, status));
    }
}
