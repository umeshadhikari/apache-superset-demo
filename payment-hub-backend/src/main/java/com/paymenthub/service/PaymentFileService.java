package com.paymenthub.service;

import com.paymenthub.model.PaymentFile;
import com.paymenthub.repository.PaymentFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentFileService {

    private final PaymentFileRepository paymentFileRepository;

    public List<PaymentFile> getPaymentFiles() {
        return paymentFileRepository.findAll();
    }

    public PaymentFile getPaymentFileById(Long id) {
        return paymentFileRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment file not found: " + id));
    }

    @Transactional
    public PaymentFile createPaymentFile(PaymentFile paymentFile) {
        return paymentFileRepository.save(paymentFile);
    }

    @Transactional
    public PaymentFile updateFileStatus(Long id, String status) {
        PaymentFile file = getPaymentFileById(id);
        file.setStatus(status);
        if ("COMPLETED".equals(status) || "FAILED".equals(status) || "REJECTED".equals(status)) {
            file.setProcessedAt(LocalDateTime.now());
        }
        return paymentFileRepository.save(file);
    }
}
