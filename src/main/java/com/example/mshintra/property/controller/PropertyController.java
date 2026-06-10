package com.example.mshintra.property.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.property.dto.PropertyChangeDto;
import com.example.mshintra.property.dto.PropertyLookDto;
import com.example.mshintra.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/property")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping("/lookList.do")
    public String lookList() {
        return "jsp/property/lookList";
    }

    @ResponseBody
    @GetMapping("/selectPropertyLookList.do")
    public List<PropertyLookDto> selectPropertyLookList(SearchDto searchDto) {
        return propertyService.selectPropertyLookList(searchDto);
    }

    @ResponseBody
    @GetMapping("/selectPropertyChangeList.do")
    public List<PropertyChangeDto> selectPropertyChangeList(String ppCode, String pcFlag) {
        return propertyService.selectPropertyChangeList(ppCode, pcFlag);
    }
}