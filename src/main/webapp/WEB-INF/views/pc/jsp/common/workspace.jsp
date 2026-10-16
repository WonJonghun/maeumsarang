<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <title>마음사랑병원 인트라넷</title>
    <%@ include file="/WEB-INF/views/pc/jsp/common/font-inc.jspf" %>
    <%@ include file="/WEB-INF/views/common/jsp/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/pc/css/common/layout.css'/>">
    <link rel="stylesheet" href="<c:url value='/common/css/cmPopup.css'/>">
    <script src="<c:url value='/common/js/cmPopup.js'/>"></script>
</head>
<body class="pc-page pc-workspace-page" data-user-id="<c:out value='${user.icCode}'/>"
      data-start-tab="<c:out value='${startTab}' default='main'/>" data-base-key="<c:out value='${baseKey}' default='1'/>">
<a class="pc-skip-link" href="#pcContent">본문 바로가기</a>
<%@ include file="header.jspf" %>
<div class="pc-shell">
    <%@ include file="menu.jspf" %>
    <main id="pcContent" class="pc-content" tabindex="-1" aria-label="업무 화면">
        <div id="pcWorkPanels" class="pc-work-panels"></div>
    </main>
</div>
<script src="<c:url value='/pc/js/common/tabs.js'/>"></script>
<script src="<c:url value='/pc/js/common/layout.js'/>"></script>
</body>
</html>
