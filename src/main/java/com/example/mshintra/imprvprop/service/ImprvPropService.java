package com.example.mshintra.imprvprop.service;

import com.example.mshintra.imprvprop.dto.ImprvPropDto;
import com.example.mshintra.imprvprop.dto.PropDetailDto;
import com.example.mshintra.imprvprop.mapper.ImprvPropMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ImprvPropService {

    private final ImprvPropMapper imprvPropMapper;

    @Transactional(readOnly = true)
    public List<ImprvPropDto> selectPropList(ImprvPropDto searchDto) {

        if (searchDto.getOffset() == null) searchDto.setOffset(0);
        if (searchDto.getLimit() == null) searchDto.setLimit(100);

        if (isBlank(searchDto.getSearchFromDate()) || isBlank(searchDto.getSearchToDate())) {
            LocalDate to = LocalDate.now();
            LocalDate from = to.minusYears(1);
            searchDto.setSearchFromDate(from.format(DateTimeFormatter.ISO_LOCAL_DATE));
            searchDto.setSearchToDate(to.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }

        return imprvPropMapper.selectPropList(searchDto);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Transactional(readOnly = true)
    public List<PropDetailDto> selectPropDetail(ImprvPropDto dto) {
        return imprvPropMapper.selectPropDetail(dto);
    }
}
