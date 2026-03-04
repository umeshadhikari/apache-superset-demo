package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight DTO representing a dashboard entry fetched from the Superset API
 * ({@code GET /api/v1/dashboard/}).  Used by the frontend to let users select or
 * auto-link a Superset UUID to a Payment Hub dashboard.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupersetRemoteDashboardDto {

    /** Superset embedded dashboard UUID (used by the Embedded SDK). */
    private String uuid;

    /** Human-readable title shown in the Superset UI. */
    private String title;
}
