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
        CustomerDto customerDailyStats = customerService.selectCustomerDailyStats(searchDto);
        CustomerDto customerBedCount = customerService.selectCustomerBedCount(searchDto);

        if (customerDailyStats != null && customerBedCount != null) {
            customerDailyStats.setSrTo(customerBedCount.getSrTo());
        }

        return customerDailyStats;
    }
}
