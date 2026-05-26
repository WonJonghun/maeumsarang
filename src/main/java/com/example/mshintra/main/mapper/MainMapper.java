package com.example.mshintra.main.mapper;

import com.example.mshintra.main.dto.MainBirthDayDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MainMapper {

    List<MainBirthDayDto> selectMainBirthDayList(@Param("searchDate") String searchDate);
}