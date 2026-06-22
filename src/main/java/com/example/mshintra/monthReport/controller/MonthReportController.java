package com.example.mshintra.monthReport.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.monthReport.dto.CashFlowDto;
import com.example.mshintra.monthReport.service.MonthReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/monthReport")
public class MonthReportController {

    private final MonthReportService monthReportService;

    @GetMapping("/cashFlow.do")
    public String cashFlow() {
        return "jsp/monthReport/cashFlow";
    }

    @ResponseBody
    @GetMapping("/selectCashFlowList.do")
    public List<CashFlowDto> selectCashFlowList(SearchDto searchDto) {
        return monthReportService.selectCashFlowList(searchDto);
    }
}