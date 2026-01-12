package com.example.mshintra.schedule.controller;

import com.example.mshintra.schedule.dto.*;
import com.example.mshintra.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/scheduleList.do")
    public List<ScheduleDto> selectScheduleList(@ModelAttribute ScheduleMenuDto searchDto) {
        return scheduleService.selectScheduleList(searchDto);
    }

    @GetMapping("/todayScheduleList.do")
    public List<CalendarDto> selectTodayScheduleList(@ModelAttribute CalendarDto searchDto) {
        return scheduleService.selectTodayScheduleList(searchDto);
    }

    @GetMapping("/dayDuty.do")
    public List<DayDutyDto> selectDayDutyList(@ModelAttribute DayDutyDto searchDto) {
        return scheduleService.selectDayDutyList(searchDto);
    }

    @GetMapping("/outDayDuty.do")
    public List<DayDutyDto> selectOutDayDutyList(@ModelAttribute DayDutyDto searchDto) {
        return scheduleService.selectOutDayDutyList(searchDto);
    }

    @GetMapping("/holidayList.do")
    public List<HolidayDto> selectHolidayList(@RequestParam("year") String year, @RequestParam("month") String month) {
        return scheduleService.selectHolidayList(year, month);
    }

}
