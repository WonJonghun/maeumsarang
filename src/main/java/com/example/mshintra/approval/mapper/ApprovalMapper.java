package com.example.mshintra.approval.mapper;

import com.example.mshintra.approval.dto.ApprovalDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ApprovalMapper {

    List<ApprovalDto> selectApprovalFlowlist(ApprovalDto searchDto);

    List<ApprovalDto> selectApprovalList(ApprovalDto searchDto);
}
