package com.paymenthub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymenthub.dto.SupersetDashboardDto;
import com.paymenthub.model.SupersetDashboard;
import com.paymenthub.repository.SupersetDashboardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupersetServiceTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private SupersetDashboardRepository dashboardRepository;

    private SupersetService supersetService;

    @BeforeEach
    void setUp() {
        supersetService = new SupersetService(dataSource, dashboardRepository, new ObjectMapper());
    }

    // ── ALLOWED_TABLES constant ───────────────────────────────────────────

    @Test
    void allowedTables_containsAllDomainTables() {
        assertTrue(SupersetService.ALLOWED_TABLES.contains("payments"));
        assertTrue(SupersetService.ALLOWED_TABLES.contains("status_feedback"));
        assertTrue(SupersetService.ALLOWED_TABLES.contains("dashboards"));
        assertTrue(SupersetService.ALLOWED_TABLES.contains("statements"));
    }

    @Test
    void allowedTables_doesNotContainSystemTables() {
        assertFalse(SupersetService.ALLOWED_TABLES.contains("ab_user"));
        assertFalse(SupersetService.ALLOWED_TABLES.contains("flyway_schema_history"));
        assertFalse(SupersetService.ALLOWED_TABLES.contains("databasechangelog"));
    }

    // ── saveDashboard – table validation ─────────────────────────────────

    @Test
    void saveDashboard_throwsIllegalArgument_whenDisallowedTableUsed() {
        SupersetDashboardDto dto = SupersetDashboardDto.builder()
                .dashboardName("Test")
                .selectedTables(List.of("ab_user"))
                .build();

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> supersetService.saveDashboard(dto));

        assertTrue(ex.getMessage().contains("ab_user"));
        assertTrue(ex.getMessage().contains("Allowed tables"));
    }

    @Test
    void saveDashboard_throwsIllegalArgument_whenMixedTablesIncludeDisallowed() {
        SupersetDashboardDto dto = SupersetDashboardDto.builder()
                .dashboardName("Test")
                .selectedTables(List.of("payments", "flyway_schema_history"))
                .build();

        assertThrows(IllegalArgumentException.class, () -> supersetService.saveDashboard(dto));
    }

    @Test
    void saveDashboard_succeeds_whenAllTablesAreAllowed() {
        SupersetDashboard savedEntity = SupersetDashboard.builder()
                .id(1L)
                .name("Valid")
                .tables("payments,statements")
                .config("{}")
                .createdAt(LocalDateTime.now())
                .build();
        when(dashboardRepository.save(any())).thenReturn(savedEntity);

        SupersetDashboardDto dto = SupersetDashboardDto.builder()
                .dashboardName("Valid")
                .selectedTables(List.of("payments", "statements"))
                .build();

        SupersetDashboardDto result = supersetService.saveDashboard(dto);
        assertEquals("Valid", result.getDashboardName());
        assertEquals(List.of("payments", "statements"), result.getSelectedTables());
    }

    @Test
    void saveDashboard_succeeds_whenNoTablesProvided() {
        SupersetDashboard savedEntity = SupersetDashboard.builder()
                .id(2L)
                .name("Empty Tables")
                .tables("")
                .config("{}")
                .createdAt(LocalDateTime.now())
                .build();
        when(dashboardRepository.save(any())).thenReturn(savedEntity);

        SupersetDashboardDto dto = SupersetDashboardDto.builder()
                .dashboardName("Empty Tables")
                .selectedTables(List.of())
                .build();

        SupersetDashboardDto result = supersetService.saveDashboard(dto);
        assertEquals("Empty Tables", result.getDashboardName());
        assertTrue(result.getSelectedTables().isEmpty());
    }
}
