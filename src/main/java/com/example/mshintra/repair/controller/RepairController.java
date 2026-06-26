package com.example.mshintra.repair.controller;

import com.example.mshintra.common.dto.MenuAuthDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.repair.dto.RepairDto;
import com.example.mshintra.repair.service.RepairService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Controller
@RequestMapping("/repair")
public class RepairController {

    private final RepairService repairService;

    @GetMapping("/repairList.do")
    public String repairList() {
        return "jsp/repair/repairList";
    }

    @ResponseBody
    @GetMapping("/list.do")
    public List<RepairDto> selectRepairList(@ModelAttribute RepairDto searchDto) {
        return repairService.selectRepairList(searchDto);
    }

    @ResponseBody
    @PostMapping("/updateProcess.do")
    public Map<String, Object> updateRepairProcess(@ModelAttribute RepairDto repairDto,
                                                   @AuthenticationPrincipal LoginUserDto loginUser,
                                                   HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        if (loginUser == null) {
            result.put("success", false);
            result.put("message", "로그인 정보가 없습니다.");
            return result;
        }

        if (!isRepairAdmin(session)) {
            result.put("success", false);
            result.put("message", "권한이 없습니다.");
            return result;
        }

        if (repairDto.getRpReUserId() == null || repairDto.getRpReUserId().isBlank()) {
            repairDto.setRpReUserId(loginUser.getIcCode());
        }

        if (repairDto.getRpJobUserId() == null || repairDto.getRpJobUserId().isBlank()) {
            repairDto.setRpJobUserId(loginUser.getIcCode());
        }

        int cnt = repairService.updateRepairProcess(repairDto);

        if (cnt == 0) {
            result.put("success", false);
            result.put("message", "진행중인 건만 수정할 수 있습니다.");
            return result;
        }

        result.put("success", true);
        result.put("message", "저장되었습니다.");
        return result;
    }

    private boolean isRepairAdmin(HttpSession session) {
        Object o = session == null ? null : session.getAttribute("menuAuth");
        if (!(o instanceof MenuAuthDto menuAuth)) return false;

        String adminKey = menuAuth.getAdminKey() == null ? "" : menuAuth.getAdminKey().trim();
        return adminKey.length() >= 7 && (adminKey.charAt(5) == 'Y' || adminKey.charAt(6) == 'Y');
    }
}