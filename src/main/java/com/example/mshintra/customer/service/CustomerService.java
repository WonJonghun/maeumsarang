package com.example.mshintra.customer.service;

import com.example.mshintra.customer.dto.CustomerDto;
import com.example.mshintra.customer.mapper.CustomerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CustomerService {

    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public CustomerDto selectCustomerDailyStats(CustomerDto searchDto) {
        return customerMapper.selectCustomerDailyStats(searchDto);
    }

    @Transactional(readOnly = true)
    public CustomerDto selectCustomerBedCount(CustomerDto searchDto) {
        return customerMapper.selectCustomerBedCount(searchDto);
    }

    @Transactional(readOnly = true)
    public CustomerDto selectEmergencyPatientCount(CustomerDto searchDto) {
        return customerMapper.selectEmergencyPatientCount(searchDto);
    }
}