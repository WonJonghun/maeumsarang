package com.example.mshintra.contact.mapper;

import com.example.mshintra.contact.dto.ContactDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContactMapper {

    List<ContactDto> selectContactList(@Param("baseDt") String baseDt,
                                       @Param("securityDecryptKey") String securityDecryptKey);
}
