package com.example.mshintra.property.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.property.dto.PropertyChangeDto;
import com.example.mshintra.property.dto.PropertyLookDto;
import com.example.mshintra.property.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class PropertyService {

    private final PropertyMapper propertyMapper;

    @Transactional(readOnly = true)
    public List<PropertyLookDto> selectPropertyLookList(SearchDto searchDto) {
        return propertyMapper.selectPropertyLookList(searchDto);
    }

    @Transactional(readOnly = true)
    public List<PropertyChangeDto> selectPropertyChangeList(String ppCode, String pcFlag) {
        return propertyMapper.selectPropertyChangeList(ppCode, pcFlag);
    }
}