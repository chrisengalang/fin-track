package com.example.budget.service;

import com.example.budget.model.Transaction;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.model.BudgetItem;
import com.example.budget.repository.BudgetItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactions(Long userId, Integer month, Integer year) {
        if (month != null && year != null) {
            java.time.LocalDate startDate = java.time.LocalDate.of(year, month, 1);
            java.time.LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        }
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> findByUserId(Long userId) {
        return getTransactions(userId, null, null);
    }

    public List<Transaction> findByBudgetItemId(Long budgetItemId) {
        return transactionRepository.findByBudgetItem_Id(budgetItemId);
    }

    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }

    @Autowired
    private com.example.budget.repository.CategoryRepository categoryRepository;

    @Autowired
    private BudgetItemRepository budgetItemRepository;

    public Transaction save(Transaction transaction) {
        if (transaction.getBudgetItem() != null && transaction.getBudgetItem().getId() != null) {
            BudgetItem budgetItem = budgetItemRepository.findById(transaction.getBudgetItem().getId())
                    .orElseThrow(() -> new RuntimeException("BudgetItem not found"));

            // If category is missing or has no ID, try to find/create one based on budget
            // item name
            if (transaction.getCategory() == null || transaction.getCategory().getId() == null) {
                com.example.budget.model.Category category = categoryRepository.findByName(budgetItem.getName());
                if (category == null) {
                    category = new com.example.budget.model.Category();
                    category.setName(budgetItem.getName());
                    category.setType("Expense"); // Default
                    categoryRepository.save(category);
                }
                transaction.setCategory(category);
            }
            transaction.setBudgetItem(budgetItem);
        }

        return transactionRepository.save(transaction);
    }

    public void deleteById(Long id) {
        transactionRepository.deleteById(id);
    }
}
