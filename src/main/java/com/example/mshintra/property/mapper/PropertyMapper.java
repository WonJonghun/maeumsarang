package com.example.mshintra.property.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.property.dto.PropertyLookDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PropertyMapper {

    List<PropertyLookDto> selectPropertyLookList(SearchDto searchDto);
}