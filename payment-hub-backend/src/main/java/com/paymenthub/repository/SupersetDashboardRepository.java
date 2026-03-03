package com.paymenthub.repository;

import com.paymenthub.model.SupersetDashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupersetDashboardRepository extends JpaRepository<SupersetDashboard, Long> {
}
