package com.example.mshintra.notice.controller;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.notice.dto.PcNoticePageDto;
import com.example.mshintra.notice.dto.PcNoticeMenuDto;
import com.example.mshintra.notice.dto.PcNoticeSearchDto;
import com.example.mshintra.notice.service.PcNoticeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/pc/notice")
public class PcNoticeController {
    private final PcNoticeService pcNoticeService;

    @GetMapping("/board.do")
    public String board(@RequestParam(defaultValue = "1") int ccBaseKey,
                        @RequestParam(defaultValue = "false") boolean pcFrame,
                        @AuthenticationPrincipal LoginUserDto user, HttpSession session, Model model) {
        MenuDto menu = pcNoticeService.checkBoard(ccBaseKey, user.getIcCode(), session);
        model.addAttribute("baseKey", ccBaseKey);
        model.addAttribute("menuName", menu.getCcMenuName());
        model.addAttribute("startTab", "board");
        return pcFrame ? "pc/jsp/notice/noticeList" : "pc/jsp/common/workspace";
    }

    @ResponseBody
    @GetMapping("/menuList.do")
    public List<PcNoticeMenuDto> menuList(@AuthenticationPrincipal LoginUserDto user, HttpSession session) {
        return pcNoticeService.selectBoardMenus(user.getIcCode(), session);
    }

    @ResponseBody
    @GetMapping("/list.do")
    public PcNoticePageDto list(@ModelAttribute PcNoticeSearchDto search,
                               @AuthenticationPrincipal LoginUserDto user, HttpSession session) {
        return pcNoticeService.selectBoardPage(search, user.getIcCode(), session);
    }

    @GetMapping("/detailPopup.do")
    public String detail(@ModelAttribute PcNoticeSearchDto search,
                         @AuthenticationPrincipal LoginUserDto user, HttpSession session, Model model) {
        model.addAttribute("post", pcNoticeService.selectBoardDetail(search, user.getIcCode(), session));
        return "pc/jsp/notice/noticeDetail";
    }
}
