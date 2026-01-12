<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>마음사랑병원</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="manifest" href="<c:url value='/manifest.json'/>">
    <meta name="theme-color" content="#ffffff">
    <script src="<c:url value='/js/common/sw-register.js'/>"></script>

    <link rel="stylesheet" href="<c:url value='/css/common.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/page/login.css'/>">
</head>

<body class="login-page">
<div class="login-wrap">
    <div class="login-card">
        <%--로고--%>
        <div class="login-logo">
            <img src="<c:url value='/images/mainLogo.png'/>" alt="Maeumsarang Hospital 로고">
        </div>
<%--        <h1 class="login-title">직원 로그인</h1>--%>
        <div id="loginError" class="login-error">
            <c:if test="${param.error eq 'true'}">
                <c:out value="아이디 또는 비밀번호를 확인해 주세요."/>
            </c:if>
        </div>
        <%--ID PW--%>
        <form id="loginForm" action="<c:out value='/login/loginProc.do'/>" method="post">
            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
            <div class="form-group">
                <label class="form-label" for="loginId">아이디</label>
                <input class="form-input" type="text" id="loginId" name="loginId" autocomplete="username">
            </div>
            <div class="form-group">
                <label class="form-label" for="loginPw">비밀번호</label>
                <input class="form-input" type="password" id="loginPw" name="loginPw" autocomplete="current-password">
            </div>
            <button type="submit" class="login-btn">로그인</button>
        </form>

        <div class="login-footer">ⓒ Maeumsarang Hospital</div>
    </div>
</div>

<script src="<c:url value='/js/common/jquery-3.7.1.min.js'/>"></script>
<script src="<c:url value='/js/login/login.js'/>"></script>
</body>
</html>
