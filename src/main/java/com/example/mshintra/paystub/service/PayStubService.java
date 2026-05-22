package com.example.mshintra.paystub.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.paystub.dto.PayStubDto;
import com.example.mshintra.paystub.mapper.PayStubMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PayStubService {

    private final PayStubMapper payStubMapper;

    @Value("${security.decrypt.key}")
    private String securityDecryptKey;

    @Transactional(readOnly = true)
    public PayStubDto selectPayStubDetail(SearchDto searchDto) {
        PayStubDto payStubDto = payStubMapper.selectPayStubDetail(searchDto);

        if (payStubDto != null) {
            searchDto.setSecurityDecryptKey(securityDecryptKey);
            payStubDto.setPrRmk(payStubMapper.selectPayStubRemark(searchDto));
            payStubDto.setIcBankname(payStubMapper.selectPayStubBankName(searchDto));
        }

        return payStubDto;
    }
}