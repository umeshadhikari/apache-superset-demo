package com.paymenthub.service;

import com.paymenthub.dto.SupersetColumnDto;
import com.paymenthub.dto.SupersetDashboardDto;
import com.paymenthub.dto.SupersetTableDto;
import com.paymenthub.model.SupersetDashboard;
import com.paymenthub.repository.SupersetDashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupersetService {

    private final DataSource dataSource;
    private final SupersetDashboardRepository dashboardRepository;

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

    public SupersetDashboard saveDashboard(SupersetDashboardDto dto) {
        String tables = dto.getTables() != null
                ? String.join(",", dto.getTables())
                : "";
        SupersetDashboard dashboard = SupersetDashboard.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .config(dto.getConfig())
                .tables(tables)
                .build();
        return dashboardRepository.save(dashboard);
    }

    public List<SupersetDashboardDto> getDashboards() {
        return dashboardRepository.findAll().stream().map(d -> SupersetDashboardDto.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .config(d.getConfig())
                .tables(d.getTables() != null && !d.getTables().isBlank()
                        ? Arrays.asList(d.getTables().split(","))
                        : List.of())
                .createdAt(d.getCreatedAt())
                .build())
                .collect(Collectors.toList());
    }
}
