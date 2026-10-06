package com.example.mshintra.main.service;

import com.example.mshintra.common.util.DateUtil;
import com.example.mshintra.main.dto.MainBirthDayDto;
import com.example.mshintra.main.dto.MainBulletinDto;
import com.example.mshintra.main.dto.MainMealDto;
import com.example.mshintra.main.mapper.MainMapper;
import com.example.mshintra.notice.dto.NoticeDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@Service
public class MainService {

    private final MainMapper mainMapper;

    @Transactional(readOnly = true)
    public List<MainBirthDayDto> selectMainBirthDayList(String searchDate) {
        return mainMapper.selectMainBirthDayList(searchDate);
    }

    @Transactional(readOnly = true)
    public List<MainMealDto> selectMainMealList(String searchDate) {
        return mainMapper.selectMainMealList(searchDate);
    }

    @Transactional(readOnly = true)
    public List<NoticeDto> selectMainLibraryList(String userId) {
        List<NoticeDto> list = mainMapper.selectMainLibraryList(userId).stream().limit(5).toList();
        for (NoticeDto item : list) {
            item.setTnDateStr(item.getTnDate().substring(0, 10).replace('-', '.'));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<MainBulletinDto> selectMainBulletinList(String userId) {
        String today = DateUtil.getTodayYmd("-");
        LocalDate date = LocalDate.parse(today);
        return mainMapper.selectMainBulletinList(userId, today,
                date.minusDays(7).toString(), date.plusDays(7).toString());
    }
}
