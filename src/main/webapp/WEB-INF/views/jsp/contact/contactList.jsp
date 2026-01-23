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
        <div id="contactList"></div>
    </main>
</div>

<script src="<c:url value='/js/contact/contactList.js'/>"></script>
</body>
</html>
