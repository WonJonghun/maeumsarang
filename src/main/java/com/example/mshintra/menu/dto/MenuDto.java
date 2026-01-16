package com.example.mshintra.menu.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuDto {

    private String ccCode;          //코드, ex) 사내업무=0100000000, 01로 시작하는 ccCode 전부 사내업무
    private String ccMenuName;      //메뉴명
    private int ccLevel;            //메뉴뎁스
    private String ccWinName;       //??+코드+베이스키 ex) 4;w_elecsign;WS
    private String ccWinCode;       //코드 ex) w_elecsign
    private String ccMenu2;         //메뉴 URL
    private String ccBaseKey;       //메뉴 키값

    @Builder.Default
    private List<MenuDto> children = new ArrayList<>();    //서브메뉴
}
