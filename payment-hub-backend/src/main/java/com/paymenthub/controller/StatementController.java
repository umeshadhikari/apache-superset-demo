package com.paymenthub.controller;

import com.paymenthub.model.Statement;
import com.paymenthub.service.StatementService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statements")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class StatementController {

    private final StatementService statementService;

    @GetMapping("/{accountId}")
    public ResponseEntity<List<Statement>> getStatements(
            @PathVariable Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        if (fromDate != null && toDate != null) {
            return ResponseEntity.ok(statementService.getStatementsByAccountAndDateRange(accountId, fromDate, toDate));
        }
        return ResponseEntity.ok(statementService.getStatementsByAccount(accountId));
    }
}
