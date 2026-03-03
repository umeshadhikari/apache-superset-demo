package com.paymenthub.service;

import com.paymenthub.model.Account;
import com.paymenthub.model.Statement;
import com.paymenthub.repository.AccountRepository;
import com.paymenthub.repository.StatementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StatementService {

    private final StatementRepository statementRepository;
    private final AccountRepository accountRepository;

    public List<Statement> getStatementsByAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));
        return statementRepository.findByAccount(account);
    }

    public List<Statement> getStatementsByAccountAndDateRange(Long accountId, LocalDate from, LocalDate to) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));
        return statementRepository.findByAccountAndTransactionDateBetween(account, from, to);
    }
}
