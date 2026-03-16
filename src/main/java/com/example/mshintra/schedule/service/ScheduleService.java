package com.example.mshintra.schedule.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.common.service.CommonCodeService;
import com.example.mshintra.schedule.dto.CalendarDto;
import com.example.mshintra.schedule.dto.DayDutyDto;
import com.example.mshintra.schedule.dto.HolidayDto;
import com.example.mshintra.schedule.dto.MonthDutyDto;
import com.example.mshintra.schedule.dto.ScheduleDto;
import com.example.mshintra.schedule.dto.ScheduleMenuDto;
import com.example.mshintra.schedule.mapper.ScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ScheduleService {

    private final ScheduleMapper scheduleMapper;
    private final CommonCodeService commonCodeService;

    @Transactional(readOnly = true)
    public List<ScheduleDto> selectScheduleList(ScheduleMenuDto searchDto) {

        List<ScheduleDto> list = scheduleMapper.selectScheduleList(searchDto);
        List<MonthDutyDto> monthDutyList = scheduleMapper.selectMonthDutyList(searchDto);

        mergeMonthDuty(list, monthDutyList, searchDto.getSaCd());

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

    private void mergeMonthDuty(List<ScheduleDto> list, List<MonthDutyDto> monthDutyList, String saCd) {
        if (list == null || list.isEmpty() || monthDutyList == null || monthDutyList.isEmpty() || saCd == null || saCd.isBlank()) return;

        ScheduleDto target = null;
        for (ScheduleDto item : list) {
            if (saCd.equals(item.getIcCode())) {
                target = item;
                break;
            }
        }
        if (target == null) return;

        for (MonthDutyDto item : monthDutyList) {
            if (item.getDuDate() == null || item.getDuDate().length() < 10) continue;

            try {
                Field field = ScheduleDto.class.getDeclaredField("a" + Integer.parseInt(item.getDuDate().substring(8, 10)));
                field.setAccessible(true);

//                String dutyText = item.getHcName() == null ? "당직" : item.getHcName();
                String dutyText = "당직";
                String value = (String) field.get(target);

                if (value == null || value.isBlank()) {
                    field.set(target, dutyText);
                } else if (!value.contains(dutyText)) {
                    field.set(target, value + "/" + dutyText);
                }
            } catch (Exception ignored) {
            }
        }
    }
}