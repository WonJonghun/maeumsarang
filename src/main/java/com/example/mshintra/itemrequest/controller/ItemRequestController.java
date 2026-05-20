package com.example.mshintra.itemrequest.controller;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDetailDto;
import com.example.mshintra.itemrequest.dto.ItemRequestDto;
import com.example.mshintra.itemrequest.service.ItemRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@RequiredArgsConstructor
@Controller
@RequestMapping("/itemRequest")
public class ItemRequestController {

    private final ItemRequestService itemRequestService;

    @GetMapping("/itemRequestList.do")
    public String itemRequestList() {
        return "jsp/itemrequest/itemRequestList";
    }

    @ResponseBody
    @GetMapping("/selectItemRequestList.do")
    public List<ItemRequestDto> selectItemRequestList(SearchDto searchDto) {
        return itemRequestService.selectItemRequestList(searchDto);
    }

    @ResponseBody
    @GetMapping("/selectItemRequestDetail.do")
    public List<ItemRequestDetailDto> selectItemRequestDetail(ItemRequestDetailDto searchDto) {
        return itemRequestService.selectItemRequestDetail(searchDto);
    }
}
