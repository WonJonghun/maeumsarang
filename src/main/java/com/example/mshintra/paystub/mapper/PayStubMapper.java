package com.example.mshintra.paystub.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDetailDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDto;
import com.example.mshintra.paystub.dto.PayStubDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PayStubMapper {

    PayStubDto selectPayStubDetail(SearchDto searchDto);
}
