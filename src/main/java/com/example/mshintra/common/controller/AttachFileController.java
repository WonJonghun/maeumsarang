package com.example.mshintra.common.controller;

import com.example.mshintra.common.service.AttachFileService;
import com.example.mshintra.common.dto.AttachFileDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/attach")
public class AttachFileController {

    private final AttachFileService attachFileService;

    @GetMapping("/list.do")
    public List<AttachFileDto> list(@RequestParam String afNum) {
        return attachFileService.selectAttachList(afNum);
    }

    @GetMapping("/download.do")
    public ResponseEntity<Resource> download(@RequestParam String afNum, @RequestParam int afSeq, HttpServletRequest request) throws Exception {
        return attachFileService.download(afNum, afSeq, request);
    }

    @GetMapping("/view.do")
    public ResponseEntity<Resource> view(@RequestParam String afNum, @RequestParam int afSeq, HttpServletRequest request) throws Exception {
        return attachFileService.view(afNum, afSeq, request);
    }
}
