<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/lookList.css'/>">
</head>

<body class="property-look-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="Y"/>
    <c:set var="headerDefaultRangeDays" value="0"/>
    <c:set var="headerSelectBox" value="0"/>
    <%@ include file="../common/header.jspf" %>

    <main class="property-look-wrap">
        <div id="property-look-list"></div>
    </main>
</div>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/property/lookList.js'/>"></script>
</body>
</html>