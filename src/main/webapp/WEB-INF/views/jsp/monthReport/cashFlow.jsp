<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/cashFlow.css'/>">
</head>

<body class="cash-flow-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="Y"/>
    <c:set var="headerDefaultRangeDays" value="0"/>
    <c:set var="headerSelectBox" value="0"/>
    <c:set var="headerQrYn" value="N"/>
    <%@ include file="../common/header.jspf" %>

    <main class="cash-flow-wrap">
        <div id="cash-flow-summary" class="cash-flow-summary"></div>
        <div id="cash-flow-table"></div>
    </main>
</div>

<script src="<c:url value='/js/monthReport/cashFlow.js'/>"></script>
</body>
</html>