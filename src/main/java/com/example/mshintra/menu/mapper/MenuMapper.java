package com.example.mshintra.menu.mapper;

import com.example.mshintra.menu.dto.MenuDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface MenuMapper {

    List<MenuDto> selectMenuList(@Param("icCode") String icCode, @Param("keyword") String keyword);
}
