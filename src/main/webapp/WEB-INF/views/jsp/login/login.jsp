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
<%--                <label class="form-label" for="loginId">아이디</label>--%>
                <div class="input-with-icon">
                    <span class="input-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                            <path d="M20 21a8 8 0 0 0-16 0" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </span>
                    <input class="form-input" type="text" id="loginId" name="loginId" autocomplete="username" placeholder="아이디 또는 사번">
                </div>
            </div>
            <div class="form-group">
<%--                <label class="form-label" for="loginPw">비밀번호</label>--%>
                <div class="input-with-icon">
                    <span class="input-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </span>
                    <input class="form-input" type="password" id="loginPw" name="loginPw" autocomplete="current-password" placeholder="비밀번호">
                </div>
            </div>
            <div class="login-keep-wrap">
                <label class="login-keep-label" for="rememberMe">
                    <input type="checkbox" id="rememberMe" name="rememberMe" value="true">
                    <span>자동로그인</span>
                </label>
            </div>

            <button type="submit" class="login-btn">로그인</button>
        </form>

        <div class="login-footer">ⓒ Maeumsarang Hospital</div>
    </div>
</div>

<div id="cmLoadingLayer" class="cm-loading-layer">
    <div class="cm-loading-spinner"></div>
</div>

<script src="<c:url value='/js/common/jquery-3.7.1.min.js'/>"></script>
<script src="<c:url value='/js/login/login.js'/>"></script>
</body>
</html>
