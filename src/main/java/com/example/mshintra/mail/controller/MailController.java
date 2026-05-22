package com.example.mshintra.mail.controller;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.mail.dto.MailListDto;
import com.example.mshintra.mail.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/mail")
public class MailController {

    private final MailService mailService;

    @GetMapping("/mailList.do")
    public String payStub() {
        return "jsp/mail/mailList";
    }

    @ResponseBody
    @GetMapping("/list.do")
    public List<MailListDto> selectMailList(@ModelAttribute MailListDto searchDto,
                                            @AuthenticationPrincipal LoginUserDto loginUser) {
        if (loginUser == null || loginUser.getIcCode() == null) {
            return Collections.emptyList();
        }

        searchDto.setSearchId(loginUser.getIcCode());
        return mailService.selectMailList(searchDto);
    }

    @ResponseBody
    @PostMapping("/view.do")
    public boolean updateMailView(@ModelAttribute MailListDto mailDto,
                                  @AuthenticationPrincipal LoginUserDto loginUser) {
        if (loginUser == null || loginUser.getIcCode() == null) {
            return false;
        }

        mailDto.setSearchId(loginUser.getIcCode());
        mailService.updateMailView(mailDto);
        return true;
    }
}
