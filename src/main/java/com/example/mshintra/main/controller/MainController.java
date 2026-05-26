package com.example.mshintra.main.controller;

import com.example.mshintra.common.util.DateUtil;
import com.example.mshintra.customer.dto.CustomerDto;
import com.example.mshintra.customer.service.CustomerService;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.main.dto.MainBirthDayDto;
import com.example.mshintra.main.service.MainService;
import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.service.NoticeService;
import com.example.mshintra.schedule.dto.CalendarDto;
import com.example.mshintra.schedule.dto.DayDutyDto;
import com.example.mshintra.schedule.dto.ScheduleDto;
import com.example.mshintra.schedule.dto.ScheduleMenuDto;
import com.example.mshintra.schedule.service.ScheduleService;
import com.example.mshintra.vacation.dto.VacationDto;
import com.example.mshintra.vacation.service.VacationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Controller
public class MainController {

    private final ScheduleService scheduleService;
    private final NoticeService noticeService;
    private final VacationService vacationService;
    private final CustomerService customerService;
    private final MainService mainService;

    //달력은 calendar.js 및 main.js ajax 확인
    @GetMapping("/main.do")
    public String mainPage(@AuthenticationPrincipal LoginUserDto loginUser, Model model) {

        //일주일 업무만 보여주던것
        ScheduleMenuDto scheduleMenuDto = new ScheduleMenuDto(
                DateUtil.getTodayYmd("-"),
                loginUser.getFlag(),
                null,
                loginUser.getIcCode(),
                null
        );
        List<ScheduleDto> scheduleList = scheduleService.selectScheduleList(scheduleMenuDto);

        List<Map<String, Object>> weekDays = DateUtil.getThisWeek();

        // 금주 나의 근무 데이터
        if (scheduleList != null && !scheduleList.isEmpty()) {
            ScheduleDto schedule = scheduleList.getFirst();

            for (Map<String, Object> day : weekDays) {
                Object domObj = day.get("dayOfMonth");
                if (domObj == null) continue;
                int dayOfMonth = (domObj instanceof Integer) ? (Integer) domObj : Integer.parseInt(domObj.toString());

                String status = schedule.getDayValue(dayOfMonth);
                // 행정직원일때
                if ("9".equals(String.valueOf(loginUser.getFlag()))) {
                    if (status == null || status.isBlank()) {
                        Object dowObj = day.get("dayOfWeek");
                        int dayOfWeek = (dowObj instanceof Integer) ? (Integer) dowObj : Integer.parseInt(dowObj.toString());
                        if (dayOfWeek == 6 || dayOfWeek == 7) {
                            status = "휴일";
                        } else {
                            status = "D^";
                        }
                    }
                }
                day.put("status", status);
            }
        }

        //공지
        NoticeDto noticeDto = new NoticeDto();
        noticeDto.setHcCode("IntGmenu");
        noticeDto.setTnFlag(1);
        noticeDto.setOffset(0);
        noticeDto.setLimit(5);
        noticeDto.setSearchId(loginUser.getIcCode());
        List<NoticeDto> noticeList = noticeService.selectNoticeList(noticeDto);

        //자유게시판
        NoticeDto boardDto = new NoticeDto();
        boardDto.setHcCode("IntGmenu");
        boardDto.setTnFlag(2);
        boardDto.setOffset(0);
        boardDto.setLimit(5);
        boardDto.setSearchId(loginUser.getIcCode());
        List<NoticeDto> boardList = noticeService.selectNoticeList(boardDto);

        //오늘의 일정
        CalendarDto calendarDto = new CalendarDto();
        calendarDto.setSearchDate(DateUtil.getTodayYmd("-"));
        calendarDto.setCcBuser(loginUser.getIcBuser());
        calendarDto.setUserId(loginUser.getIcCode());
        List<CalendarDto> calendarList = scheduleService.selectTodayScheduleList(calendarDto);

        //휴가 일정
        VacationDto vacationDto = new VacationDto();
        vacationDto.setCcCode(loginUser.getIcCode());
        vacationDto.setSearchDate(DateUtil.getTodayYmd("-"));
        VacationDto vacationStatus = vacationService.selectVacationStatus(vacationDto);

        //환자 현황
        CustomerDto customerDto = new CustomerDto();
        customerDto.setBaseDt(DateUtil.getTodayYmd("-"));
        CustomerDto customerDailyStats = customerService.selectCustomerDailyStats(customerDto);

        //당직자
        DayDutyDto dayDutyDto = new DayDutyDto();
        dayDutyDto.setSearchDate(DateUtil.getTodayYmd("-"));
        List<DayDutyDto> dayDutyList = scheduleService.selectDayDutyList(dayDutyDto);

        //외래진료
        DayDutyDto outDayDutyDto = new DayDutyDto();
        outDayDutyDto.setSearchDate(DateUtil.getTodayYmd("-"));
        List<DayDutyDto> outDayDutyList = scheduleService.selectOutDayDutyList(outDayDutyDto);

        //생일자 / 휴가자
        List<MainBirthDayDto> mainBirthDayList = mainService.selectMainBirthDayList(DateUtil.getTodayYmd("-"));
        List<MainBirthDayDto> birthdayList = mainBirthDayList.stream()
                .filter(item -> item.getSort() != null && item.getSort() == 2)
                .toList();
        List<MainBirthDayDto> vacationUserList = mainBirthDayList.stream()
                .filter(item -> item.getSort() != null && item.getSort() == 4)
                .toList();

        model.addAttribute("welcomeDate", DateUtil.getTodayKorMd());
        model.addAttribute("workWeek", DateUtil.getTodayKorMw());
        model.addAttribute("weekDays", weekDays);
        model.addAttribute("noticeList", noticeList);
        model.addAttribute("boardList", boardList);
        model.addAttribute("todayYmdDot", DateUtil.getTodayYmd("."));
        model.addAttribute("calendarList", calendarList);
        model.addAttribute("vacationStatus", vacationStatus);
        model.addAttribute("customerDailyStats", customerDailyStats);
        model.addAttribute("dayDutyList", dayDutyList);
        model.addAttribute("outDayDutyList", outDayDutyList);
        model.addAttribute("birthdayList", birthdayList);
        model.addAttribute("vacationUserList", vacationUserList);

        return "jsp/main/main";
    }

    @ResponseBody
    @GetMapping("/main/birthDayList.do")
    public List<MainBirthDayDto> selectMainBirthDayList(@RequestParam String searchDate) {
        return mainService.selectMainBirthDayList(searchDate);
    }
}
