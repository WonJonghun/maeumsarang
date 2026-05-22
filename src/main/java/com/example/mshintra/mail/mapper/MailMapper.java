package com.example.mshintra.mail.mapper;

import com.example.mshintra.mail.dto.MailListDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MailMapper {

    List<MailListDto> selectMailList(MailListDto dto);

    void updateMailView(MailListDto dto);
}
