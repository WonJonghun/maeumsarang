package com.example.mshintra.common.service;

import com.example.mshintra.common.mapper.AttachFileMapper;
import com.example.mshintra.common.dto.AttachFileDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttachFileService {

    private final AttachFileMapper attachFileMapper;

    @Value("${file.nas.base-dir:}")
    private String nasBaseDir;

    @Transactional(readOnly = true)
    public List<AttachFileDto> selectAttachList(String afNum) {
        if (afNum == null || afNum.isBlank()) return Collections.emptyList();
        return attachFileMapper.selectAttachList(afNum);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> download(String afNum, int afSeq, HttpServletRequest request) throws Exception {
        DownloadTarget t = resolveTarget(afNum, afSeq);
        String orgName = t.orgName;
        String safeOrgName = sanitizeFileName(orgName);
        String enc = UriUtils.encode(safeOrgName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        String fallback = toAsciiFallbackFileName(safeOrgName);
        return ResponseEntity.ok().contentType(t.contentType).contentLength(t.size)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fallback + "\"; filename*=UTF-8''" + enc)
                .header("X-Content-Type-Options", "nosniff").body(t.resource);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> view(String afNum, int afSeq, HttpServletRequest request) throws Exception {
        DownloadTarget t = resolveTarget(afNum, afSeq);
        if (!isImageFileName(t.orgName)) throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        String safeOrgName = sanitizeFileName(t.orgName);
        String enc = UriUtils.encode(safeOrgName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        String fallback = toAsciiFallbackFileName(safeOrgName);
        return ResponseEntity.ok().contentType(t.contentType).contentLength(t.size)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fallback + "\"; filename*=UTF-8''" + enc)
                .header("X-Content-Type-Options", "nosniff").body(t.resource);
    }

    private DownloadTarget resolveTarget(String afNum, int afSeq) throws Exception {
        if (afNum == null || afNum.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        AttachFileDto dto = attachFileMapper.selectAttachOne(afNum, afSeq);
        if (dto == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        String storedName = afNum + "." + String.format("%02d", afSeq);
        Path base = Paths.get(nasBaseDir).normalize();
        Path path = Paths.get(nasBaseDir, dto.getSaveYear(), dto.getSaveMonth(), storedName).normalize();
        if (!path.startsWith(base)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        if (!Files.exists(path)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        Resource res = new UrlResource(path.toUri());
        String orgName = (dto.getAfFileName() == null || dto.getAfFileName().isBlank()) ? storedName : dto.getAfFileName();
        String probe = Files.probeContentType(path);
        MediaType ct = (probe == null) ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(probe);
        ct = refineContentType(ct, orgName);
        return new DownloadTarget(res, Files.size(path), orgName, ct);
    }

    private MediaType refineContentType(MediaType detected, String fileName) {
        if (fileName == null || fileName.isBlank()) return detected;
        String n = fileName.toLowerCase();
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (n.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (n.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (n.endsWith(".bmp")) return MediaType.parseMediaType("image/bmp");
        if (n.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return detected;
    }

    private boolean isImageFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) return false;
        String n = fileName.toLowerCase();
        return n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png") || n.endsWith(".gif") || n.endsWith(".bmp") || n.endsWith(".webp");
    }

    private String sanitizeFileName(String name) {
        String v = (name == null) ? "" : name;
        v = v.replaceAll("[\\r\\n\"]", "").replace('\\', '_').replace('/', '_');
        return v.isBlank() ? "download" : v;
    }

    private String toAsciiFallbackFileName(String fileName) {
        String v = sanitizeFileName(fileName);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < v.length(); i++) {
            char c = v.charAt(i);
            if (c >= 32 && c <= 126) sb.append(c);
            else sb.append('_');
        }
        return sb.toString();
    }

    private static class DownloadTarget {
        private final Resource resource;
        private final long size;
        private final String orgName;
        private final MediaType contentType;

        private DownloadTarget(Resource resource, long size, String orgName, MediaType contentType) {
            this.resource = resource;
            this.size = size;
            this.orgName = orgName;
            this.contentType = contentType;
        }
    }

    @Transactional(readOnly = true)
    public AttachFileDto selectImageBlob(String afNum, int afSeq) {
        if (afNum == null || afNum.isBlank()) return null;
        return attachFileMapper.selectAttachOne(afNum, afSeq);
    }
}
