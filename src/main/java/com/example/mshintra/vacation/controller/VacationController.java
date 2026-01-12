package com.example.mshintra.vacation.controller;

import com.example.mshintra.vacation.dto.VacationDto;
import com.example.mshintra.vacation.service.VacationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/vacation")
public class VacationController {

    private final VacationService vacationService;

    @GetMapping("/status.do")
    public VacationDto selectVacationStatus(@ModelAttribute VacationDto searchDto) {
        return vacationService.selectVacationStatus(searchDto);
    }
}
