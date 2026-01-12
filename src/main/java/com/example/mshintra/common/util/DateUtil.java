package com.example.mshintra.common.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DateUtil {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private DateUtil() {}

    // 오늘 날짜 뽑아줌 ex) M월 d일
    public static String getTodayKorMd() {
        return LocalDate.now(KST).format(DateTimeFormatter.ofPattern("M월 d일"));
    }

    public static String format(LocalDate date, String pattern) {
        if (date == null) return "";
        return date.atStartOfDay(KST).toLocalDate().format(DateTimeFormatter.ofPattern(pattern));
    }

    // 오늘 기준 월과 주차 뽑아줌 ex) M월 W주차
    public static String getTodayKorMw() {
        LocalDate today = LocalDate.now(KST);
        int month = today.getMonthValue();
        int day = today.getDayOfMonth();
        int week = ((day - 1) / 7) + 1;
        return month + "월 " + week + "주차";
    }

    // 이번주 요일 뽑아줌
    public static List<Map<String, Object>> getThisWeek() {
        ZoneId KST = ZoneId.of("Asia/Seoul");
        LocalDate today = LocalDate.now(KST);
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        String[] dayNames = {"월","화","수","목","금","토","일"};
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate target = monday.plusDays(i);
            Map<String, Object> item = new HashMap<>();
            item.put("dayName", dayNames[i]);              // 월~일 한글
            item.put("dayOfMonth", target.getDayOfMonth()); // 숫자 날짜 (1~31)
            item.put("dayOfWeek", target.getDayOfWeek().getValue()); // 1=월 ~ 7=일
            item.put("today", target.equals(today));       // 오늘 여부
            result.add(item);
        }
        return result;
    }

    // 오늘 날짜를 YYYYparamMMparamDD 형식으로 반환
    public static String getTodayYmd(String param) {
        return LocalDate.now(KST).format(DateTimeFormatter.ofPattern("yyyy" + param + "MM" + param + "dd"));
    }

    public static String getTodayYear() {
        return LocalDate.now(KST).format(DateTimeFormatter.ofPattern("yyyy"));
    }

    public static String getTodayMonth() {
        return LocalDate.now(KST).format(DateTimeFormatter.ofPattern("MM"));
    }

    public static String getTodayDay() {
        return LocalDate.now(KST).format(DateTimeFormatter.ofPattern("dd"));
    }
}
