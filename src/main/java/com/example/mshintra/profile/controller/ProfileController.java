package com.example.mshintra.profile.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.profile.dto.CommuteDto;
import com.example.mshintra.profile.dto.PassChangeDto;
import com.example.mshintra.profile.dto.ProfileDto;
import com.example.mshintra.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/movePassChange.do")
    public String passChangePage() {
        return "jsp/profile/passChange";
    }

    @ResponseBody
    @PostMapping("/passChange.do")
    public Map<String, Object> passChange(PassChangeDto passChangeDto,
                                          @AuthenticationPrincipal LoginUserDto loginUser) {
        Map<String, Object> result = new HashMap<>();

        try {
            profileService.passChange(passChangeDto, loginUser.getIcCode());

            result.put("success", true);
            result.put("message", "변경 되었습니다.");
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "비밀번호 변경 중 오류가 발생했습니다.");
        }

        return result;
    }
}
