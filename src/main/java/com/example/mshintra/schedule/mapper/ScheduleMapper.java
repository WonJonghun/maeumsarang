package com.example.mshintra.schedule.mapper;

import com.example.mshintra.schedule.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ScheduleMapper {

    List<ScheduleDto> selectScheduleList(ScheduleMenuDto searchDto);

    List<CalendarDto> selectTodayScheduleList(CalendarDto searchDto);

    List<DayDutyDto> selectDayDutyList(DayDutyDto searchDto);

    List<DayDutyDto> selectOutDayDutyList(DayDutyDto searchDto);

    List<HolidayDto> selectHolidayList(@Param("year") String year, @Param("month") String month);
}
