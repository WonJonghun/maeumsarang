<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/scheduleList.css'/>">
</head>

<body class="notice-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <%@ include file="../common/header.jspf" %>

    <main class="schedule-list-wrap">
        <div class="schedule-monthbar">
            <button type="button" id="btnYmPrev" class="ym-btn" aria-label="이전 달">
                <i class="bi bi-chevron-left"></i>
            </button>

            <input type="text"
                   id="scheduleYm"
                   class="ym-input"
                   inputmode="numeric"
                   maxlength="7"
                   placeholder="YYYY-MM"
                   autocomplete="off" />

            <button type="button" id="btnYmNext" class="ym-btn" aria-label="다음 달">
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>

        <div id="scheduleList" class="schedule-body"></div>
    </main>
</div>

<script src="<c:url value='/js/schedule/scheduleList.js'/>"></script>
</body>
</html>
