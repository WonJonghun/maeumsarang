package com.example.mshintra.vacation.service;

import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.vacation.dto.VacationDto;
import com.example.mshintra.vacation.mapper.VacationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class VacationService {

    private final VacationMapper vacationMapper;

    @Transactional(readOnly = true)
    public VacationDto selectVacationStatus(VacationDto searchDto) {
        return vacationMapper.selectVacationStatus(searchDto);
    }
}
