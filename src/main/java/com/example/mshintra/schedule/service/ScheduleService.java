package com.example.mshintra.schedule.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.common.service.CommonCodeService;
import com.example.mshintra.schedule.dto.*;
import com.example.mshintra.schedule.mapper.ScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ScheduleService {

    private final ScheduleMapper scheduleMapper;
    private final CommonCodeService commonCodeService;

    @Transactional(readOnly = true)
    public List<ScheduleDto> selectScheduleList(ScheduleMenuDto searchDto) {

        List<ScheduleDto> list = scheduleMapper.selectScheduleList(searchDto);

        commonCodeService.mapGunmuCode(list);
        commonCodeService.mapBuserCode(list, "icBuser", "icBuserNm");
        commonCodeService.mapJikgubCode(list, "icJikgub", "icJikgubNm");
        commonCodeService.formatSabun(list, "icCode");

        return list;
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> selectScheduleWeekList(SearchDto searchDto) {
        List<ScheduleDto> list = scheduleMapper.selectScheduleWeekList(searchDto);

        commonCodeService.mapGunmuCode(list);
        commonCodeService.mapBuserCode(list, "icBuser", "icBuserNm");
        commonCodeService.mapJikgubCode(list, "icJikgub", "icJikgubNm");
        commonCodeService.formatSabun(list, "icCode");

        return list;
    }

    @Transactional(readOnly = true)
    public List<CalendarDto> selectTodayScheduleList(CalendarDto searchDto) {
        return scheduleMapper.selectTodayScheduleList(searchDto);
    }

    @Transactional(readOnly = true)
    public List<DayDutyDto> selectDayDutyList(DayDutyDto searchDto) {
        return scheduleMapper.selectDayDutyList(searchDto);
    }

    @Transactional(readOnly = true)
    public List<DayDutyDto> selectOutDayDutyList(DayDutyDto searchDto) {
        return scheduleMapper.selectOutDayDutyList(searchDto);
    }

    @Transactional(readOnly = true)
    public List<HolidayDto> selectHolidayList(HolidayDto searchDto) {
        return scheduleMapper.selectHolidayList(searchDto);
    }
}
