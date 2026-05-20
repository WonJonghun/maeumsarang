package com.example.mshintra.paystub.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.paystub.dto.PayStubDto;
import com.example.mshintra.paystub.service.PayStubService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/payStub")
public class PayStubController {

    private final PayStubService payStubService;

    @GetMapping("/payStub.do")
    public String payStub() {
        return "jsp/paystub/payStub";
    }

    @ResponseBody
    @GetMapping("/selectPayStubDetail.do")
    public PayStubDto selectPayStubDetail(SearchDto searchDto) {
        return payStubService.selectPayStubDetail(searchDto);
    }
}
