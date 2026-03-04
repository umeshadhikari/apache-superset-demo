package com.paymenthub.service;

import com.paymenthub.dto.AccountDto;
import com.paymenthub.model.Account;
import com.paymenthub.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public List<AccountDto> getAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public AccountDto getAccountById(Long id) {
        return toDto(accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + id)));
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountNumber));
    }

    @Transactional
    public AccountDto createAccount(AccountDto dto) {
        Account account = Account.builder()
                .accountNumber(dto.getAccountNumber())
                .accountName(dto.getAccountName())
                .bankCode(dto.getBankCode())
                .currency(dto.getCurrency())
                .balance(dto.getBalance())
                .accountType(dto.getAccountType())
                .status(dto.getStatus())
                .build();
        return toDto(accountRepository.save(account));
    }

    private AccountDto toDto(Account account) {
        return AccountDto.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .bankCode(account.getBankCode())
                .currency(account.getCurrency())
                .balance(account.getBalance())
                .accountType(account.getAccountType())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
