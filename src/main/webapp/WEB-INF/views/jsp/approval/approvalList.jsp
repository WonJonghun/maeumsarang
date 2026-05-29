<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/approval/approvalList.css'/>">
</head>

<body class="approval-list-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <c:set var="headerDateYn" value="Y"/>
    <c:set var="headerDefaultRangeDays" value="90"/>
    <c:set var="headerSelectBox" value="1"/>
    <%@ include file="../common/header.jspf" %>

    <main class="approval-list-wrap">
        <div id="approvalList"></div>
    </main>

    <input type="hidden" id="ccFlag" value="<c:out value='${ccFlag}'/>"/>
    <input type="hidden" id="ccHomeFlag" value="<c:out value='${ccHomeFlag}'/>"/>
    <textarea id="approvalDocTypeJson" style="display:none;"><c:out value="${approvalDocTypeJson}" /></textarea>
    <input type="hidden" id="ccBaseKey" value="<c:out value='${ccBaseKey}'/>"/>
</div>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/approval/approvalList.js'/>"></script>
</body>
</html>
