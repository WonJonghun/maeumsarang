package com.example.mshintra.common.mapper;

import com.example.mshintra.common.dto.CommonCodeDto;
import com.example.mshintra.common.dto.HelpCodeDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommonCodeMapper {

    List<CommonCodeDto> selectGunmuCodeList();
    List<CommonCodeDto> selectBuserCodeList();
    List<CommonCodeDto> selectJikgubCodeList();
    List<HelpCodeDto> selectHelpCodeList(String hcCode);
    String executeProcedure(String procNm,String param);
}