package com.example.mshintra.profile;

import com.example.mshintra.common.dto.SearchDto;
import com.example.mshintra.common.util.DateUtil;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.profile.controller.ProfileController;
import com.example.mshintra.profile.dto.ProfileDto;
import com.example.mshintra.profile.mapper.ProfileMapper;
import com.example.mshintra.profile.service.ProfileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PcNotificationTest {

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void notificationUsesAuthenticatedEmployeeAndTodayAndKeepsProcedureCoopCount() throws Exception {
        ProfileMapper mapper = mock(ProfileMapper.class);
        ProfileDto row = new ProfileDto();
        row.setCcCnt1(3);
        row.setCcCnt99(12);
        row.setCcCnt2(5);
        when(mapper.selectCheckApproList(any())).thenReturn(List.of(row));

        LoginUserDto user = new LoginUserDto();
        user.setIcCode("251101");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));

        var mvc = MockMvcBuilders.standaloneSetup(new ProfileController(new ProfileService(mapper)))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/profile/pc/checkApproList.do")
                        .param("searchId", "other-employee")
                        .param("searchDate", "2000-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ccCnt1").value(3))
                .andExpect(jsonPath("$[0].ccCnt99").value(12))
                .andExpect(jsonPath("$[0].ccCnt2").value(5));

        var search = ArgumentCaptor.forClass(SearchDto.class);
        verify(mapper).selectCheckApproList(search.capture());
        assertEquals("251101", search.getValue().getSearchId());
        assertEquals(DateUtil.getTodayYmd("-"), search.getValue().getSearchDate());
        assertNull(search.getValue().getSearchFromDate());
        assertNull(search.getValue().getSearchToDate());
        verify(mapper, never()).selectCoopCnt(any());
    }

    @Test
    void notificationReturnsEmptyListWhenProcedureHasNoRows() {
        ProfileMapper mapper = mock(ProfileMapper.class);
        when(mapper.selectCheckApproList(any())).thenReturn(List.of());

        assertEquals(List.of(), new ProfileService(mapper).selectPcCheckApproList("251101"));
        verify(mapper, never()).selectCoopCnt(any());
    }
}
