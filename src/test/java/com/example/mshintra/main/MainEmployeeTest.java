package com.example.mshintra.main;

import com.example.mshintra.main.controller.MainController;
import com.example.mshintra.main.dto.MainEmployeeDto;
import com.example.mshintra.main.mapper.MainMapper;
import com.example.mshintra.main.service.MainService;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MainEmployeeTest {

    @Test
    void popupUsesDatabaseEmployeeCodeAndPreservesRequestedCode() throws Exception {
        MainMapper mapper = mock(MainMapper.class);
        MainService service = new MainService(mapper);
        ReflectionTestUtils.setField(service, "securityDecryptKey", "test-key");
        MainEmployeeDto employee = new MainEmployeeDto();
        employee.setIcCode("1678");
        when(mapper.selectMainEmployee("001678", "2026-10-12", true, "test-key"))
                .thenReturn(employee);

        var mvc = MockMvcBuilders.standaloneSetup(new MainController(null, null, null, service, null)).build();
        mvc.perform(get("/pc/main/employeePopup.do")
                        .param("userId", "001678").param("baseDt", "2026-10-12").param("formatted", "true"))
                .andExpect(status().isOk())
                .andExpect(view().name("pc/jsp/main/employeePopup"))
                .andExpect(model().attribute("employee", employee))
                .andExpect(model().attribute("baseDt", "2026-10-12"));
        verify(mapper).selectMainEmployee("001678", "2026-10-12", true, "test-key");

        employee.setIcCode("0105");
        when(mapper.selectMainEmployee("0105", "2026-10-12", false, "test-key"))
                .thenReturn(employee);
        mvc.perform(get("/pc/main/employeePopup.do").param("userId", "0105").param("baseDt", "2026-10-12"))
                .andExpect(status().isOk())
                .andExpect(model().attribute("employee", employee));
        assertEquals("0105", employee.getIcCode());
        verify(mapper).selectMainEmployee("0105", "2026-10-12", false, "test-key");

        mvc.perform(get("/pc/main/employeePopup.do").param("userId", "missing").param("baseDt", "2026-10-12"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/pc/main/employeePopup.do").param("userId", "0105").param("baseDt", "invalid"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/pc/main/employeePopup.do").param("baseDt", "2026-10-12"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void employeeQueryBindsOriginalCodeAndDecryptKey() throws Exception {
        Configuration config = new Configuration();
        try (var input = new ClassPathResource("mybatis/mapper/MainMapper.xml").getInputStream()) {
            new XMLMapperBuilder(input, config, "MainMapper.xml", config.getSqlFragments()).parse();
        }
        var statement = config.getMappedStatement(MainMapper.class.getName() + ".selectMainEmployee");
        var exact = statement.getBoundSql(Map.of("userId", "0105", "baseDt", "2026-10-12",
                "formatted", false, "securityDecryptKey", "test-key"));
        assertFalse(exact.getSql().contains("RIGHT('000000'"));
        assertTrue(exact.getSql().contains("AND Ic_Code = ?"));
        assertEquals(2, exact.getParameterMappings().stream()
                .filter(param -> param.getProperty().equals("securityDecryptKey")).count());
        var formatted = statement.getBoundSql(Map.of("userId", "001678", "baseDt", "2026-10-12",
                "formatted", true, "securityDecryptKey", "test-key"));
        assertTrue(formatted.getSql().contains("RIGHT('000000' + RTRIM(Ic_Code), 6) = ?"));
        assertEquals("001678", ((Map<?, ?>) formatted.getParameterObject()).get("userId"));
    }
}
