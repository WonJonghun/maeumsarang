package com.example.mshintra.common.service;

import com.example.mshintra.common.dto.CommonCodeDto;
import com.example.mshintra.common.mapper.CommonCodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommonCodeService {

    private final CommonCodeMapper commonCodeMapper;

    //근무코드 a1일부터 a31일까지 매핑해서 출력
    public <T> void mapGunmuCode(List<T> targetList) {

        List<CommonCodeDto> gunmuCodes = commonCodeMapper.selectGunmuCodeList();

        Map<String, String> gunmuCodeMap = gunmuCodes.stream().collect(Collectors.toMap(CommonCodeDto::getCode, CommonCodeDto::getCodeNm));

        for (T dto : targetList) {
            Class<?> clazz = dto.getClass();

            for (int i = 1; i <= 31; i++) {
                try {
                    String fieldName = "a" + i;
                    Field field = clazz.getDeclaredField(fieldName);
                    field.setAccessible(true);

                    String code = (String) field.get(dto);
                    if (code == null || code.isBlank()) {
                        continue;
                    }

                    String mappedName = gunmuCodeMap.getOrDefault(code, code);
                    field.set(dto, mappedName);

                } catch (NoSuchFieldException | IllegalAccessException e) {
                    // log.debug("error!@", e);
                }
            }
        }
    }

    //부서코드 codeField에 변환할 부서코드 컬럼명, nameField에 반환할 컬럼명
    public <T> void mapBuserCode(List<T> targetList, String codeField, String nameField) {
        List<CommonCodeDto> codes = commonCodeMapper.selectBuserCodeList();
        applyCodeMapping(targetList, codeField, nameField, codes);
    }

    //직급코드 codeField에 변환할 직급코드 컬럼명, nameField에 반환할 컬럼명
    public <T> void mapJikgubCode(List<T> targetList, String codeField, String nameField) {
        List<CommonCodeDto> codes = commonCodeMapper.selectJikgubCodeList();
        applyCodeMapping(targetList, codeField, nameField, codes);
    }

    //코드매핑
    private <T> void applyCodeMapping(List<T> targetList, String codeField, String nameField, List<CommonCodeDto> codeList) {

        Map<String, String> codeMap = codeList.stream().collect(Collectors.toMap(CommonCodeDto::getCode, CommonCodeDto::getCodeNm));

        for (T dto : targetList) {
            try {
                Field codeF = dto.getClass().getDeclaredField(codeField);
                Field nameF = dto.getClass().getDeclaredField(nameField);

                codeF.setAccessible(true);
                nameF.setAccessible(true);

                String code = (String) codeF.get(dto);
                if (code == null) continue;

                nameF.set(dto, codeMap.getOrDefault(code, code));
            } catch (Exception ignored) {}
        }
    }

    //사번정리
    public <T> void formatSabun(List<T> targetList, String sabunFieldName) {

        for (T list : targetList) {
            try {
                Field field = list.getClass().getDeclaredField(sabunFieldName);
                field.setAccessible(true);

                Object value = field.get(list);
                if (!(value instanceof String)) {
                    continue;
                }

                String sabun = ((String) value);

                sabun = sabun.trim();
                if (sabun.length() == 4 && !sabun.contains("-")) {
                    String formatted = sabun.substring(0, 2) + "-" + sabun.substring(2);
                    field.set(list, formatted);
                }

            } catch (NoSuchFieldException | IllegalAccessException ignored) {}
        }
    }

}
