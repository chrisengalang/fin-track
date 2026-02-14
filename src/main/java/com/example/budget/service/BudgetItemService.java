package com.example.budget.service;

import com.example.budget.model.BudgetItem;
import com.example.budget.repository.BudgetItemRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetItemService {

    @Autowired
    private BudgetItemRepository budgetItemRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<BudgetItem> findByBudget(Long budgetId) {
        List<BudgetItem> items = budgetItemRepository.findByBudget_Id(budgetId);
        items.forEach(this::populateMetrics);
        return items;
    }

    public Optional<BudgetItem> findById(Long id) {
        return budgetItemRepository.findById(id).map(this::populateMetrics);
    }

    private BudgetItem populateMetrics(BudgetItem item) {
        // We need to update TransactionRepository to sum by BudgetItem
        BigDecimal spent = transactionRepository.sumAmountByBudgetItemId(item.getId());
        if (spent == null)
            spent = BigDecimal.ZERO;
        item.setSpent(spent);
        return item;
    }

    public BudgetItem save(BudgetItem item) {
        return budgetItemRepository.save(item);
    }

    public void deleteById(Long id) {
        budgetItemRepository.deleteById(id);
    }
}
