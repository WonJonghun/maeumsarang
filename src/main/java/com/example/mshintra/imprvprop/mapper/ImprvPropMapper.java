package com.example.mshintra.imprvprop.mapper;

import com.example.mshintra.imprvprop.dto.ImprvPropDto;
import com.example.mshintra.imprvprop.dto.PropDetailDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ImprvPropMapper {

    List<ImprvPropDto> selectPropList(ImprvPropDto searchDto);

    List<PropDetailDto> selectPropDetail(ImprvPropDto dto);
}
