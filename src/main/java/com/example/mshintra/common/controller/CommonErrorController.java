package com.example.mshintra.common.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/error")
public class CommonErrorController implements ErrorController {

    @RequestMapping
    public String error(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status == null) {
            return "jsp/error/error500";
        }

        int statusCode = Integer.parseInt(status.toString());

        if (statusCode == 404) {
            return "jsp/error/error404";
        }

        if (statusCode == 403) {
            return "jsp/error/error403";
        }

        return "jsp/error/error500";
    }

    @GetMapping("/403.do")
    public String error403() {
        return "jsp/error/error403";
    }
}