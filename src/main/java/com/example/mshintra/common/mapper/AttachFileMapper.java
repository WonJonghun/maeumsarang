package com.example.mshintra.common.mapper;

import com.example.mshintra.common.dto.AttachFileDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AttachFileMapper {

    List<AttachFileDto> selectAttachList(@Param("afNum") String afNum);

    AttachFileDto selectAttachOne(@Param("afNum") String afNum,@Param("afSeq") int afSeq);
}
