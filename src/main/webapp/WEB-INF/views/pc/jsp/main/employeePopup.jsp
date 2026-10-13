<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <title>직원정보</title>
    <%@ include file="/WEB-INF/views/common/jsp/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/pc/css/common/layout.css'/>">
    <link rel="stylesheet" href="<c:url value='/pc/css/main/main.css'/>">
    <link rel="stylesheet" href="<c:url value='/pc/css/main/employeePopup.css'/>">
    <link rel="stylesheet" href="<c:url value='/common/css/cmPopup.css'/>">
    <script src="<c:url value='/common/js/cmPopup.js'/>"></script>
</head>
<body class="pc-page pc-popup-page">
<main class="pc-employee-content">
    <section class="pc-employee-profile pc-myinfo-card" aria-label="직원 프로필">
        <span class="profile pc-profile pc-employee-photo">
            <c:url var="employeePhoto" value="/attach/profileView.do">
                <c:param name="afNum" value="${fn:trim(employee.icCode)}"/>
                <c:param name="afSeq" value="1"/>
                <c:param name="thumbnail" value="true"/>
            </c:url>
            <img id="pcEmployeePhoto" class="profile-img" src="<c:out value='${employeePhoto}'/>"
                 data-fallback-src="<c:url value='/images/emptyUser.png'/>" alt="<c:out value='${employee.icName}'/> 사진">
        </span>
        <div class="pc-employee-identity">
            <strong class="pc-employee-name"><c:out value="${employee.icName}"/></strong>
            <table class="pc-myinfo-details" aria-label="직원 기본정보 및 연락처">
                <colgroup><col class="pc-myinfo-main-field"><col></colgroup>
                <tbody>
                    <tr>
                        <td><dl><dt>부서</dt><dd><c:out value="${employee.ccBuser}"/></dd></dl></td>
                        <td><dl><dt>사번</dt><dd><c:out value="${employee.icCode}"/></dd></dl></td>
                    </tr>
                    <tr>
                        <td><dl><dt>직급</dt><dd><c:out value="${employee.icJikgubNm}"/></dd></dl></td>
                        <td><dl><dt>직군</dt><dd><c:out value="${employee.icJikchekNm}"/></dd></dl></td>
                    </tr>
                    <tr>
                        <td><dl><dt>내선</dt><dd><c:out value="${employee.icSaphone}" default="—"/></dd></dl></td>
                        <td><dl><dt>근무</dt><dd id="pcEmployeeWork" aria-live="polite">—</dd></dl></td>
                    </tr>
                    <tr><td colspan="2"><dl><dt>휴대폰</dt><dd><c:out value="${employee.icHpPhone}" default="—"/></dd></dl></td></tr>
                    <tr><td colspan="2"><dl><dt>이메일</dt><dd id="pcEmployeeEmail" class="pc-myinfo-email" title="<c:out value='${employee.icPEmail}'/>"><c:out value="${employee.icPEmail}" default="—"/></dd></dl></td></tr>
                </tbody>
            </table>
        </div>
    </section>
    <section id="pcEmployeeCalendar" class="pc-calendar" aria-label="직원 월간 근무 달력"
             data-user-id="<c:out value='${employee.icCode}'/>" data-team-code="<c:out value='${employee.icBuser}'/>"
             data-work-flag="<c:out value='${employee.flag}'/>" data-selected-date="<c:out value='${baseDt}'/>" data-loading="true">
        <div class="pc-calendar-toolbar">
            <button type="button" id="pcEmployeePrev" class="pc-main-icon-button" aria-label="이전 달"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
            <strong class="pc-calendar-month"></strong>
            <button type="button" id="pcEmployeeNext" class="pc-main-icon-button" aria-label="다음 달"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
            <button type="button" id="pcEmployeeToday" class="pc-main-text-button">오늘</button>
        </div>
        <div class="pc-calendar-week" aria-hidden="true"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div>
        <div class="pc-calendar-days" aria-label="근무 날짜 선택"></div>
        <p class="pc-main-status pc-calendar-status" role="status"></p>
    </section>
</main>
<script src="<c:url value='/pc/js/common/calendar.js'/>"></script>
<script src="<c:url value='/pc/js/main/employeePopup.js'/>"></script>
</body>
</html>
