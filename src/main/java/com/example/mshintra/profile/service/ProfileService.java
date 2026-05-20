package com.example.mshintra.profile.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.profile.dto.CommuteDto;
import com.example.mshintra.profile.dto.PassChangeDto;
import com.example.mshintra.profile.dto.ProfileDto;
import com.example.mshintra.profile.mapper.ProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ProfileService {

    private final ProfileMapper profileMapper;

    @Transactional(readOnly = true)
    public List<ProfileDto> selectCheckApproList(SearchDto searchDto) {
        List<ProfileDto> list = profileMapper.selectCheckApproList(searchDto);

        int coopCnt = profileMapper.selectCoopCnt(searchDto);

        if (list == null || list.isEmpty()) {
            ProfileDto dto = new ProfileDto();
            dto.setCcCnt2(coopCnt);
            return List.of(dto);
        }

        list.get(0).setCcCnt2(coopCnt);
        return list;
    }

    @Transactional(readOnly = true)
    public List<CommuteDto> selectCommuteStat(SearchDto searchDto) {
        return profileMapper.selectCommuteStat(searchDto);
    }

    @Transactional
    public void passChange(PassChangeDto passChangeDto, String icCode) {
        String oldPassword = passChangeDto.getOldPassword();
        String newPassword = passChangeDto.getNewPassword();
        String newPasswordConfirm = passChangeDto.getNewPasswordConfirm();

        if (oldPassword == null || oldPassword.isEmpty()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력하세요.");
        }

        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("새로운 비밀번호를 입력하세요.");
        }

        if (newPasswordConfirm == null || newPasswordConfirm.isEmpty()) {
            throw new IllegalArgumentException("새 비밀번호 확인을 입력하세요.");
        }

        if (!newPassword.equals(newPasswordConfirm)) {
            throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
        }

        if (newPassword.length() < 10) {
            throw new IllegalArgumentException("비밀번호는 최소 10자리 이상이어야 합니다.");
        }

        if (newPassword.length() > 20) {
            throw new IllegalArgumentException("비밀번호는 최대 20자 이하여야 합니다.");
        }

        if (!newPassword.matches(".*[A-Za-z].*")
                || !newPassword.matches(".*[0-9].*")
                || !newPassword.matches(".*[^A-Za-z0-9].*")) {
            throw new IllegalArgumentException("비밀번호는 특수문자, 영문, 숫자를 포함해야 합니다.");
        }

        String lowerPassword = newPassword.toLowerCase();

        for (int i = 0; i < lowerPassword.length() - 2; i++) {
            char first = lowerPassword.charAt(i);
            char second = lowerPassword.charAt(i + 1);
            char third = lowerPassword.charAt(i + 2);

            if ((first + 1 == second && second + 1 == third)
                    || (first - 1 == second && second - 1 == third)
                    || (first == second && second == third)) {
                throw new IllegalArgumentException("비밀번호에 연속문자 또는 연속숫자는 사용할 수 없습니다.");
            }
        }

        String passChk = profileMapper.selectPassChk(icCode, oldPassword);

        if (!"OK".equals(passChk)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        profileMapper.updatePassChange(icCode, newPassword);
    }

}
