package com.example.mshintra.notice.service;

import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.dto.NoticeMenuDto;
import com.example.mshintra.notice.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Service
public class NoticeService {

    private final NoticeMapper noticeMapper;

    @Transactional(readOnly = true)
    public List<NoticeDto> selectNoticeList(NoticeDto searchDto) {
        return noticeMapper.selectNoticeList(searchDto);
    }

    @Transactional(readOnly = true)
    public List<NoticeMenuDto> getNoticeMenuList() {
        final String hcCode = "IntGmenu";   // 메뉴 목록 코드
        List<NoticeMenuDto> noticeMenuList = noticeMapper.selectNoticeMenuList(hcCode);
        if (noticeMenuList == null || noticeMenuList.isEmpty()) {
            return Collections.emptyList();
        }

        for (NoticeMenuDto menuList : noticeMenuList) {
            String subHcCode = menuList.getHcColumNm();

            if (subHcCode == null || subHcCode.isBlank()) continue; // 하위 없을 시

            List<NoticeMenuDto> subMenuList = noticeMapper.selectNoticeMenuList(subHcCode);
            if (subMenuList != null && !subMenuList.isEmpty()) {
                menuList.getSubMenuList().addAll(subMenuList); // 있으면 2뎁스 주입
            }
        }
        return noticeMenuList;
    }

    @Transactional
    public void totalNoteView(String tvUk, String saCd) {
        if (tvUk == null || tvUk.isBlank()) return;
        if (saCd == null || saCd.isBlank()) return;

        noticeMapper.totalNoteView(tvUk, saCd);
    }
}
