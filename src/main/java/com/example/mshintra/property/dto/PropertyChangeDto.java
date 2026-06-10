package com.example.mshintra.property.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PropertyChangeDto {

    private String pcCode;
    private Integer pcSeq;
    private String pcDate;
    private String pcFlag;
    private String pcJumFg;
    private String pcArea1;
    private String pcArea1Nm;
    private String pcArea2;
    private String pcArea2Nm;

    private String pcRepairPrCD;
    private String pcRepairPrNm;
    private String pcRepairItem;
    private Integer pcRepairAmt;
    private String pcUseHour;

    private String pcRemark;
    private String pcRegDate;
    private String pcUserID;
    private String pcUserNm;
}