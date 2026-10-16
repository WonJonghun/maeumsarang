package com.example.mshintra.notice.dto;

import java.util.List;

public record PcNoticePageDto(List<NoticeDto> list, int total) {
}
