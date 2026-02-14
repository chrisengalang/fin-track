package com.example.budget.controller;

import com.example.budget.model.BudgetItem;
import com.example.budget.service.BudgetItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget-items")
public class BudgetItemController {

    @Autowired
    private BudgetItemService budgetItemService;

    @GetMapping("/budget/{budgetId}")
    public List<BudgetItem> getBudgetItems(@PathVariable Long budgetId) {
        return budgetItemService.findByBudget(budgetId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetItem> getBudgetItemById(@PathVariable Long id) {
        return budgetItemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public BudgetItem createBudgetItem(@RequestBody BudgetItem budgetItem) {
        return budgetItemService.save(budgetItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetItem> updateBudgetItem(@PathVariable Long id, @RequestBody BudgetItem budgetItem) {
        return budgetItemService.findById(id)
                .map(existingItem -> {
                    existingItem.setName(budgetItem.getName());
                    existingItem.setAmount(budgetItem.getAmount());
                    return ResponseEntity.ok(budgetItemService.save(existingItem));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudgetItem(@PathVariable Long id) {
        budgetItemService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
