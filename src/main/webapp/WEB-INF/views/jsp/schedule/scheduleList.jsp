<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/scheduleList.css'/>">
</head>

<body class="notice-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="Y"/>
    <%@ include file="../common/header.jspf" %>

    <main class="schedule-list-wrap">
        <div class="schedule-weekbar" aria-label="주 변경">
            <div class="week-row">
                <!-- 좌측: 주 변경 바 -->
                <div class="week-nav" role="group" aria-label="주 이동">
                    <button type="button" id="btnWeekPrev" class="week-btn" aria-label="이전 주">
                        <i class="bi bi-caret-left-fill"></i>
                    </button>

                    <button type="button" id="btnWeekRange" class="week-range" aria-label="주 선택">
                        <span class="week-range-text">YYYY.MM.DD ~ MM.DD</span>
                    </button>

                    <button type="button" id="btnWeekNext" class="week-btn" aria-label="다음 주">
                        <i class="bi bi-caret-right-fill"></i>
                    </button>
                </div>

                <!-- 우측: 2줄(주차/내부서) -->
                <div class="week-side">
                    <div class="week-side-top" aria-hidden="true">
                        <span class="week-badge"><span class="week-n">N</span>월 <span class="week-n">N</span>주차</span>
                    </div>

                    <div class="week-side-bottom">
                        <input type="checkbox" id="chkMyDept" class="dept-check">
                        <label for="chkMyDept" class="dept-label">내부서</label>
                    </div>
                </div>
            </div>
        </div>

        <div id="scheduleList">
            <div class="schedule-table">
                <div class="schedule-thead">
                    <div class="thead-left">
                        <div class="thead-left-top">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <div class="thead-left-bottom">
                            <span class="head-count">인원수</span>
                        </div>
                    </div>

                    <div class="thead-days">
                        <div class="day-col">
                            <div class="dow">월</div>
                            <div class="dom">일</div>
                        </div>
                        <div class="day-col">
                            <div class="dow">화</div>
                            <div class="dom">일</div>
                        </div>
                        <div class="day-col">
                            <div class="dow">수</div>
                            <div class="dom">일</div>
                        </div>
                        <div class="day-col">
                            <div class="dow">목</div>
                            <div class="dom">일</div>
                        </div>
                        <div class="day-col">
                            <div class="dow">금</div>
                            <div class="dom">일</div>
                        </div>
                        <div class="day-col sat">
                            <div class="dow">토</div>
                            <div class="dom">일</div>
                        </div>
                        <div class="day-col sun">
                            <div class="dow">일</div>
                            <div class="dom">일</div>
                        </div>
                    </div>
                </div>
                <div class="schedule-tbody" id="scheduleTbody"></div>
            </div>
        </div>
    </main>
</div>

<script src="<c:url value='/js/schedule/scheduleList.js'/>"></script>
</body>
</html>
