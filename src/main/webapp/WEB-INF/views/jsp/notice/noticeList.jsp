<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${cmAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/main.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/page/noticeList.css'/>">
</head>

<body class="notice-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="Y"/>
    <%@ include file="../common/header.jspf" %>

    <main class="notice-list-wrap">
        <div id="noticeList"></div>
    </main>
</div>

<input type="hidden" id="noticeBaseKey" value="<c:out value='${baseKey}'/>"/>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/common/postDrawer.js'/>"></script>
<script src="<c:url value='/js/notice/noticeList.js'/>"></script>
</body>
</html>
