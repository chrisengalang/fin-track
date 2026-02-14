package com.example.budget.repository;

import com.example.budget.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndDateBetween(Long userId, java.time.LocalDate startDate,
            java.time.LocalDate endDate);

    List<Transaction> findByBudgetItem_Id(Long budgetItemId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.budgetItem.id = :budgetItemId")
    BigDecimal sumAmountByBudgetItemId(@Param("budgetItemId") Long budgetItemId);
}
