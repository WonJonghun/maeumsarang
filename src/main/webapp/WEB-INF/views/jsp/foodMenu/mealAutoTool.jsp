<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/mealAutoTool.css'/>">
</head>

<body class="meal-auto-tool-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="N"/>
    <c:set var="headerDateYn" value="N"/>
    <c:set var="headerDefaultRangeDays" value="0"/>
    <c:set var="headerSelectBox" value="0"/>
    <c:set var="headerQrYn" value="N"/>
    <c:set var="headerExcelYn" value="Y"/>

    <%@ include file="../common/header.jspf" %>

    <main class="meal-auto-tool-wrap">
        <div class="meal-weekbar">
            <div class="meal-week-nav">
                <button type="button" id="btnWeekPrev" class="meal-week-btn" aria-label="이전 주">
                    <i class="bi bi-caret-left-fill"></i>
                </button>

                <div id="mealWeekRange" class="meal-week-range"></div>

                <button type="button" id="btnWeekNext" class="meal-week-btn" aria-label="다음 주">
                    <i class="bi bi-caret-right-fill"></i>
                </button>
            </div>

            <button type="button" id="btnMealRegenerate" class="meal-regenerate-btn">
                <i class="bi bi-arrow-clockwise"></i>
                다시 생성
            </button>
        </div>

        <div id="mealAutoToolList"></div>
    </main>
</div>

<script src="<c:url value='/js/foodMenu/mealAutoTool.js'/>"></script>
</body>
</html>