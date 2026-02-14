package com.example.budget.config;

import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User user = new User();
                user.setUsername("testuser");
                user.setEmail("test@example.com");
                user.setPassword("password"); // In real app, encode this
                userRepository.save(user);
                System.out.println("Default user created: testuser");
            }
        };
    }
}
