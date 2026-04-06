package com.example.mshintra.approval.service;

import com.example.mshintra.approval.dto.*;
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
            Pattern.compile(
                    "^(ccTitle|cc_Title|ccRmk|cc_RMK|ccFont|cc_Font|ccFontBold|cc_FontBold|ccFontColor|cc_FontColor)(\\d+)$",
                    Pattern.CASE_INSENSITIVE
            );

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

    @Transactional(readOnly = true)
    public ApprovalDetailDto getApprovalDetail(String ccCode, String ccFlag) {

        Map<String, Object> row = approvalMapper.selectApprovalDetail(ccCode, ccFlag);
        Map<String, Object> signRow = approvalMapper.selectApprovalSignNum(ccCode, ccFlag);

        if (row == null) {
            row = Collections.emptyMap();
        }

        if (signRow == null) {
            signRow = Collections.emptyMap();
        }

        ApprovalDetailDto dto = new ApprovalDetailDto();

        dto.setCcCode(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Code")));
        dto.setCcFlag(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Flag")));
        dto.setCcSeFg(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SeFg")));
        dto.setCcFlagNm(getApprovalTitle(dto.getCcFlag(), dto.getCcSeFg()));

        String ccDate = CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Date"));
        dto.setCcDate(ccDate.contains(" ") ? ccDate.split(" ")[0] : ccDate);

        dto.setCcBuser(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Buser")));
        dto.setCcBuserNm(commonCodeService.executeProcedure("GetBuserNm", dto.getCcBuser()));
        dto.setCcSignCnt(CmUtil.toInt(CmUtil.getIgnoreCase(row, "cc_SignCnt")));

        dto.setCcSign1(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_Sign1")));
        dto.setCcSignDt1(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignDt1")));
        dto.setCcSignTt1(CmUtil.str(CmUtil.getIgnoreCase(row, "cc_SignTt1")));

        String ccSignDt1 = dto.getCcSignDt1();
        if (ccSignDt1 != null) {
            for (String line : ccSignDt1.split("\\r?\\n")) {
                if (!line.trim().isEmpty()) {
                    dto.setUserNm(line.trim());
                    break;
                }
            }
        }

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

        dto.setEsSign1(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign1")));
        dto.setEsSign2(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign2")));
        dto.setEsSign3(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign3")));
        dto.setEsSign4(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign4")));
        dto.setEsSign5(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign5")));
        dto.setEsSign6(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign6")));
        dto.setEsSign7(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign7")));
        dto.setEsSign8(CmUtil.str(CmUtil.getIgnoreCase(signRow, "esSign8")));

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

            if (value.contains("일부터") && value.contains("일까지")) {
                value = extractLeavePeriod(value);
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

        applyWsItemTitles(items, dto.getCcFlag(), dto.getCcSeFg());

        dto.setItems(items);
        dto.setSignList(buildSignList(dto));

        return dto;
    }

    private String extractLeavePeriod(String value) {
        if (CmUtil.isBlank(value)) {
            return value;
        }

        String result = value.replace("\r\n", "\n");

        if (result.contains("@0")) {
            result = result.substring(result.indexOf("@0") + 2);
        }

        return result.trim();
    }

    @Transactional(readOnly = true)
    public List<ApprovalDetailFCDto> getApprovalFcDetail(String ccCode, String ccFlag, String ymd, String fcNum, Integer ccSeq) {
        return approvalMapper.selectApprovalFcDetail(ccCode, ccFlag, ymd, fcNum, ccSeq);
    }

    @Transactional(readOnly = true)
    public List<ApprovalDetailORDto> getApprovalOrDetail(String ccCode, String ccFlag) {
        return approvalMapper.selectApprovalOrDetail(ccCode, ccFlag);
    }

    private List<ApprovalSignDto> buildSignList(ApprovalDetailDto dto) {

        List<ApprovalSignDto> signList = new ArrayList<>();
        int signCnt = dto.getCcSignCnt() == null ? 0 : dto.getCcSignCnt();

        if (signCnt > 8) {
            signCnt = 8;
        }

        for (int i = 1; i <= signCnt; i++) {
            ApprovalSignDto sign = new ApprovalSignDto();
            sign.setSeq(i);

            switch (i) {
                case 1:
                    sign.setSignTitle(dto.getCcSignTt1());
                    sign.setSignDate(dto.getCcSignDt1());
                    sign.setSignNo(dto.getEsSign1());
                    break;
                case 2:
                    sign.setSignTitle(dto.getCcSignTt2());
                    sign.setSignDate(dto.getCcSignDt2());
                    sign.setSignNo(dto.getEsSign2());
                    break;
                case 3:
                    sign.setSignTitle(dto.getCcSignTt3());
                    sign.setSignDate(dto.getCcSignDt3());
                    sign.setSignNo(dto.getEsSign3());
                    break;
                case 4:
                    sign.setSignTitle(dto.getCcSignTt4());
                    sign.setSignDate(dto.getCcSignDt4());
                    sign.setSignNo(dto.getEsSign4());
                    break;
                case 5:
                    sign.setSignTitle(dto.getCcSignTt5());
                    sign.setSignDate(dto.getCcSignDt5());
                    sign.setSignNo(dto.getEsSign5());
                    break;
                case 6:
                    sign.setSignTitle(dto.getCcSignTt6());
                    sign.setSignDate(dto.getCcSignDt6());
                    sign.setSignNo(dto.getEsSign6());
                    break;
                case 7:
                    sign.setSignTitle(dto.getCcSignTt7());
                    sign.setSignDate(dto.getCcSignDt7());
                    sign.setSignNo(dto.getEsSign7());
                    break;
                case 8:
                    sign.setSignTitle(dto.getCcSignTt8());
                    sign.setSignDate(dto.getCcSignDt8());
                    sign.setSignNo(dto.getEsSign8());
                    break;
                default:
                    break;
            }

            signList.add(sign);
        }

        return signList;
    }

    private void applyWsItemTitles(List<ApprovalDetailItemDto> items, String ccFlag, String ccSeFg) {

        if (!"WS".equals(ccFlag) || items == null || items.isEmpty()) {
            return;
        }

        String prevTitle;
        String nextTitle;

        if ("20".equals(ccSeFg)) {
            prevTitle = "지난주시행사항";
            nextTitle = "이번주계획사항";
        } else if ("30".equals(ccSeFg)) {
            prevTitle = "금월시행사항";
            nextTitle = "차월계획사항";
        } else if ("40".equals(ccSeFg)) {
            prevTitle = "금년시행사항";
            nextTitle = "차년계획사항";
        } else {
            prevTitle = "금일시행사항";
            nextTitle = "익일계획사항";
        }

        if (items.size() >= 1) {
            items.get(0).setTitle(prevTitle);
        }

        if (items.size() >= 3) {
            items.get(2).setTitle(nextTitle);
        }
    }

    private String getApprovalTitle(String ccFlag, String ccSeFg) {

        if ("WS".equals(ccFlag)) {
            if ("20".equals(ccSeFg)) {
                return "주간업무보고";
            }
            if ("30".equals(ccSeFg)) {
                return "월간업무보고";
            }
            if ("40".equals(ccSeFg)) {
                return "연간업무보고";
            }
            return "일업무보고";
        }

        return commonCodeService.getHelpCodeName("Elec00", ccFlag);
    }
}