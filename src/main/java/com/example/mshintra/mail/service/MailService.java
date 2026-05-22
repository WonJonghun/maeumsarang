package com.example.mshintra.mail.service;

import com.example.mshintra.mail.dto.MailListDto;
import com.example.mshintra.mail.mapper.MailMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class MailService {

    private final MailMapper mailMapper;

    @Transactional(readOnly = true)
    public List<MailListDto> selectMailList(MailListDto dto) {
        return mailMapper.selectMailList(dto);
    }

    @Transactional
    public void updateMailView(MailListDto dto) {
        if (dto.getMaDate() == null) return;
        if (dto.getMaSeq() == null || dto.getMaSeq().isBlank()) return;
        if (dto.getSearchId() == null || dto.getSearchId().isBlank()) return;

        mailMapper.updateMailView(dto);
    }
}