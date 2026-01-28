package com.example.mshintra.approval.controller;

import com.example.mshintra.approval.dto.ApprovalDto;
import com.example.mshintra.approval.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/approval")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/approvalHome.do")
    public String approvalHome()  {
        return "jsp/approval/approvalHome";
    }

    @GetMapping("/approvalList.do")
    public String approvalList()  {
        return "jsp/approval/approvalList";
    }

    @ResponseBody
    @GetMapping("/approvalFlowlist.do")
    public List<ApprovalDto> selectApprovalFlowlist(ApprovalDto searchDto) {
        return approvalService.selectApprovalFlowlist(searchDto);
    }

    @ResponseBody
    @GetMapping("/list.do")
    public List<ApprovalDto> selectApprovalList(ApprovalDto searchDto) {
        return approvalService.selectApprovalList(searchDto);
    }
}
