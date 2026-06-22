package com.example.mshintra.monthReport.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.monthReport.dto.CashFlowDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MonthReportMapper {

    List<CashFlowDto> selectCashFlowList(SearchDto searchDto);
}