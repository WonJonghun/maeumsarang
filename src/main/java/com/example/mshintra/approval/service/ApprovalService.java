package com.example.mshintra.approval.service;

import com.example.mshintra.approval.dto.ApprovalDetailDto;
import com.example.mshintra.approval.dto.ApprovalDetailItemDto;
import com.example.mshintra.approval.dto.ApprovalDto;
import com.example.mshintra.approval.mapper.ApprovalMapper;
import com.example.mshintra.common.service.CommonCodeService;
import com.example.mshintra.common.util.CmUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
public class ApprovalService {

    private final ApprovalMapper approvalMapper;
    private final CommonCodeService commonCodeService;

    private static final Pattern P_SEQ_KEY =
            Pattern.compile("^(ccTitle|cc_Title|ccRmk|cc_RMK|ccFont|cc_Font|ccFontBold|cc_FontBold|ccFontColor|cc_FontColor)(\\d+)$",
                    Pattern.CASE_INSENSITIVE);

    @Transactional(readOnly = true)
    public List<ApprovalDto> selectApprovalFlowlist(ApprovalDto searchDto) {
        return approvalMapper.selectApprovalFlowlist(searchDto);
    }

    @Transactional(readOnly = true)
    public List<ApprovalDto> selectApprovalList(ApprovalDto searchDto) {

        List<ApprovalDto> list = approvalMapper.selectApprovalList(searchDto);
        if (list == null || list.isEmpty()) return list;

        commonCodeService.mapBuserCode(list, "ccBuser", "ccBuserNm");
        return list;
    }

    @Transactional(readOnly = true)
    public ApprovalDetailDto getApprovalDetail(String ccCode, String ccFlag) {

        Map<String, Object> row = approvalMapper.selectApprovalDetail(ccCode, ccFlag);
        Map<String, Object> signRow = approvalMapper.selectApprovalSignNum(ccCode, ccFlag);

        if (row == null) row = Collections.emptyMap();
        if (signRow == null) signRow = Collections.emptyMap();

        ApprovalDetailDto dto = new ApprovalDetailDto();

        dto.setCcCode(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Code")));
        dto.setCcFlag(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Flag")));
        dto.setCcSeFg(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SeFg")));
        dto.setCcDate(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Date")));
        dto.setCcBuser(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Buser")));
        dto.setCcSignCnt(CmUtil.toInt(CmUtil.getIgnoreCase(row, "cc_SignCnt")));

        dto.setCcSign1(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign1")));
        dto.setCcSignDt1(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt1")));
        dto.setCcSignTt1(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt1")));

        dto.setCcSign2(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign2")));
        dto.setCcSignDt2(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt2")));
        dto.setCcSignTt2(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt2")));

        dto.setCcSign3(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign3")));
        dto.setCcSignDt3(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt3")));
        dto.setCcSignTt3(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt3")));

        dto.setCcSign4(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign4")));
        dto.setCcSignDt4(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt4")));
        dto.setCcSignTt4(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt4")));

        dto.setCcSign5(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign5")));
        dto.setCcSignDt5(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt5")));
        dto.setCcSignTt5(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt5")));

        dto.setCcSign6(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign6")));
        dto.setCcSignDt6(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt6")));
        dto.setCcSignTt6(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt6")));

        dto.setCcSign7(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign7")));
        dto.setCcSignDt7(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt7")));
        dto.setCcSignTt7(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt7")));

        dto.setCcSign8(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign8")));
        dto.setCcSignDt8(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt8")));
        dto.setCcSignTt8(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt8")));

        dto.setCcUk(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_UK")));
        dto.setCcImgNo(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_ImgNO")));
        dto.setCcRmk(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_RMK")));

        dto.setEsSign1(CmUtil.str(signRow.get("esSign1")));
        dto.setEsSign2(CmUtil.str(signRow.get("esSign2")));
        dto.setEsSign3(CmUtil.str(signRow.get("esSign3")));
        dto.setEsSign4(CmUtil.str(signRow.get("esSign4")));
        dto.setEsSign5(CmUtil.str(signRow.get("esSign5")));
        dto.setEsSign6(CmUtil.str(signRow.get("esSign6")));
        dto.setEsSign7(CmUtil.str(signRow.get("esSign7")));
        dto.setEsSign8(CmUtil.str(signRow.get("esSign8")));

        Set<Integer> seqSet = new TreeSet<>();
        for (String key : row.keySet()) {
            Matcher matcher = P_SEQ_KEY.matcher(key);
            if (matcher.find()) {
                seqSet.add(Integer.parseInt(matcher.group(2)));
            }
        }

        List<ApprovalDetailItemDto> items = new ArrayList<>();
        for (Integer seq : seqSet) {
            String title = CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Title" + seq));
            String value = CmUtil.str(CmUtil.getIgnoreCase(row, "cc_RMK" + seq));
            String font = CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Font" + seq));
            String fontBold = CmUtil.str(CmUtil.getIgnoreCase(row, "cc_FontBold" + seq));
            String fontColor = CmUtil.str(CmUtil.getIgnoreCase(row, "cc_FontColor" + seq));

            if (CmUtil.isBlank(value) && !CmUtil.isBlank(fontColor)) {
                value = fontColor;
            }

            if (CmUtil.isBlank(title) && CmUtil.isBlank(value)) {
                continue;
            }

            ApprovalDetailItemDto item = new ApprovalDetailItemDto();
            item.setSeq(seq);
            item.setTitle(title);
            item.setValue(value);
            item.setFont(font);
            item.setFontBold(fontBold);
            item.setFontColor(fontColor);

            items.add(item);
        }

        dto.setItems(items);
        return dto;
    }
}