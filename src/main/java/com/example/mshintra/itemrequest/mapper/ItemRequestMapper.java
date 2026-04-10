package com.example.mshintra.itemrequest.mapper;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDetailDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ItemRequestMapper {

    List<ItemRequestDto> selectItemRequestList(SearchDto searchDto);

    List<ItemRequestDetailDto> selectItemRequestDetail(ItemRequestDetailDto searchDto);
}
