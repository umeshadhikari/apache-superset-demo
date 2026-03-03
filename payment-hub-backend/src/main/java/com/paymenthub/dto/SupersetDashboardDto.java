package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupersetDashboardDto {

    private Long id;
    private String dashboardName;
    private String description;
    private String chartType;
    private List<String> selectedTables;
    private String xAxisColumn;
    private String yAxisColumn;
    /** UUID of the corresponding dashboard in Apache Superset (used by the Embedded SDK). */
    private String supersetDashboardId;
    private LocalDateTime createdAt;
}
