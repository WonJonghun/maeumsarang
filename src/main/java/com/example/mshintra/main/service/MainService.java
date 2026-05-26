package com.example.mshintra.main.service;

import com.example.mshintra.main.dto.MainBirthDayDto;
import com.example.mshintra.main.dto.MainMealDto;
import com.example.mshintra.main.mapper.MainMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}