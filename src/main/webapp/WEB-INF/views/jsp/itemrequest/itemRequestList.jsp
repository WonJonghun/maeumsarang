<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/itemRequestList.css'/>">
</head>

<body class="item-request-list-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="Y"/>
    <c:set var="headerDefaultRangeDays" value="90"/>
    <c:set var="headerSelectBox" value="0"/>
    <%@ include file="../common/header.jspf" %>

    <main class="item-request-list-wrap">
        <div id="item-request-list"></div>
    </main>

<%--    <input type="hidden" id="ccFlag" value="<c:out value='${ccFlag}'/>"/>--%>
</div>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/itemrequest/itemRequestList.js'/>"></script>
</body>
</html>
