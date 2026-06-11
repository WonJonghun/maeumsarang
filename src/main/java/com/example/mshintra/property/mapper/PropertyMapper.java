package com.example.mshintra.property.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.property.dto.PropertyChangeDto;
import com.example.mshintra.property.dto.PropertyLookDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PropertyMapper {

    List<PropertyLookDto> selectPropertyLookList(SearchDto searchDto);

    List<PropertyChangeDto> selectPropertyChangeList(@Param("ppCode") String ppCode,
                                                     @Param("pcFlag") String pcFlag);

    int selectTodayPropertyLookCheckCount(String pcCode);

    String selectActivePropertyLookFlag();

    int insertPropertyLookCheck(PropertyChangeDto propertyChangeDto);
}