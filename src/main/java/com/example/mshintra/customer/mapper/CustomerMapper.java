package com.example.mshintra.customer.mapper;

import com.example.mshintra.customer.dto.CustomerDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CustomerMapper {

    CustomerDto selectCustomerDailyStats(CustomerDto searchDto);

    CustomerDto selectCustomerBedCount(CustomerDto searchDto);

    CustomerDto selectEmergencyPatientCount(CustomerDto searchDto);
}