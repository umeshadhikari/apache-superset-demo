package com.paymenthub.repository;

import com.paymenthub.model.PaymentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentFileRepository extends JpaRepository<PaymentFile, Long> {

    List<PaymentFile> findByStatus(String status);

    List<PaymentFile> findByFileType(String fileType);
}
