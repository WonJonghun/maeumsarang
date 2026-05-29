package com.example.mshintra.approval.controller;

import com.example.mshintra.approval.dto.ApprovalDetailDto;
import com.example.mshintra.approval.dto.ApprovalDetailFCDto;
import com.example.mshintra.approval.dto.ApprovalDetailORDto;
import com.example.mshintra.approval.dto.ApprovalDto;
import com.example.mshintra.approval.service.ApprovalService;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.service.MenuService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RequiredArgsConstructor
@Controller
@RequestMapping("/approval")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final MenuService menuService;

    @GetMapping("/approvalHome.do")
    public String approvalHome() {
        return "jsp/approval/approvalHome";
    }

    @GetMapping("/approvalList.do")
    public String approvalList(@RequestParam(required = false) String ccFlag,
                               @RequestParam(required = false) String ccBaseKey,
                               @RequestParam(required = false) String ccHomeFlag,
                               @AuthenticationPrincipal LoginUserDto loginUser,
                               HttpSession session,
                               Model model) throws Exception {

        LinkedHashMap<String, String> approvalDocTypeMap = new LinkedHashMap<>();

        if (loginUser != null) {
            List<MenuDto> menuTree = menuService.selectMenuTree(loginUser.getIcCode(), "Mobile", session);

            if (menuTree != null && !menuTree.isEmpty()) {
                Deque<List<MenuDto>> stack = new ArrayDeque<>();
                stack.push(menuTree);

                while (!stack.isEmpty()) {
                    List<MenuDto> currentList = stack.pop();

                    for (MenuDto menu : currentList) {
                        List<MenuDto> children = menu.getChildren();

                        if (children == null || children.isEmpty()) {
                            continue;
                        }

                        boolean approvalGroup = false;

                        for (MenuDto child : children) {
                            String menuUrl = child.getCcMenu2() == null ? "" : child.getCcMenu2();
                            String winCode = child.getCcWinCode() == null ? "" : child.getCcWinCode();

                            if ("/approval/approvalHome.do".equals(menuUrl) || "w_elecsign_apply".equals(winCode)) {
                                approvalGroup = true;
                                break;
                            }
                        }

                        if (approvalGroup) {
                            for (MenuDto child : children) {
                                String baseKey = child.getCcBaseKey() == null ? "" : child.getCcBaseKey();
                                String menuName = child.getCcMenuName() == null ? "" : child.getCcMenuName();
                                String winCode = child.getCcWinCode() == null ? "" : child.getCcWinCode();

                                if (baseKey.isEmpty() || menuName.isEmpty()) {
                                    continue;
                                }

                                if ("w_elecsign_apply".equals(winCode) && "AA".equals(baseKey)) {
                                    continue;
                                }

                                approvalDocTypeMap.put(baseKey, menuName);
                            }
                            break;
                        }

                        stack.push(children);
                    }

                    if (!approvalDocTypeMap.isEmpty()) {
                        break;
                    }
                }
            }
        }

        model.addAttribute("ccFlag", ccFlag);
        model.addAttribute("ccHomeFlag", ccHomeFlag);
        model.addAttribute("approvalDocTypeJson", new ObjectMapper().writeValueAsString(approvalDocTypeMap));
        model.addAttribute("ccBaseKey", ccBaseKey);

        return "jsp/approval/approvalList";
    }

    @ResponseBody
    @GetMapping("/approvalFlowlist.do")
    public List<ApprovalDto> selectApprovalFlowlist(ApprovalDto searchDto) {
        return approvalService.selectApprovalFlowlist(searchDto);
    }

    @ResponseBody
    @GetMapping("/selectApprovalList.do")
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
            List<ApprovalDetailFCDto> fcDetail = approvalService.getApprovalFcDetail(ccCode, ccFlag, ymd, fcNum, ccSeq);
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

    @ResponseBody
    @PostMapping("/signApproval.do")
    public Map<String, Object> signApproval(@RequestParam("ccCode") String ccCode,
                                            @RequestParam("flag") String flag,
                                            @RequestParam(value = "rmk", required = false, defaultValue = "") String rmk,
                                            @AuthenticationPrincipal LoginUserDto loginUser) {

        Map<String, Object> result = new HashMap<>();

        if (loginUser == null) {
            result.put("success", false);
            result.put("message", "로그인 정보가 없습니다.");
            return result;
        }

        if (!"11".equals(flag) && !"12".equals(flag)) {
            result.put("success", false);
            result.put("message", "잘못된 요청입니다.");
            return result;
        }

        String resultCode = approvalService.signApproval(ccCode, loginUser.getIcCode(), flag, rmk);

        if ("ALREADY_SIGN".equals(resultCode)) {
            result.put("success", false);
            result.put("message", "이미 결재완료되었습니다.");
            return result;
        }

        if ("ALREADY_CANCEL".equals(resultCode)) {
            result.put("success", false);
            result.put("message", "이미 결재취소되었습니다.");
            return result;
        }

        if ("NEXT_ALREADY_SIGN".equals(resultCode)) {
            result.put("success", false);
            result.put("message", "다음 결재자가 이미 결재하여 취소할 수 없습니다.");
            return result;
        }

        if ("NOT_SIGN_USER".equals(resultCode)) {
            result.put("success", false);
            result.put("message", "결재자가 아닙니다.");
            return result;
        }

        if ("NOT_FOUND".equals(resultCode)) {
            result.put("success", false);
            result.put("message", "결재 문서를 찾을 수 없습니다.");
            return result;
        }

        if (!"OK".equals(resultCode)) {
            result.put("success", false);
            result.put("message", "처리할 수 없는 결재입니다.");
            return result;
        }

        result.put("success", true);
        result.put("message", "처리되었습니다.");
        return result;
    }
}
