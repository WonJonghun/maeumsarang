package com.example.mshintra.notice.mapper;

import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.dto.NoticeMenuDto;
import com.example.mshintra.notice.dto.PcNoticeSearchDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoticeMapper {

    List<NoticeDto> selectNoticeList(NoticeDto searchDto);

    List<NoticeDto> selectPcNoticeList(PcNoticeSearchDto search);

    int selectPcNoticeCount(PcNoticeSearchDto search);

    NoticeDto selectPcNoticeDetail(PcNoticeSearchDto search);

    List<NoticeMenuDto> selectNoticeMenuList(String hcCode);

    void totalNoteView(@Param("tvUk") String tvUk, @Param("saCd") String saCd);
}
