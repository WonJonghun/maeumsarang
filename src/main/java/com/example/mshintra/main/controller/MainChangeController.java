package com.example.mshintra.main.controller;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.main.service.MainChangeService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
public class MainChangeController {
    private final MainChangeService mainChangeService;

    @GetMapping(value = "/pc/main/changes.do", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter changes(@AuthenticationPrincipal LoginUserDto user,
                              @RequestParam String version,
                              @RequestHeader(value = "Last-Event-ID", defaultValue = "") String lastId,
                              HttpSession session, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Accel-Buffering", "no");
        return mainChangeService.connect(user.getIcCode(), lastId.isEmpty() ? version : lastId, session);
    }
}
