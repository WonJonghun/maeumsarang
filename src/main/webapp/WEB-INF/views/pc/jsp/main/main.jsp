<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <title>마음사랑병원 인트라넷</title>
    <%@ include file="/WEB-INF/views/common/jsp/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/pc/css/common/layout.css'/>">
</head>
<body class="pc-page">
<a class="pc-skip-link" href="#pcContent">본문 바로가기</a>
<%@ include file="../common/header.jspf" %>

<div class="pc-shell">
    <%@ include file="../common/menu.jspf" %>
    <main id="pcContent" class="pc-content" tabindex="-1" aria-label="업무 콘텐츠"></main>
</div>

<script src="<c:url value='/pc/js/common/layout.js'/>"></script>
</body>
</html>
