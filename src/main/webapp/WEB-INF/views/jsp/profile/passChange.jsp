<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/passChange.css'/>">
</head>

<body class="passChange-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="N"/>
    <%@ include file="../common/header.jspf" %>

    <main class="passChange-wrap">
        <form id="passChangeForm" class="pass-change-form" action="<c:url value='/profile/passChangeProc.do'/>" method="post">
            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>

            <div class="pass-change-box">
                <div class="pass-change-row">
                    <label for="oldPassword">현재 비밀번호</label>
                    <input type="password" id="oldPassword" name="oldPassword" autocomplete="current-password">
                </div>

                <div class="pass-change-row">
                    <label for="newPassword">새로운 비밀번호</label>
                    <input type="password" id="newPassword" name="newPassword" autocomplete="new-password">
                </div>

                <div class="pass-change-row">
                    <label for="newPasswordConfirm">새 비밀번호 확인</label>
                    <input type="password" id="newPasswordConfirm" name="newPasswordConfirm" autocomplete="new-password">
                </div>
            </div>

            <div class="pass-change-guide">
                <p><br/>※ 비밀번호 설정 기준</p>
                <ol>
                    <li>최소 10자리이상</li>
                    <li>사원번호,전화번호,생년월일,연속문자(숫자) 제외</li>
                    <li>특수문자,영문,숫자 포함</li>
                </ol>
            </div>

            <div class="pass-change-btn-wrap">
                <button type="submit" class="pass-change-save-btn">저장</button>
            </div>
        </form>
    </main>
</div>

<script src="<c:url value='/js/profile/passChange.js'/>"></script>
</body>
</html>