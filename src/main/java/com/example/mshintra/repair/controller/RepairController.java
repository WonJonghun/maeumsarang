package com.example.mshintra.repair.controller;

import com.example.mshintra.repair.dto.RepairDto;
import com.example.mshintra.repair.service.RepairService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/repair")
public class RepairController {

    private final RepairService repairService;

    @GetMapping("/repairList.do")
    public String dataBoard() {
        return "jsp/repair/repairList";
    }

    @ResponseBody
    @GetMapping("/list.do")
    public List<RepairDto> selectRepairList(@ModelAttribute RepairDto searchDto) {
        return repairService.selectRepairList(searchDto);
    }
}
