package com.example.mshintra.main.mapper;

import com.example.mshintra.main.dto.MainBirthDayDto;
import com.example.mshintra.main.dto.MainBulletinDto;
import com.example.mshintra.main.dto.MainMealDto;
import com.example.mshintra.notice.dto.NoticeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MainMapper {

    List<MainBirthDayDto> selectMainBirthDayList(@Param("searchDate") String searchDate);

    List<MainMealDto> selectMainMealList(@Param("searchDate") String searchDate);

    List<NoticeDto> selectMainLibraryList(@Param("userId") String userId);

    List<MainBulletinDto> selectMainBulletinList(@Param("userId") String userId,
                                             @Param("today") String today,
                                             @Param("startDate") String startDate,
                                             @Param("endDate") String endDate);
}
