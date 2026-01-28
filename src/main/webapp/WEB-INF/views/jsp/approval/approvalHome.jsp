<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/approval/approvalHome.css'/>">
</head>

<body class="approval-home-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <%@ include file="../common/header.jspf" %>

    <main class="approval-Home-wrap">
        <div id="approvalHome"></div>
    </main>
</div>

<script src="<c:url value='/js/approval/approvalHome.js'/>"></script>
</body>
</html>
