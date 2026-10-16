package com.example.mshintra.main;

import com.example.mshintra.main.controller.MainController;
import com.example.mshintra.main.dto.MainOutDutyDto;
import com.example.mshintra.main.mapper.MainMapper;
import com.example.mshintra.main.service.MainService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MainOutDutyTest {

    @Test
    void outpatientReturnsIndividualDoctorsForSelectedDate() throws Exception {
        MainMapper mapper = mock(MainMapper.class);
        String[][] doctors = {
                {"오전", "0105", "이건학"},
                {"오전", "230403", "김경민"},
                {"오후", "0830", "송봉용"},
                {"오후", "180304", "고요한"},
                {"오후", "181001", "곽준"}
        };
        List<MainOutDutyDto> rows = new ArrayList<>();
        for (String[] doctor : doctors) {
            MainOutDutyDto item = new MainOutDutyDto();
            item.setCcFlag(doctor[0]);
            item.setCcCode(doctor[1]);
            item.setCcName(doctor[2]);
            item.setCcDeptCd("NP");
            rows.add(item);
        }
        when(mapper.selectMainOutDutyList("2026-10-07")).thenReturn(rows);
        when(mapper.selectMainOutDutyList("2026-10-08")).thenReturn(List.of());

        var mvc = MockMvcBuilders.standaloneSetup(new MainController(null, null, null, new MainService(mapper), null))
                .build();
        var response = mvc.perform(get("/pc/main/outDutyList.do").param("searchDate", "2026-10-07"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
        for (int index = 0; index < doctors.length; index++) {
            response.andExpect(jsonPath("$[" + index + "].ccFlag").value(doctors[index][0]))
                    .andExpect(jsonPath("$[" + index + "].ccCode").value(doctors[index][1]))
                    .andExpect(jsonPath("$[" + index + "].ccName").value(doctors[index][2]))
                    .andExpect(jsonPath("$[" + index + "].ccDeptCd").value("NP"));
        }
        verify(mapper).selectMainOutDutyList("2026-10-07");

        mvc.perform(get("/pc/main/outDutyList.do").param("searchDate", "2026-10-08"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        verify(mapper).selectMainOutDutyList("2026-10-08");

        mvc.perform(get("/pc/main/outDutyList.do"))
                .andExpect(status().isBadRequest());
    }
}
