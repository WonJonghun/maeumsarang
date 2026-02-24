package com.example.mshintra.profile.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.profile.dto.CommuteDto;
import com.example.mshintra.profile.dto.ProfileDto;
import com.example.mshintra.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    @ResponseBody
    @GetMapping("/checkApproList.do")
    public List<ProfileDto> selectCheckApproList(SearchDto searchDto) {
        return profileService.selectCheckApproList(searchDto);
    }

    @ResponseBody
    @GetMapping("/commuteStat.do")
    public List<CommuteDto> selectCommuteStat(SearchDto searchDto) {
        return profileService.selectCommuteStat(searchDto);
    }
}
