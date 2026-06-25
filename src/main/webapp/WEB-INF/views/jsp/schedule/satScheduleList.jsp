<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/satScheduleList.css'/>">
</head>

<body class="sat-schedule-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="N"/>
    <c:set var="headerDateYn" value="N"/>
    <c:set var="headerDefaultRangeDays" value="0"/>
    <c:set var="headerSelectBox" value="0"/>
    <c:set var="headerQrYn" value="N"/>
    <%@ include file="../common/header.jspf" %>

    <main class="sat-schedule-wrap">
        <div id="sat-schedule-table"></div>
    </main>
</div>

<script src="<c:url value='/js/schedule/satScheduleList.js'/>"></script>
</body>
</html>