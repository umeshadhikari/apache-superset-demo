package com.paymenthub.repository;

import com.paymenthub.model.Account;
import com.paymenthub.model.Statement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StatementRepository extends JpaRepository<Statement, Long> {

    List<Statement> findByAccount(Account account);

    List<Statement> findByAccountAndTransactionDateBetween(Account account, LocalDate from, LocalDate to);

    List<Statement> findByTransactionType(String transactionType);
}
