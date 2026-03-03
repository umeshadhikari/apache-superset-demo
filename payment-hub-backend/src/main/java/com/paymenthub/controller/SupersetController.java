package com.paymenthub.controller;

import com.paymenthub.dto.SupersetDashboardDto;
import com.paymenthub.dto.SupersetTableDto;
import com.paymenthub.model.SupersetDashboard;
import com.paymenthub.service.SupersetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superset")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SupersetController {

    private final SupersetService supersetService;

    @GetMapping("/tables")
    public ResponseEntity<List<SupersetTableDto>> getTables() {
        return ResponseEntity.ok(supersetService.getAvailableTables());
    }

    @PostMapping("/dashboards")
    public ResponseEntity<SupersetDashboard> saveDashboard(@RequestBody SupersetDashboardDto dto) {
        return ResponseEntity.ok(supersetService.saveDashboard(dto));
    }

    @GetMapping("/dashboards")
    public ResponseEntity<List<SupersetDashboardDto>> getDashboards() {
        return ResponseEntity.ok(supersetService.getDashboards());
    }
}
