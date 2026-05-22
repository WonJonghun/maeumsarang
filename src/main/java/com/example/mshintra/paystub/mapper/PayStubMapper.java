package com.example.mshintra.paystub.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.paystub.dto.PayStubDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PayStubMapper {

    PayStubDto selectPayStubDetail(SearchDto searchDto);

    String selectPayStubRemark(SearchDto searchDto);

    String selectPayStubBankName(SearchDto searchDto);
}
