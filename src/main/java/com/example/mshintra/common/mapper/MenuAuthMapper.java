package com.example.mshintra.common.mapper;

import com.example.mshintra.common.dto.MenuAuthDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MenuAuthMapper {

    String selectAdminKey(MenuAuthDto dto);
}
