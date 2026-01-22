package com.example.mshintra.schedule.controller;

import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.schedule.dto.*;
import com.example.mshintra.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/schedule.do")
    public String workSchedule(MenuDto menuDto, Model model) {
        model.addAttribute("baseKey", menuDto.getCcBaseKey());
        model.addAttribute("menuName", menuDto.getCcMenuName());
        return "jsp/schedule/scheduleList";
    }

    @ResponseBody
    @GetMapping("/scheduleList.do")
    public List<ScheduleDto> selectScheduleList(@ModelAttribute ScheduleMenuDto searchDto) {
        return scheduleService.selectScheduleList(searchDto);
    }

    @ResponseBody
    @GetMapping("/todayScheduleList.do")
    public List<CalendarDto> selectTodayScheduleList(@ModelAttribute CalendarDto searchDto) {
        return scheduleService.selectTodayScheduleList(searchDto);
    }

    @ResponseBody
    @GetMapping("/dayDuty.do")
    public List<DayDutyDto> selectDayDutyList(@ModelAttribute DayDutyDto searchDto) {
        return scheduleService.selectDayDutyList(searchDto);
    }

    @ResponseBody
    @GetMapping("/outDayDuty.do")
    public List<DayDutyDto> selectOutDayDutyList(@ModelAttribute DayDutyDto searchDto) {
        return scheduleService.selectOutDayDutyList(searchDto);
    }

    @ResponseBody
    @GetMapping("/holidayList.do")
    public List<HolidayDto> selectHolidayList(HolidayDto searchDto) {
        return scheduleService.selectHolidayList(searchDto);
    }
}
