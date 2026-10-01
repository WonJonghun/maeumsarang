<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>화면 이동 | 마음사랑병원</title>
    <link rel="stylesheet" href="<c:url value='/common/css/common.css'/>">
    <link rel="stylesheet" href="<c:url value='/common/css/login.css'/>">
</head>
<body class="login-redirect-page" data-login-device="authenticated"
      data-pc-url="<c:url value='/pc/main.do'/>" data-mobile-url="<c:url value='/main.do'/>">
<main>
    <p role="status">화면으로 이동하고 있습니다.</p>
    <noscript>
        <p>사용할 화면을 선택해 주세요.</p>
        <a href="<c:url value='/pc/main.do'/>">PC 화면</a>
        <a href="<c:url value='/main.do'/>">모바일 화면</a>
    </noscript>
</main>
<script src="<c:url value='/common/js/jquery-3.7.1.min.js'/>"></script>
<script src="<c:url value='/common/js/loginDevice.js'/>"></script>
</body>
</html>
