package com.paymenthub.repository;

import com.paymenthub.model.Account;
import com.paymenthub.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(String paymentReference);

    List<Payment> findByStatus(String status);

    List<Payment> findByPaymentType(String paymentType);

    List<Payment> findByChannel(String channel);

    List<Payment> findByDebitAccount(Account debitAccount);

    List<Payment> findByCreditAccount(Account creditAccount);

    long countByStatus(String status);

    @Query("SELECT SUM(p.amount) FROM Payment p")
    BigDecimal sumAllAmounts();

    @Query("SELECT CAST(p.createdAt as LocalDate) as date, p.status, COUNT(p) as count, SUM(p.amount) as total " +
           "FROM Payment p GROUP BY CAST(p.createdAt as LocalDate), p.status")
    List<Object[]> findDailyStats();
}
