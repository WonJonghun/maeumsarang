package com.example.mshintra.foodMenu.mapper;

import com.example.mshintra.foodMenu.dto.MealRecipeTagDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MealAutoToolMapper {

    List<MealRecipeTagDto> selectRecipeTagList(@Param("reCode") String reCode);

    List<MealRecipeTagDto> selectRecipeTagAllList();
}