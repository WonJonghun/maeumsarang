<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/contactList.css'/>">
</head>

<body class="contact-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <%@ include file="../common/header.jspf" %>

    <main class="contact-list-wrap">
        <!-- 카테고리 -->
        <div class="contact-category-bar">
            <div class="contact-tabs" role="tablist" aria-label="연락처 보기 옵션">
                <button type="button" class="contact-tab is-active" data-view="all" role="tab" aria-selected="true">전체</button>
                <button type="button" class="contact-tab" data-view="myDept" role="tab" aria-selected="false">내 부서</button>
                <button type="button" class="contact-tab" data-view="compact" role="tab" aria-selected="false">간편조회</button>
            </div>
        </div>

        <div id="contactList">
          <div id="viewAll" class="contact-view"></div>
          <div id="viewCompact" class="contact-view" style="display:none;"></div>
        </div>
    </main>
</div>

<script src="<c:url value='/js/contact/contactList.js'/>"></script>
</body>
</html>
