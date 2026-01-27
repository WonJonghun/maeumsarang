package com.example.mshintra.common.controller;

import com.example.mshintra.common.service.AttachFileService;
import com.example.mshintra.common.dto.AttachFileDto;
import com.example.mshintra.login.dto.LoginUserDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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

    // 다운로드나 뷰는 서비스에서 경로 호출후 FTP 서버에서 파일 가져옴
    @GetMapping("/download.do")
    public ResponseEntity<Resource> download(@RequestParam String afNum, @RequestParam int afSeq, HttpServletRequest request) throws Exception {
        return attachFileService.download(afNum, afSeq, request);
    }

    @GetMapping("/view.do")
    public ResponseEntity<Resource> view(@RequestParam String afNum, @RequestParam int afSeq, HttpServletRequest request) throws Exception {
        return attachFileService.view(afNum, afSeq, request);
    }

    //메인 프로필 이미지 호출
    @GetMapping(value = "/profileImage.do", produces = MediaType.IMAGE_JPEG_VALUE)
    public @ResponseBody byte[] profileImage(@AuthenticationPrincipal LoginUserDto loginUser) {
        if (loginUser == null || loginUser.getAfContent() == null || loginUser.getAfContent().length == 0)
            return new byte[0];
        return loginUser.getAfContent();
    }

    //이미지 호출
    @GetMapping("/blobImageRequest.do")
    public ResponseEntity<byte[]> blobImageRequest(@RequestParam String afNum) throws IOException {
        AttachFileDto dto = attachFileService.selectImageBlob(afNum, 1);

        // 없으면 기본 이미지
        if (dto == null || dto.getAfContent() == null || dto.getAfContent().length == 0) {
            ClassPathResource res = new ClassPathResource("static/images/emptyUser.png");
            byte[] fallback = res.getInputStream().readAllBytes();

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .cacheControl(CacheControl.maxAge(30, java.util.concurrent.TimeUnit.DAYS).cachePublic())
                    .body(fallback);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(30, java.util.concurrent.TimeUnit.DAYS).cachePublic())
                .body(dto.getAfContent());
    }


}
