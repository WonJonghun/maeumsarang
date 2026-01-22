package com.example.mshintra.imprvprop.controller;

import com.example.mshintra.imprvprop.dto.ImprvPropDto;
import com.example.mshintra.imprvprop.dto.PropDetailDto;
import com.example.mshintra.imprvprop.service.ImprvPropService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/imprvProp")
public class ImprvPropController {

    private final ImprvPropService imprvPropService;

    @GetMapping("/propList.do")
    public String imprvPropList(@RequestParam(value = "baseKey", required = false) String baseKey, Model model)  {

        model.addAttribute("baseKey", baseKey);
        return "jsp/imprvprop/propList";
    }

    @ResponseBody
    @GetMapping("/list.do")
    public List<ImprvPropDto> selectPropList(@ModelAttribute ImprvPropDto searchDto) {
        return imprvPropService.selectPropList(searchDto);
    }

    @ResponseBody
    @GetMapping("/propDetail.do")
    public List<PropDetailDto> propDetail(@ModelAttribute ImprvPropDto dto) {
        return imprvPropService.selectPropDetail(dto);
    }
}
