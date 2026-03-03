package com.paymenthub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymenthub.dto.SupersetColumnDto;
import com.paymenthub.dto.SupersetDashboardDto;
import com.paymenthub.dto.SupersetTableDto;
import com.paymenthub.model.SupersetDashboard;
import com.paymenthub.repository.SupersetDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupersetService {

    private static final Logger log = LoggerFactory.getLogger(SupersetService.class);

    private final DataSource dataSource;
    private final SupersetDashboardRepository dashboardRepository;
    private final ObjectMapper objectMapper;

    public List<SupersetTableDto> getAvailableTables() {
        List<SupersetTableDto> tables = new ArrayList<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            ResultSet tableRs = meta.getTables(null, null, "%", new String[]{"TABLE"});
            while (tableRs.next()) {
                String tableName = tableRs.getString("TABLE_NAME");
                List<SupersetColumnDto> columns = new ArrayList<>();
                ResultSet colRs = meta.getColumns(null, null, tableName, "%");
                while (colRs.next()) {
                    columns.add(SupersetColumnDto.builder()
                            .columnName(colRs.getString("COLUMN_NAME"))
                            .dataType(colRs.getString("TYPE_NAME"))
                            .nullable("YES".equals(colRs.getString("IS_NULLABLE")))
                            .build());
                }
                tables.add(SupersetTableDto.builder()
                        .tableName(tableName)
                        .columns(columns)
                        .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve table metadata from database: " + e.getMessage(), e);
        }
        return tables;
    }

    public SupersetDashboardDto saveDashboard(SupersetDashboardDto dto) {
        String tables = dto.getSelectedTables() != null
                ? String.join(",", dto.getSelectedTables())
                : "";
        String config = buildConfig(dto);
        SupersetDashboard dashboard = SupersetDashboard.builder()
                .name(dto.getDashboardName())
                .description(dto.getDescription())
                .config(config)
                .tables(tables)
                .supersetDashboardId(dto.getSupersetDashboardId())
                .build();
        SupersetDashboard saved = dashboardRepository.save(dashboard);
        return toDto(saved);
    }

    public List<SupersetDashboardDto> getDashboards() {
        return dashboardRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void deleteDashboard(Long id) {
        dashboardRepository.deleteById(id);
    }

    private String buildConfig(SupersetDashboardDto dto) {
        try {
            Map<String, Object> configMap = new HashMap<>();
            if (dto.getChartType() != null) configMap.put("chartType", dto.getChartType());
            if (dto.getXAxisColumn() != null) configMap.put("xAxisColumn", dto.getXAxisColumn());
            if (dto.getYAxisColumn() != null) configMap.put("yAxisColumn", dto.getYAxisColumn());
            return objectMapper.writeValueAsString(configMap);
        } catch (Exception e) {
            log.warn("Failed to serialize dashboard config: {}", e.getMessage());
            return "{}";
        }
    }

    @SuppressWarnings("unchecked")
    private SupersetDashboardDto toDto(SupersetDashboard d) {
        String chartType = null;
        String xAxisColumn = null;
        String yAxisColumn = null;
        try {
            if (d.getConfig() != null && !d.getConfig().isBlank()) {
                Map<String, Object> configMap = objectMapper.readValue(d.getConfig(), Map.class);
                chartType = (String) configMap.get("chartType");
                xAxisColumn = (String) configMap.get("xAxisColumn");
                yAxisColumn = (String) configMap.get("yAxisColumn");
            }
        } catch (Exception ignored) {
            log.warn("Failed to parse config for dashboard id={}: {}", d.getId(), ignored.getMessage());
        }
        return SupersetDashboardDto.builder()
                .id(d.getId())
                .dashboardName(d.getName())
                .description(d.getDescription())
                .chartType(chartType)
                .selectedTables(d.getTables() != null && !d.getTables().isBlank()
                        ? Arrays.asList(d.getTables().split(","))
                        : List.of())
                .xAxisColumn(xAxisColumn)
                .yAxisColumn(yAxisColumn)
                .supersetDashboardId(d.getSupersetDashboardId())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
