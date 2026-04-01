package com.example.mshintra.approval.controller;

import com.example.mshintra.approval.dto.ApprovalDetailDto;
import com.example.mshintra.approval.dto.ApprovalDetailFCDto;
import com.example.mshintra.approval.dto.ApprovalDetailORDto;
import com.example.mshintra.approval.dto.ApprovalDto;
import com.example.mshintra.approval.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/approval")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/approvalHome.do")
    public String approvalHome() {
        return "jsp/approval/approvalHome";
    }

    @GetMapping("/approvalList.do")
    public String approvalList(@RequestParam(required = false) String ccFlag, Model model) {
        model.addAttribute("ccFlag", ccFlag);
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

    // 상세(문서 별 HTML 반환)
    @GetMapping(value = "/approvalDetail.do", produces = "text/html; charset=UTF-8")
    public String approvalDetail(@RequestParam("ccCode") String ccCode,
                                 @RequestParam("ccFlag") String ccFlag,
                                 @RequestParam(value = "ymd", required = false, defaultValue = "") String ymd,
                                 @RequestParam(value = "fcNum", required = false, defaultValue = "") String fcNum,
                                 @RequestParam(value = "ccSeq", required = false, defaultValue = "") Integer ccSeq,
                                 Model model) {

        String flag = ccFlag == null ? "" : ccFlag.trim().toUpperCase();
        ApprovalDetailDto detail;
        detail = approvalService.getApprovalDetail(ccCode, ccFlag);

        //기안 공문일때
        if ("FC".equals(flag)) {
            List<ApprovalDetailFCDto> fcDetail = approvalService.getApprovalFcDetail(ccCode, flag, ymd, fcNum, ccSeq);
            model.addAttribute("fcDetail", fcDetail);
        } else if ("OR".equals(flag)) {
            List<ApprovalDetailORDto> orDetail = approvalService.getApprovalOrDetail(ccCode, ccFlag);
            model.addAttribute("orDetail", orDetail);
        }

        String bodyPage = "/WEB-INF/views/jsp/approval/detail/approvalDetail.jsp";

        //전자결재 분기처리
        if ("OF".equals(flag)
                || "IO".equals(flag)
                || "OR".equals(flag)
                || "FC".equals(flag)) {
            bodyPage = "/WEB-INF/views/jsp/approval/detail/approval" + flag + ".jsp";
        }

        model.addAttribute("detail", detail);
        model.addAttribute("ccCode", ccCode);
        model.addAttribute("ccFlag", flag);
        model.addAttribute("bodyPage", bodyPage);

        return "jsp/approval/detail/approvalDetailLayout";
    }
}
