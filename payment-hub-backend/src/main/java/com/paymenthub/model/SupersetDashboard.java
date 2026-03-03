package com.paymenthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "superset_dashboards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupersetDashboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(columnDefinition = "TEXT")
    private String config; // JSON config string

    private String tables; // comma-separated table names

    /** UUID of the corresponding dashboard in Apache Superset (for embedding). */
    private String supersetDashboardId;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
