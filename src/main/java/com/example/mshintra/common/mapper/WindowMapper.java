package com.example.mshintra.common.mapper;

import com.example.mshintra.common.dto.AuthDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WindowMapper {

    String selectAdminKey(AuthDto auth);
}
