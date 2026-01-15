package com.example.mshintra.notice.controller;

import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.dto.NoticeMenuDto;
import com.example.mshintra.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Controller
@RequestMapping("/notice")
public class NoticeController {

    private final NoticeService noticeService;

    @ResponseBody
    @GetMapping("/list.do")
    public List<NoticeDto> selectNoticeList(@ModelAttribute NoticeDto searchDto) {
        return noticeService.selectNoticeList(searchDto);
    }

    @ResponseBody
    @GetMapping("/menuList.do")
    public List<NoticeMenuDto> getNoticeMenuList() {
        return noticeService.getNoticeMenuList();
    }

    @ResponseBody
    @PostMapping("/totalNoteView.do")
    public Map<String, Object> totalNoteView(@RequestParam("tvUk") String tvUk,
                                             @RequestParam("saCd") String saCd) {

        noticeService.totalNoteView(tvUk, saCd);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }

    @GetMapping("/board.do")
    public String board(@RequestParam(value = "baseKey", required = false) String baseKey,
                        Model model) {

        model.addAttribute("baseKey", baseKey);
        return "jsp/notice/noticeList";
    }
}
