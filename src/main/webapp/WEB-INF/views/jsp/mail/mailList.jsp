<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/mailList.css'/>">
</head>

<body class="mail-list-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="N"/>
<%--    <c:set var="headerDefaultRangeDays" value="90"/>--%>
    <%@ include file="../common/header.jspf" %>

    <main class="mail-list-wrap">
        <div class="mail-tab-wrap">
            <button type="button" class="mail-tab active" data-tab="receive">받은메일</button>
            <button type="button" class="mail-tab" data-tab="send">보낸메일</button>
            <button type="button" class="mail-tab" data-tab="delete">휴지통</button>
            <button type="button" class="mail-tab" data-tab="old">만료메일</button>
        </div>

        <div id="mailList"></div>
    </main>
    
</div>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/mail/mailList.js'/>"></script>
</body>
</html>
