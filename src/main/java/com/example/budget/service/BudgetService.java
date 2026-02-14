package com.example.budget.service;

import com.example.budget.model.Budget;
import com.example.budget.model.User;
import com.example.budget.repository.BudgetRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.example.budget.model.BudgetItem;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public Optional<Budget> getBudget(Long userId, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
                .map(this::populateMetrics);
    }

    public Budget createBudget(Long userId, Integer month, Integer year) {
        Optional<Budget> existing = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        if (existing.isPresent()) {
            return existing.get();
        }

        User user = new User();
        user.setId(userId); // Assuming user exists

        Budget budget = new Budget(user, month, year);
        return populateMetrics(budgetRepository.save(budget));
    }

    private Budget populateMetrics(Budget budget) {
        if (budget != null && budget.getBudgetItems() != null) {
            budget.getBudgetItems().forEach(item -> {
                BigDecimal spent = transactionRepository.sumAmountByBudgetItemId(item.getId());
                item.setSpent(spent != null ? spent : BigDecimal.ZERO);
            });
        }
        return budget;
    }

    public Budget save(Budget budget) {
        return budgetRepository.save(budget);
    }

    public List<Budget> findByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Budget copyItemsFromPreviousMonth(Long userId, Integer month, Integer year) {
        // 1. Calculate previous month/year
        int prevMonth = month - 1;
        int prevYear = year;
        if (prevMonth == 0) {
            prevMonth = 12;
            prevYear--;
        }

        // 2. Find source budget
        Optional<Budget> sourceOpt = budgetRepository.findByUserIdAndMonthAndYear(userId, prevMonth, prevYear);
        if (sourceOpt.isEmpty()) {
            throw new RuntimeException("No budget found for previous month to copy from.");
        }
        Budget source = sourceOpt.get();

        // 3. Find or create target budget
        Budget target = createBudget(userId, month, year);

        // 4. Copy items
        if (source.getBudgetItems() != null) {
            if (target.getBudgetItems() == null) {
                target.setBudgetItems(new ArrayList<>());
            }

            for (BudgetItem sourceItem : source.getBudgetItems()) {
                // Check if an item with the same name already exists in target to avoid
                // duplicates
                boolean exists = target.getBudgetItems().stream()
                        .anyMatch(ti -> ti.getName().equalsIgnoreCase(sourceItem.getName()));

                if (!exists) {
                    BudgetItem newItem = new BudgetItem();
                    newItem.setName(sourceItem.getName());
                    newItem.setAmount(sourceItem.getAmount());
                    newItem.setBudget(target);
                    target.getBudgetItems().add(newItem);
                }
            }
        }

        return populateMetrics(budgetRepository.save(target));
    }
}
