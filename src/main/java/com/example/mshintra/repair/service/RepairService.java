package com.example.mshintra.repair.service;

import com.example.mshintra.repair.dto.RepairDto;
import com.example.mshintra.repair.mapper.RepairMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class RepairService {

    private final RepairMapper repairMapper;

    @Transactional(readOnly = true)
    public List<RepairDto> selectRepairList(RepairDto dto) {
        return repairMapper.selectRepairList(dto);
    }
}
