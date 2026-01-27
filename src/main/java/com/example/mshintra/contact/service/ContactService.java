package com.example.mshintra.contact.service;

import com.example.mshintra.common.service.CommonCodeService;
import com.example.mshintra.contact.dto.ContactDto;
import com.example.mshintra.contact.mapper.ContactMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ContactService {

    private final ContactMapper contactMapper;
    private final CommonCodeService commonCodeService;

    @Transactional(readOnly = true)
    public List<ContactDto> selectContactList(String baseDt) {

        List<ContactDto> list = contactMapper.selectContactList(baseDt);
        commonCodeService.mapBuserCode(list, "icBuser", "icBuserNm");

        return list;
    }
}
