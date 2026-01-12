package com.example.mshintra.menu.controller;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.service.MenuService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/menu")
public class MenuController {

    private final MenuService menuService;

    //메뉴 트리구조 호출
    @GetMapping("/tree.do")
    public List<MenuDto> selectMenuTree(@AuthenticationPrincipal LoginUserDto loginUser, @RequestParam(value = "keyword", required = false) String keyword, HttpSession session) {
        if (loginUser == null || loginUser.getIcCode() == null) return Collections.emptyList();
        return menuService.selectMenuTree(loginUser.getIcCode(), keyword, session);
    }
}
