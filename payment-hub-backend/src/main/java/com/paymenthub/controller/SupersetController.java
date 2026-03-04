package com.paymenthub.controller;

import com.paymenthub.dto.SupersetDashboardDto;
import com.paymenthub.dto.SupersetGuestTokenResponse;
import com.paymenthub.dto.SupersetRemoteDashboardDto;
import com.paymenthub.dto.SupersetTableDto;
import com.paymenthub.service.SupersetApiService;
import com.paymenthub.service.SupersetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superset")
// TODO [review]: @CrossOrigin here is redundant – CorsConfig already handles it globally. Remove.
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class SupersetController {

    private final SupersetService supersetService;
    private final SupersetApiService supersetApiService;

    @GetMapping("/tables")
    public ResponseEntity<List<SupersetTableDto>> getTables() {
        return ResponseEntity.ok(supersetService.getAvailableTables());
    }

    @PostMapping("/dashboards")
    public ResponseEntity<?> saveDashboard(@RequestBody SupersetDashboardDto dto) {
        try {
            return ResponseEntity.ok(supersetService.saveDashboard(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dashboards")
    public ResponseEntity<List<SupersetDashboardDto>> getDashboards() {
        return ResponseEntity.ok(supersetService.getDashboards());
    }

    @DeleteMapping("/dashboards/{id}")
    public ResponseEntity<Void> deleteDashboard(@PathVariable Long id) {
        supersetService.deleteDashboard(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the list of dashboards available in Superset.
     * The frontend uses this to let the user pick or auto-link a UUID when building a dashboard.
     */
    @GetMapping("/superset-dashboards")
    public ResponseEntity<List<SupersetRemoteDashboardDto>> getSupersetDashboards() {
        return ResponseEntity.ok(supersetApiService.getRemoteDashboards());
    }

    /**
     * Generates a short-lived Superset guest token for the given embedded dashboard UUID.
     * The Angular frontend uses this token with the Superset Embedded SDK.
     *
     * @param dashboardId Superset embedded dashboard UUID
     * @param username    optional user identifier for audit/RLS (defaults to "guest")
     * @return guest token + Superset base URL
     */
    @GetMapping("/guest-token")
    public ResponseEntity<SupersetGuestTokenResponse> getGuestToken(
            @RequestParam String dashboardId,
            @RequestParam(defaultValue = "guest") String username) {
        SupersetGuestTokenResponse response = supersetApiService.getGuestToken(dashboardId, username, List.of());
        return ResponseEntity.ok(response);
    }
}
