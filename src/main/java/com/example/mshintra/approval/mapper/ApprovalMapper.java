package com.example.mshintra.approval.mapper;

import com.example.mshintra.approval.dto.ApprovalDetailFCDto;
import com.example.mshintra.approval.dto.ApprovalDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ApprovalMapper {

    List<ApprovalDto> selectApprovalFlowlist(ApprovalDto searchDto);

    List<ApprovalDto> selectApprovalList(ApprovalDto searchDto);

    Map<String, Object> selectApprovalDetail(@Param("ccCode") String ccCode, @Param("ccFlag") String ccFlag);

    List<ApprovalDetailFCDto> selectApprovalFcDetail(@Param("ccCode") String ccCode, @Param("ccFlag") String ccFlag,
                                               @Param("ymd") String ymd, @Param("fcNum") String fcNum,  @Param("ccSeq") Integer ccSeq);

    Map<String, Object> selectApprovalSignNum(@Param("ccCode") String ccCode, @Param("ccFlag") String ccFlag);
}
