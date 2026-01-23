package com.example.mshintra.contact.controller;

import com.example.mshintra.contact.dto.ContactDto;
import com.example.mshintra.contact.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/contact")
public class ContactController {

    private final ContactService contactService;

    @GetMapping("/contact.do")
    public String employeeContact() {
        return "contactListTest";
    }

    @ResponseBody
    @GetMapping("/list.do")
    public List<ContactDto> selectContactList(@RequestParam("baseDt") String baseDt) {
        return contactService.selectContactList(baseDt);
    }
}
