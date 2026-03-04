package com.paymenthub.service;

import com.paymenthub.dto.DailyStatDto;
import com.paymenthub.dto.DashboardStatsDto;
import com.paymenthub.dto.PaymentRequestDto;
import com.paymenthub.dto.PaymentStatusUpdateDto;
import com.paymenthub.model.Account;
import com.paymenthub.model.Payment;
import com.paymenthub.model.PaymentFile;
import com.paymenthub.repository.AccountRepository;
import com.paymenthub.repository.PaymentFileRepository;
import com.paymenthub.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final PaymentFileRepository paymentFileRepository;

    public List<Payment> getPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentByReference(String reference) {
        return paymentRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + reference));
    }

    @Transactional
    public Payment createPayment(PaymentRequestDto dto) {
        Account debit = accountRepository.findById(dto.getDebitAccountId())
                .orElseThrow(() -> new NoSuchElementException("Debit account not found: " + dto.getDebitAccountId()));
        Account credit = accountRepository.findById(dto.getCreditAccountId())
                .orElseThrow(() -> new NoSuchElementException("Credit account not found: " + dto.getCreditAccountId()));

        PaymentFile file = null;
        if (dto.getPaymentFileId() != null) {
            file = paymentFileRepository.findById(dto.getPaymentFileId())
                    .orElseThrow(() -> new NoSuchElementException("Payment file not found: " + dto.getPaymentFileId()));
        }

        Payment payment = Payment.builder()
                .paymentReference(dto.getPaymentReference())
                .debitAccount(debit)
                .creditAccount(credit)
                .paymentFile(file)
                .amount(dto.getAmount())
                .currency(dto.getCurrency())
                .status("PENDING")
                .paymentType(dto.getPaymentType())
                .channel(dto.getChannel())
                .description(dto.getDescription())
                .valueDate(dto.getValueDate())
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(String reference, PaymentStatusUpdateDto dto) {
        Payment payment = getPaymentByReference(reference);
        payment.setStatus(dto.getStatus());
        payment.setErrorCode(dto.getErrorCode());
        payment.setErrorMessage(dto.getErrorMessage());
        if ("COMPLETED".equals(dto.getStatus()) || "FAILED".equals(dto.getStatus())) {
            payment.setProcessedAt(LocalDateTime.now());
        }
        return paymentRepository.save(payment);
    }

    public DashboardStatsDto getPaymentStats() {
        long total = paymentRepository.count();
        long pending = paymentRepository.countByStatus("PENDING");
        long completed = paymentRepository.countByStatus("COMPLETED");
        long failed = paymentRepository.countByStatus("FAILED");
        long processing = paymentRepository.countByStatus("PROCESSING");

        BigDecimal totalAmount = paymentRepository.sumAllAmounts();
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;

        return DashboardStatsDto.builder()
                .totalPayments(total)
                .totalAmount(totalAmount)
                .pendingCount(pending)
                .completedCount(completed)
                .failedCount(failed)
                .processingCount(processing)
                .build();
    }

    public List<DailyStatDto> getDailyStats() {
        List<Object[]> rows = paymentRepository.findDailyStats();
        return rows.stream().map(row -> DailyStatDto.builder()
                .date(row[0] != null ? java.time.LocalDate.parse(row[0].toString()) : null)
                .status((String) row[1])
                .count(((Number) row[2]).longValue())
                .total(row[3] != null ? new java.math.BigDecimal(row[3].toString()) : java.math.BigDecimal.ZERO)
                .build()
        ).toList();
    }
}
