package com.paymenthub.service;

import com.paymenthub.dto.PaymentFileDto;
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

    public List<PaymentFileDto> getPaymentFiles() {
        return paymentFileRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public PaymentFileDto getPaymentFileById(Long id) {
        return toDto(paymentFileRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment file not found: " + id)));
    }

    @Transactional
    public PaymentFileDto createPaymentFile(PaymentFileDto dto) {
        PaymentFile paymentFile = PaymentFile.builder()
                .fileName(dto.getFileName())
                .fileReference(dto.getFileReference())
                .fileType(dto.getFileType())
                .status(dto.getStatus())
                .totalAmount(dto.getTotalAmount())
                .totalCount(dto.getTotalCount())
                .currency(dto.getCurrency())
                .createdBy(dto.getCreatedBy())
                .build();
        return toDto(paymentFileRepository.save(paymentFile));
    }

    @Transactional
    public PaymentFileDto updateFileStatus(Long id, String status) {
        PaymentFile file = paymentFileRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment file not found: " + id));
        file.setStatus(status);
        if ("COMPLETED".equals(status) || "FAILED".equals(status) || "REJECTED".equals(status)) {
            file.setProcessedAt(LocalDateTime.now());
        }
        return toDto(paymentFileRepository.save(file));
    }

    private PaymentFileDto toDto(PaymentFile file) {
        return PaymentFileDto.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileReference(file.getFileReference())
                .fileType(file.getFileType())
                .status(file.getStatus())
                .totalAmount(file.getTotalAmount())
                .totalCount(file.getTotalCount())
                .currency(file.getCurrency())
                .createdBy(file.getCreatedBy())
                .createdAt(file.getCreatedAt())
                .processedAt(file.getProcessedAt())
                .build();
    }
}
