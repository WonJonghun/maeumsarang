package com.example.mshintra.contact.mapper;

import com.example.mshintra.contact.dto.ContactDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ContactMapper {

    List<ContactDto> selectContactList(String baseDt);
}
