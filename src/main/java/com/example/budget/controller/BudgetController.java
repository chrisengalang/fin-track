package com.example.budget.controller;

import com.example.budget.model.Budget;
import com.example.budget.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<Budget> getBudget(
            @RequestParam(required = false) Long userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        Long effectiveUserId = (userId != null) ? userId : 1L;
        return budgetService.getBudget(effectiveUserId, month, year)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Budget createBudget(@RequestBody Budget budgetRequest) {
        // Here we expect month, year, and maybe user.
        // For simplicity, we can trust the body or use params to create.
        // Let's assume the body has user, month, year.
        if (budgetRequest.getUser() == null || budgetRequest.getUser().getId() == null) {
            // default user
            com.example.budget.model.User u = new com.example.budget.model.User();
            u.setId(1L);
            budgetRequest.setUser(u);
        }
        return budgetService.createBudget(budgetRequest.getUser().getId(), budgetRequest.getMonth(),
                budgetRequest.getYear());
    }

    @PostMapping("/copy-previous")
    public Budget copyPrevious(@RequestBody Budget budgetRequest) {
        Long effectiveUserId = (budgetRequest.getUser() != null && budgetRequest.getUser().getId() != null)
                ? budgetRequest.getUser().getId()
                : 1L;
        return budgetService.copyItemsFromPreviousMonth(effectiveUserId, budgetRequest.getMonth(),
                budgetRequest.getYear());
    }
}
