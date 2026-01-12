package com.example.mshintra.vacation.mapper;

import com.example.mshintra.vacation.dto.VacationDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VacationMapper {

    VacationDto selectVacationStatus(VacationDto searchDto);
}