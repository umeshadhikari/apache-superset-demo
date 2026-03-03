package com.paymenthub.repository;

import com.paymenthub.model.Payment;
import com.paymenthub.model.PaymentFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentFeedbackRepository extends JpaRepository<PaymentFeedback, Long> {

    List<PaymentFeedback> findByPayment(Payment payment);

    List<PaymentFeedback> findByFeedbackStatus(String feedbackStatus);
}
