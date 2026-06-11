package com.example.mshintra.property.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.property.dto.PropertyChangeDto;
import com.example.mshintra.property.dto.PropertyLookDto;
import com.example.mshintra.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @ResponseBody
    @PostMapping("/insertPropertyLookCheck.do")
    public Map<String, Object> insertPropertyLookCheck(@ModelAttribute PropertyChangeDto propertyChangeDto,
                                                       @AuthenticationPrincipal LoginUserDto loginUser) {
        Map<String, Object> result = new HashMap<>();

        if (loginUser == null || loginUser.getIcCode() == null) {
            result.put("resultCode", "FAIL");
            result.put("message", "로그인 정보가 없습니다.");
            return result;
        }

        propertyChangeDto.setPcUserID(loginUser.getIcCode());

        String resultCode = propertyService.insertPropertyLookCheck(propertyChangeDto);

        result.put("resultCode", resultCode);
        return result;
    }

    @ResponseBody
    @PostMapping("/insertManualPropertyLookCheck.do")
    public Map<String, Object> insertManualPropertyLookCheck(@ModelAttribute PropertyChangeDto propertyChangeDto,
                                                             @AuthenticationPrincipal LoginUserDto loginUser) {
        Map<String, Object> result = new HashMap<>();

        if (loginUser == null || loginUser.getIcCode() == null) {
            result.put("resultCode", "FAIL");
            result.put("message", "로그인 정보가 없습니다.");
            return result;
        }

        propertyChangeDto.setPcUserID(loginUser.getIcCode());

        String resultCode = propertyService.insertManualPropertyLookCheck(propertyChangeDto);

        result.put("resultCode", resultCode);
        return result;
    }
}