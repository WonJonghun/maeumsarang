package com.example.mshintra.repair.mapper;

import com.example.mshintra.repair.dto.RepairDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RepairMapper {

    List<RepairDto> selectRepairList(RepairDto dto);

    int updateRepairProcess(RepairDto dto);
}