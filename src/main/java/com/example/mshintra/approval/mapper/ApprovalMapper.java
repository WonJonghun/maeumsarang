package com.example.mshintra.approval.mapper;

import com.example.mshintra.approval.dto.ApprovalDetailFCDto;
import com.example.mshintra.approval.dto.ApprovalDetailORDto;
import com.example.mshintra.approval.dto.ApprovalDetailPLDto;
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
                                                     @Param("ymd") String ymd, @Param("fcNum") String fcNum, @Param("ccSeq") Integer ccSeq);

    List<ApprovalDetailORDto> selectApprovalOrDetail(@Param("ccCode") String ccCode, @Param("ccFlag") String ccFlag);

    Map<String, Object> selectApprovalSignNum(@Param("ccCode") String ccCode, @Param("ccFlag") String ccFlag);

    void signApproval(@Param("code") String code, @Param("saCd") String saCd, @Param("flag") String flag, @Param("rmk") String rmk);

    Map<String, Object> selectApprovalSignLock(@Param("code") String code);

    List<ApprovalDto> selectApprovalPaperList(ApprovalDto searchDto);

    ApprovalDetailPLDto selectApprovalPaperDetail(@Param("ymd") String ymd, @Param("piSeq") Integer piSeq);

    Map<String, Object> selectApprovalPaperSign(@Param("ymd") String ymd, @Param("piSeq") Integer piSeq);

    Map<String, Object> selectApprovalPaperSignNum(@Param("ymd") String ymd, @Param("piSeq") Integer piSeq);

    Map<String, Object> selectApprovalPaperLock(@Param("ymd") String ymd, @Param("piSeq") Integer piSeq);

    void receiveApprovalPaper(@Param("ymd") String ymd, @Param("piSeq") Integer piSeq, @Param("saCd") String saCd);
}
