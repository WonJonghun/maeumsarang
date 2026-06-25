<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>오류 발생</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="<c:url value='/css/common.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/page/error.css'/>">
</head>
<body class="error-page">
<div class="error-wrap">
    <div class="error-box">
        <div class="error-code">500</div>
        <div class="error-msg">처리 중 오류가 발생했습니다.</div>
        <a href="<c:url value='/main.do'/>" class="error-btn">메인으로 이동</a>
    </div>
</div>
</body>
</html>