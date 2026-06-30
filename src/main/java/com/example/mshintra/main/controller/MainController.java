package com.example.mshintra.main.controller;

import com.example.mshintra.common.util.DateUtil;
import com.example.mshintra.customer.dto.CustomerDto;
import com.example.mshintra.customer.service.CustomerService;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.main.dto.MainBirthDayDto;
import com.example.mshintra.main.dto.MainMealDto;
import com.example.mshintra.main.service.MainService;
import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.service.NoticeService;
import com.example.mshintra.schedule.dto.CalendarDto;
import com.example.mshintra.schedule.dto.DayDutyDto;
import com.example.mshintra.schedule.dto.ScheduleDto;
import com.example.mshintra.schedule.dto.ScheduleMenuDto;
import com.example.mshintra.schedule.service.ScheduleService;
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
    private final CustomerService customerService;
    private final MainService mainService;

    @GetMapping("/main.do")
    public String mainPage(@AuthenticationPrincipal LoginUserDto loginUser, Model model) {
        String today = DateUtil.getTodayYmd("-");

        List<Map<String, Object>> weekDays = DateUtil.getThisWeek();

        ScheduleMenuDto scheduleMenuDto = new ScheduleMenuDto(
                today,
                loginUser.getFlag(),
                null,
                loginUser.getIcCode(),
                null
        );

        List<ScheduleDto> scheduleList = scheduleService.selectScheduleList(scheduleMenuDto);
        setWeekDutyStatus(weekDays, scheduleList, loginUser.getFlag());

        NoticeDto noticeDto = createNoticeSearchDto(1, loginUser.getIcCode());
        List<NoticeDto> noticeList = noticeService.selectNoticeList(noticeDto);

        NoticeDto boardDto = createNoticeSearchDto(2, loginUser.getIcCode());
        List<NoticeDto> boardList = noticeService.selectNoticeList(boardDto);

        CalendarDto calendarDto = new CalendarDto();
        calendarDto.setSearchDate(today);
        calendarDto.setCcBuser(loginUser.getIcBuser());
        calendarDto.setUserId(loginUser.getIcCode());

        CustomerDto customerDto = new CustomerDto();
        customerDto.setBaseDt(today);

        DayDutyDto dayDutyDto = new DayDutyDto();
        dayDutyDto.setSearchDate(today);

        List<MainBirthDayDto> mainBirthDayList = mainService.selectMainBirthDayList(today);
        List<MainBirthDayDto> birthdayList = mainBirthDayList.stream()
                .filter(item -> Integer.valueOf(2).equals(item.getSort()))
                .toList();
        List<MainBirthDayDto> vacationUserList = mainBirthDayList.stream()
                .filter(item -> Integer.valueOf(4).equals(item.getSort()))
                .toList();

        List<MainMealDto> mealList = mainService.selectMainMealList(today);
        List<MainMealDto> breakfastList = mealList.stream()
                .filter(item -> Integer.valueOf(1).equals(item.getFmFlag()))
                .toList();
        List<MainMealDto> lunchList = mealList.stream()
                .filter(item -> Integer.valueOf(2).equals(item.getFmFlag()))
                .toList();
        List<MainMealDto> dinnerList = mealList.stream()
                .filter(item -> Integer.valueOf(3).equals(item.getFmFlag()))
                .toList();

        model.addAttribute("weekDays", weekDays);
        model.addAttribute("noticeList", noticeList);
        model.addAttribute("boardList", boardList);
        model.addAttribute("calendarList", scheduleService.selectTodayScheduleList(calendarDto));
        CustomerDto customerDailyStats = customerService.selectCustomerDailyStats(customerDto);
        CustomerDto customerBedCount = customerService.selectCustomerBedCount(customerDto);

        if (customerDailyStats != null && customerBedCount != null) {
            customerDailyStats.setSrTo(customerBedCount.getSrTo());
        }

        model.addAttribute("customerDailyStats", customerDailyStats);
        model.addAttribute("dayDutyList", scheduleService.selectDayDutyList(dayDutyDto));
        model.addAttribute("outDayDutyList", scheduleService.selectOutDayDutyList(dayDutyDto));
        model.addAttribute("birthdayList", birthdayList);
        model.addAttribute("vacationUserList", vacationUserList);
        model.addAttribute("breakfastList", breakfastList);
        model.addAttribute("lunchList", lunchList);
        model.addAttribute("dinnerList", dinnerList);

        return "jsp/main/main";
    }

    @ResponseBody
    @GetMapping("/main/birthDayList.do")
    public List<MainBirthDayDto> selectMainBirthDayList(@RequestParam String searchDate) {
        return mainService.selectMainBirthDayList(searchDate);
    }

    @ResponseBody
    @GetMapping("/main/mealList.do")
    public List<MainMealDto> selectMainMealList(@RequestParam String searchDate) {
        return mainService.selectMainMealList(searchDate);
    }

    private NoticeDto createNoticeSearchDto(int tnFlag, String searchId) {
        NoticeDto noticeDto = new NoticeDto();
        noticeDto.setHcCode("IntGmenu");
        noticeDto.setTnFlag(tnFlag);
        noticeDto.setOffset(0);
        noticeDto.setLimit(5);
        noticeDto.setSearchId(searchId);
        return noticeDto;
    }

    private void setWeekDutyStatus(List<Map<String, Object>> weekDays, List<ScheduleDto> scheduleList, Integer flag) {
        if (scheduleList == null || scheduleList.isEmpty()) {
            return;
        }

        ScheduleDto schedule = scheduleList.getFirst();

        for (Map<String, Object> day : weekDays) {
            Object domObj = day.get("dayOfMonth");
            if (domObj == null) {
                continue;
            }

            int dayOfMonth = (domObj instanceof Integer) ? (Integer) domObj : Integer.parseInt(domObj.toString());
            String status = schedule.getDayValue(dayOfMonth);

            if ("9".equals(String.valueOf(flag)) && (status == null || status.isBlank())) {
                Object dowObj = day.get("dayOfWeek");
                int dayOfWeek = (dowObj instanceof Integer) ? (Integer) dowObj : Integer.parseInt(dowObj.toString());
                status = (dayOfWeek == 6 || dayOfWeek == 7) ? "휴일" : "D^";
            }

            day.put("status", status);
        }
    }
}