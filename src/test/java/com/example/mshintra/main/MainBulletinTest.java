package com.example.mshintra.main;

import com.example.mshintra.common.util.DateUtil;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.main.controller.MainController;
import com.example.mshintra.main.dto.MainBulletinDto;
import com.example.mshintra.main.mapper.MainMapper;
import com.example.mshintra.main.service.MainService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MainBulletinTest {

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void bulletinUsesAuthenticatedEmployeeAndTodayDespiteClientParameters() throws Exception {
        MainMapper mapper = mock(MainMapper.class);
        MainBulletinDto bulletin = new MainBulletinDto();
        bulletin.setCcTitle("설문 2건이 진행 중 입니다.");
        bulletin.setCcColor(1);
        when(mapper.selectMainBulletinList(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(List.of(bulletin));

        LoginUserDto user = new LoginUserDto();
        user.setIcCode("251101");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));

        var mvc = MockMvcBuilders.standaloneSetup(new MainController(null, null, null, new MainService(mapper)))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/pc/main/bulletinList.do")
                        .param("userId", "other-employee").param("searchDate", "2000-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ccTitle").value(bulletin.getCcTitle()))
                .andExpect(jsonPath("$[0].ccColor").value(1));

        String today = DateUtil.getTodayYmd("-");
        LocalDate date = LocalDate.parse(today);
        verify(mapper).selectMainBulletinList("251101", today,
                date.minusDays(7).toString(), date.plusDays(7).toString());
    }
}
