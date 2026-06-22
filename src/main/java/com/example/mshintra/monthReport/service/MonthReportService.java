package com.example.mshintra.monthReport.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.monthReport.dto.CashFlowDto;
import com.example.mshintra.monthReport.mapper.MonthReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class MonthReportService {

    private final MonthReportMapper monthReportMapper;

    @Transactional(readOnly = true)
    public List<CashFlowDto> selectCashFlowList(SearchDto searchDto) {
        return monthReportMapper.selectCashFlowList(searchDto);
    }
}