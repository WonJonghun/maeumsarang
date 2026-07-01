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
    <c:set var="headerWriteYn" value="${ccBaseKey eq 'OF' or ccFlag eq 'OF' ? 'Y' : 'N'}"/>
    <c:set var="headerDefaultRangeDays" value="90"/>
    <c:set var="headerSelectBox" value="${ccBaseKey eq 'PL' ? 0 : 1}"/>
    <%@ include file="../common/header.jspf" %>

    <main class="approval-list-wrap">
        <c:if test="${ccBaseKey eq 'PL'}">
            <div class="approval-tab-wrap">
                <button type="button" class="approval-tab active" data-paper-tab="공문">공문</button>
                <button type="button" class="approval-tab" data-paper-tab="등기">등기</button>
                <button type="button" class="approval-tab" data-paper-tab="택배">택배</button>
            </div>
        </c:if>

        <div id="approvalList"></div>
    </main>

    <input type="hidden" id="ccFlag" value="<c:out value='${ccFlag}'/>"/>
    <input type="hidden" id="ccHomeFlag" value="<c:out value='${ccHomeFlag}'/>"/>
    <textarea id="approvalDocTypeJson" style="display:none;"><c:out value="${approvalDocTypeJson}" /></textarea>
    <input type="hidden" id="ccBaseKey" value="<c:out value='${ccBaseKey}'/>"/>
</div>

<template id="approvalOfWriteTemplate">
    <div class="post-detail-head">
        <h3 class="post-detail-title">휴가신청서 작성</h3>
    </div>

    <div class="approval-of-form">
        <div class="approval-of-period-row">
            <div class="approval-of-date-field">
                <label for="ofStartDate">시작일</label>
                <input type="date" id="ofStartDate">
            </div>

            <span class="approval-of-date-tilde">~</span>

            <div class="approval-of-date-field">
                <label for="ofEndDate">종료일</label>
                <input type="date" id="ofEndDate">
            </div>
        </div>

        <div class="approval-of-section">
            <div class="approval-of-section-title">휴가일</div>
            <div id="approvalOfDayList" class="approval-of-day-list"></div>
        </div>

        <div class="approval-of-purpose-row">
            <label for="ofReason">휴가목적</label>
            <textarea id="ofReason" rows="2" maxlength="200" placeholder="휴가목적을 입력해주세요."></textarea>
        </div>

        <div class="approval-action-wrap">
            <button type="button" id="approvalOfSaveBtn" class="approval-action-btn approval-sign-btn">등록</button>
        </div>
    </div>
</template>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/approval/approvalList.js'/>"></script>
</body>
</html>