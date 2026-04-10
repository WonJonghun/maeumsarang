package com.example.mshintra.itemrequest.service;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDetailDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDto;
import com.example.mshintra.itemrequest.mapper.ItemRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ItemRequestService {

    private final ItemRequestMapper itemRequestMapper;

    @Transactional(readOnly = true)
    public List<ItemRequestDto> selectItemRequestList(SearchDto searchDto) {
        return itemRequestMapper.selectItemRequestList(searchDto);
    }

    @Transactional(readOnly = true)
    public List<ItemRequestDetailDto> selectItemRequestDetail(ItemRequestDetailDto searchDto) {
        return itemRequestMapper.selectItemRequestDetail(searchDto);
    }
}