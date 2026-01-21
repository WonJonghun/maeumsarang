package com.example.mshintra.common.service;

import com.example.mshintra.common.dto.MenuAuthDto;
import com.example.mshintra.common.mapper.MenuAuthMapper;
import com.example.mshintra.common.util.CmUtil;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MenuAuthService {

    private final MenuAuthMapper menuAuthMapper;

    @Transactional(readOnly = true)
    public boolean checkAndSetSession(MenuAuthDto dto, HttpSession session) {

        String raw = CmUtil.trim(menuAuthMapper.selectAdminKey(dto));

        String perm = raw;
        String spMenuName = "";

        int comma = raw.indexOf(',');
        if (comma >= 0) {
            perm = CmUtil.trim(raw.substring(0, comma));
            spMenuName = CmUtil.trim(raw.substring(comma + 1));
        }

        dto.setAdminKey(perm);
        dto.setMenuName(spMenuName);

        //여따가 다 넣고 헤드로 쏨
        if (session != null) session.setAttribute("menuAuth", dto);

        //어드민키 맨앞글자 N이거나 YYYYYY 오면 튕구기
        if ("YYYYYY".equals(perm)) return false;
        if (!perm.isEmpty() && perm.charAt(0) == 'N') return false;

        return true;
    }
}
