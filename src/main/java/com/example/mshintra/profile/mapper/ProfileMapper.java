package com.example.mshintra.profile.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.profile.dto.CommuteDto;
import com.example.mshintra.profile.dto.ProfileDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ProfileMapper {

    List<ProfileDto> selectCheckApproList(SearchDto searchDto);

    List<CommuteDto> selectCommuteStat(SearchDto searchDto);
}
