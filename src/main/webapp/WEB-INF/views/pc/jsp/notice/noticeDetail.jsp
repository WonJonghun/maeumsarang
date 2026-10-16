<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <title><c:out value="${post.tnTitle}"/></title>
    <%@ include file="/WEB-INF/views/pc/jsp/common/font-inc.jspf" %>
    <%@ include file="/WEB-INF/views/common/jsp/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/pc/css/common/layout.css'/>">
    <link rel="stylesheet" href="<c:url value='/pc/css/common/board.css'/>">
    <link rel="stylesheet" href="<c:url value='/common/css/cmPopup.css'/>">
    <script src="<c:url value='/common/js/cmPopup.js'/>"></script>
</head>
<body class="pc-page pc-board-popup">
<article class="pc-board-detail" data-tv-uk="<c:out value='${post.tvUk}'/>" data-flag="<c:out value='${post.tnFlag}'/>"
         data-attach-id="<c:out value='${post.tnImgNum}'/>">
    <header class="pc-board-detail-heading">
        <h1><c:out value="${post.tnTitle}"/></h1>
        <div class="pc-board-detail-meta">
            <span><c:out value="${post.tnUk}"/></span>
            <time><c:out value="${post.tnDateStr}"/></time>
            <span>조회 <c:out value="${post.viewCount}"/></span>
        </div>
    </header>
    <div class="pc-board-detail-body"><c:out value="${post.tnRemark}"/></div>
    <div id="pcBoardImages" class="pc-board-detail-images"></div>
    <section id="pcBoardAttachments" class="pc-board-attachments" aria-labelledby="pcBoardAttachTitle" hidden>
        <h2 id="pcBoardAttachTitle">첨부파일</h2>
        <ul id="pcBoardAttachList"></ul>
    </section>
</article>
<script src="<c:url value='/pc/js/notice/noticeDetail.js'/>"></script>
</body>
</html>
