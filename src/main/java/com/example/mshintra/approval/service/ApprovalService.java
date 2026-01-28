package com.example.mshintra.approval.service;

import com.example.mshintra.approval.dto.ApprovalDto;
import com.example.mshintra.approval.mapper.ApprovalMapper;
import com.example.mshintra.common.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ApprovalService {

    private final ApprovalMapper approvalMapper;
    private final CommonCodeService commonCodeService;

    @Transactional(readOnly = true)
    public List<ApprovalDto> selectApprovalFlowlist(ApprovalDto searchDto) {
        return approvalMapper.selectApprovalFlowlist(searchDto);
    }

    @Transactional(readOnly = true)
    public List<ApprovalDto> selectApprovalList(ApprovalDto searchDto) {

        List<ApprovalDto> list = approvalMapper.selectApprovalList(searchDto);
        if (list == null || list.isEmpty()) {
            return list;
        }
        commonCodeService.mapBuserCode(list, "ccBuser", "ccBuserNm");

        return list;
    }
}
