package com.example.mshintra.paystub.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDetailDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDto;
import com.example.mshintra.itemrequest.mapper.ItemRequestMapper;
import com.example.mshintra.paystub.dto.PayStubDto;
import com.example.mshintra.paystub.mapper.PayStubMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class PayStubService {

    private final PayStubMapper payStubMapper;

    @Transactional(readOnly = true)
    public PayStubDto selectPayStubDetail(SearchDto searchDto) {
        return payStubMapper.selectPayStubDetail(searchDto);
    }
}