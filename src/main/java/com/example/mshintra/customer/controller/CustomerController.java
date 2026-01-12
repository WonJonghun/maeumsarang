package com.example.mshintra.customer.controller;

import com.example.mshintra.customer.dto.CustomerDto;
import com.example.mshintra.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/customer")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/dailyStats.do")
    public CustomerDto selectCustomerDailyStats(@ModelAttribute CustomerDto searchDto) {
        return customerService.selectCustomerDailyStats(searchDto);
    }
}
