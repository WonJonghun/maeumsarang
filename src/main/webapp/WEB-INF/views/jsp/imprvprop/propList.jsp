<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${cmAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/propList.css'/>">
</head>

<body class="notice-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="Y"/>
    <%@ include file="../common/header.jspf" %>

    <main class="prop-list-wrap">
        <div id="propList"></div>
    </main>
</div>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/imprvprop/propList.js'/>"></script>
</body>
</html>
