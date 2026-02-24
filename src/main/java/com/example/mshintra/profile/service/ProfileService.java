package com.example.mshintra.profile.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.profile.dto.CommuteDto;
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
}
