<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>마음사랑병원</title>
    <%@ include file="../common/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/css/calendar.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/page/main.css'/>">
</head>

<body class="main-page">

<div class="page-root">
    <%--상단바--%>
    <%@ include file="../common/header.jspf" %>

    <main class="main-wrap">
        <section class="welcome-wrap">
<%--            <div class="welcome-top">--%>
<%--                <p class="welcome-text">--%>
<%--                    <span class="welcome-name text-blue"><c:out value="${user.icName}"/></span>--%>
<%--                    <span class="welcome-small">님, 환영합니다!</span>--%>
<%--                </p>--%>
<%--                <p class="welcome-date"><c:out value="${welcomeDate}"/></p>--%>
<%--            </div>--%>

            <%--슬로건 i_mission 테이블에서 불러오면 됨, 허나 하드코딩--%>
            <div class="welcome-logo-box">
                <div class="logo-slogan-top">
                    <p class="logo-slogan-title">"2026년 슬로건"</p>
                    <p class="logo-slogan-sub text-blue">더 높이! 더 가까이!</p>
                </div>
                <div class="logo-heart-wrap">
                    <img src="<c:url value='/images/symbol1.png'/>" class="welcome-logo" alt="회사 로고">
                    <div class="logo-slogan-inner">
                        <p class="slogan-title">MISSION</p>
                        <p class="slogan-content">최상의 의료서비스로 "인간사랑" 구현</p>
                        <p class="slogan-title">VISION 2026</p>
                        <ul class="slogan-list">
                            <li>전문성 있는 진료로 신뢰받는 병원</li>
                            <li>사랑실천으로 고객이 행복한 병원</li>
                            <li>창의적인 인재양성으로 신바람 나게 <br/>일하는 병원</li>
                            <li>지역사회의 건강과 행복한 삶에 <br/>기여하는 병원</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <%--공지--%>
        <section class="card">
            <div class="card-header">
                <div class="card-header-left">
                    <h3 class="card-title">공지사항</h3>
                </div>
                <a class="btn-text-muted js-move-window" href="#" data-code="0101010000"
                    data-url="/notice/board.do" data-base-key="1" data-win-code="w_gongji_list"
                    data-win-name="4;w_gongji_list;1" data-menu-name="직원공지사항">전체보기 &gt;</a>
            </div>

            <c:forEach var="notice" items="${noticeList}" varStatus="st">
                <div class="notice-row js-post-row<c:if test='${st.last}'> notice-row-last</c:if>" role="button"
                     tabindex="0"
                     data-tn-title="<c:out value='${notice.tnTitle}'/>"
                     data-tn-date-str="<c:out value='${notice.tnDateStr}'/>"
                     data-tn-uk="<c:out value='${notice.tnUk}'/>"
                     data-tv-uk="<c:out value='${notice.tvUk}'/>"
                     data-view-count="<c:out value='${notice.viewCount}'/>"
                     data-tn-remark="<c:out value='${notice.tnRemark}'/>"
                     data-tn-img-num="<c:out value='${notice.tnImgNum}'/>">
                    <c:choose><c:when test="${notice.ccView eq 'N'}">
                        <div class="dot-blue"></div>
                    </c:when><c:otherwise>
                        <div class="dot-gray"></div>
                    </c:otherwise></c:choose>
                    <div class="notice-text">
                        <p class="notice-title main-notice-title<c:if test='${notice.ccView eq "N"}'> text-deep-blue</c:if>"><c:out
                                value="${notice.tnTitle}"/></p>
                        <p class="notice-date"><c:out value="${notice.tnDateStr}"/> · <c:out value="${notice.tnUk}"/> ·
                            조회 <c:out
                                    value="${notice.viewCount}"/></p>
                    </div>
                </div>
            </c:forEach>
        </section>

        <%--자유게시판--%>
        <section class="card">
            <div class="card-header">
                <div class="card-header-left">
                    <h3 class="card-title">자유게시판</h3>
                </div>
                <a class="btn-text-muted js-move-window" href="#" data-code="0101020000"
                    data-url="/notice/board.do" data-base-key="2" data-win-code="w_gongji_list"
                    data-win-name="4;w_gongji_list;2" data-menu-name="자유게시판">전체보기 &gt;</a>
            </div>

            <c:forEach var="board" items="${boardList}" varStatus="st">
                <div class="notice-row js-post-row<c:if test='${st.last}'> notice-row-last</c:if>" role="button"
                     tabindex="0" data-tn-title="<c:out value='${board.tnTitle}'/>"
                     data-tn-date-str="<c:out value='${board.tnDateStr}'/>"
                     data-tn-uk="<c:out value='${board.tnUk}'/>"
                     data-tv-uk="<c:out value='${board.tvUk}'/>"
                     data-view-count="<c:out value='${board.viewCount}'/>"
                     data-tn-remark="<c:out value='${board.tnRemark}'/>"
                     data-tn-img-num="<c:out value='${board.tnImgNum}'/>">
                    <c:choose><c:when test="${board.ccView eq 'N'}">
                        <div class="dot-blue"></div>
                    </c:when><c:otherwise>
                        <div class="dot-gray"></div>
                    </c:otherwise></c:choose>
                    <div class="notice-text">
                        <p class="notice-title main-notice-title<c:if test='${board.ccView eq "N"}'> text-deep-blue</c:if>"><c:out
                                value="${board.tnTitle}"/></p>
                        <p class="notice-date"><c:out value="${board.tnDateStr}"/> · <c:out value="${board.tnUk}"/> · 조회
                            <c:out value="${board.viewCount}"/></p>
                    </div>
                </div>
            </c:forEach>
        </section>

        <section class="card dashboard-card">
            <%--달력--%>
            <div class="dashboard-block">
                <div class="card-body">
                    <div id="calendarContainer"></div>
                </div>
            </div>

            <%--당직자--%>
            <div class="dashboard-block">
                <div class="card-header">
                    <div class="card-header-left"><h3 class="card-title">당직자 / 외래진료</h3></div>
                </div>
                <div class="card-body">
                    <div class="duty-layout">
                        <div class="duty-column">
                            <div class="duty-section-title">당직자</div>
                            <ul class="duty-list">
                                <c:forEach var="item" items="${dayDutyList}">
                                    <li class="duty-row"><span class="duty-role"><c:out value="${item.hcName}"/></span><span class="duty-name"><c:out value="${item.duName}"/></span></li>
                                </c:forEach>
                            </ul>
                        </div>
                        <div class="outduty-column">
                            <div class="duty-section-title">외래진료</div>
                            <ul class="duty-list">
                                <c:forEach var="item" items="${outDayDutyList}">
                                    <li class="duty-row"><span class="outduty-role"><c:out value="${item.hcName}"/></span><span class="duty-name"><c:out value="${item.duName}"/></span></li>
                                </c:forEach>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <%--일정--%>
            <div class="dashboard-block">
                <div class="card-header">
                    <h3 class="card-title">일정
<%--                        <span class="card-subtitle"> / <c:out value="${todayYmdDot}" /></span>--%>
                    </h3>
                </div>

                <div class="schedule-list" id="todayScheduleList">
                    <c:if test="${empty calendarList}">
                        <div class="schedule-row">
                            <div class="schedule-card schedule-card-muted">
                                <p class="schedule-title">등록된 일정이 없습니다.</p>
                            </div>
                        </div>
                    </c:if>

                    <c:forEach var="item" items="${calendarList}">
                        <div class="schedule-row" data-time="<c:out value='${item.ccTime}'/>">
                            <div class="schedule-time">
                                <span class="schedule-time-main schedule-time-main-muted"><c:out value="${item.ccTime}"/></span>
                            </div>
                            <div class="schedule-card schedule-card-muted">
                                <p class="schedule-title"><c:out value="${item.ccRmk}"/></p>
                            </div>
                        </div>
                    </c:forEach>
                </div>
            </div>

            <%--환자 현황--%>
            <div class="dashboard-block">
                <div class="card-header">
                    <h3 class="card-title">환자 현황</h3>
                </div>

                <div class="patient-status-wrap">
                <c:set var="inHosPercent" value="0"/>
                <c:if test="${not empty customerDailyStats.cnt1}">
                    <fmt:formatNumber value="${customerDailyStats.cnt1 * 100 / 560}" type="number" maxFractionDigits="0" var="inHosPercent"/>
                </c:if>
                <div class="patient-chart">
                    <p class="patient-chart-label">재원</p>
                    <div class="circle-chart" style="--value:<c:out value='${inHosPercent}'/>; --chart-color:#1976d2;">
                        <div class="circle-chart-inner">
                            <span class="circle-chart-value"><c:out value="${customerDailyStats.cnt1}"/>명</span>
                            <span class="circle-chart-caption">(<c:out value="${inHosPercent}"/>%)</span>
                        </div>
                    </div>
                    <div class="patient-tooltip"><div class="patient-tooltip-inner">
                        <p><c:out value="${customerDailyStats.cnt1}"/>명 / 560명</p>
                        <p>(재원환자 / 허가병상)</p>
                    </div></div>
                </div>

                <c:set var="inoutPercent" value="0"/>
                <c:if test="${(not empty customerDailyStats.cnt4 or not empty customerDailyStats.cnt5)
                             and (customerDailyStats.cnt4 + customerDailyStats.cnt5) != 0}">
                    <fmt:formatNumber value="${customerDailyStats.cnt5 * 100 / (customerDailyStats.cnt4 + customerDailyStats.cnt5)}" type="number" maxFractionDigits="0" var="inoutPercent"/>
                </c:if>
                <div class="patient-chart">
                    <p class="patient-chart-label">입/퇴원</p>
                    <div class="circle-chart inout_chart" style="--value:<c:out value='${inoutPercent}'/>; --chart-color:#fda433;">
                        <div class="circle-chart-inner">
                            <span class="circle-chart-value"><c:out value="${customerDailyStats.cnt4}"/> / <c:out value="${customerDailyStats.cnt5}"/></span>
                            <span class="circle-chart-caption">(당일)</span>
                        </div>
                    </div>
                    <div class="patient-tooltip"><div class="patient-tooltip-inner">
                        <p><c:out value="${customerDailyStats.cnt2}"/>명 / <c:out value="${customerDailyStats.cnt3}"/>명</p>
                        <p>(월 누계)</p>
                    </div></div>
                </div>

                <c:set var="outPercent" value="0"/>
                <c:if test="${not empty customerDailyStats.cnt8 and customerDailyStats.cnt8 != '0'}">
                    <fmt:formatNumber value="${customerDailyStats.cnt9 * 100 / customerDailyStats.cnt8}" type="number" maxFractionDigits="0" var="outPercent"/>
                </c:if>
                <div class="patient-chart patient-chart-right">
                            <p class="patient-chart-label">외래</p>
                            <div class="circle-chart" style="--value:<c:out value='${outPercent}'/>; --chart-color:#43a047;">
                                <div class="circle-chart-inner">
                                    <span class="circle-chart-value"><c:out value="${customerDailyStats.cnt9}"/>명</span>
                                    <span class="circle-chart-caption">(<c:out value="${outPercent}"/>%)</span>
                        </div>
                    </div>
                    <div class="patient-tooltip"><div class="patient-tooltip-inner">
                        <p><c:out value="${customerDailyStats.cnt9}"/>명 / <c:out value="${customerDailyStats.cnt8}"/>명</p>
                        <p>(진료완료 / 외래접수)</p>
                    </div></div>
                </div>
                </div>
            </div>

            <%--생일자 / 휴가자--%>
            <div class="dashboard-block">
                <div class="card-header">
                    <div class="card-header-left"><h3 class="card-title">생일자 / 휴가자</h3></div>
                </div>

                <div class="card-body">
                    <div class="birth-vacation-layout">
                        <div class="birth-column ${not empty birthdayList ? 'has-data' : ''}">
                            <div class="duty-section-title">생일자</div>
                            <ul class="birth-vacation-list">
                                <c:if test="${empty birthdayList}">
                                    <li class="birth-vacation-empty">생일자가 없습니다.</li>
                                </c:if>
                                <c:forEach var="item" items="${birthdayList}">
                                    <li class="birth-vacation-row">
                                        <span class="birth-vacation-name"><c:out value="${item.ccName}"/></span>
                                        <span class="birth-vacation-type">
                                            <c:choose>
                                                <c:when test="${fn:contains(item.ccRemark, '+')}">양력</c:when>
                                                <c:when test="${fn:contains(item.ccRemark, '-')}">음력</c:when>
                                                <c:otherwise><c:out value="${item.ccRemark}"/></c:otherwise>
                                            </c:choose>
                                        </span>
                                    </li>
                                </c:forEach>
                            </ul>
                        </div>

                        <div class="vacation-column ${not empty vacationUserList ? 'has-data' : ''}">
                            <div class="duty-section-title">휴가자</div>
                            <ul class="birth-vacation-list">
                                <c:if test="${empty vacationUserList}">
                                    <li class="birth-vacation-empty">휴가자가 없습니다.</li>
                                </c:if>
                                <c:forEach var="item" items="${vacationUserList}">
                                    <li class="birth-vacation-row">
                                        <span class="birth-vacation-name"><c:out value="${item.ccName}"/></span>
                                        <span class="birth-vacation-type"><c:out value="${item.ccRemark}"/></span>
                                    </li>
                                </c:forEach>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    <%--        <section class="card">--%>
<%--            <div class="card-header">--%>
<%--                <h3 class="card-title">오늘의 식단</h3>--%>
<%--            </div>--%>
<%--            <div class="meal-row">--%>
<%--                <div class="meal-col">--%>
<%--                    <p class="meal-type">아침</p>--%>
<%--                    <p class="meal-menu">쌀밥</p>--%>
<%--                    <p class="meal-menu">누룽지탕</p>--%>
<%--                    <p class="meal-menu">닭살고추장볶음</p>--%>
<%--                    <p class="meal-menu">민물새우시래기지</p>--%>
<%--                    <p class="meal-menu">배추김치</p>--%>
<%--                    <p class="meal-kcal">350 kcal</p>--%>
<%--                </div>--%>

<%--                <div class="meal-col">--%>
<%--                    <p class="meal-type">점심</p>--%>
<%--                    <p class="meal-menu">찰밥</p>--%>
<%--                    <p class="meal-menu">새송이버섯탕수육</p>--%>
<%--                    <p class="meal-menu">갈치감자조림(세네갈/모로코)</p>--%>
<%--                    <p class="meal-menu">오징어사과초무침</p>--%>
<%--                    <p class="meal-menu">배추김치</p>--%>
<%--                    <p class="meal-kcal">750 kcal</p>--%>
<%--                </div>--%>

<%--                <div class="meal-col">--%>
<%--                    <p class="meal-type">저녁</p>--%>
<%--                    <p class="meal-menu">쌀밥</p>--%>
<%--                    <p class="meal-menu">김치만두국</p>--%>
<%--                    <p class="meal-menu">소고기불고기(호주산)</p>--%>
<%--                    <p class="meal-menu">콩나물겨자채</p>--%>
<%--                    <p class="meal-menu">동그랑땡</p>--%>
<%--                    <p class="meal-menu">배추김치</p>--%>
<%--                    <p class="meal-kcal">620 kcal</p>--%>
<%--                </div>--%>
<%--            </div>--%>
<%--        </section>--%>
    </main>
</div>

<ul id="holidayListData" style="display:none;">
    <c:forEach var="h" items="${holidayList}">
        <li data-date="<c:out value='${fn:substring(h.ccDt, 0, 10)}'/>"
            data-name="<c:out value='${h.ccOffNm}'/>"></li>
    </c:forEach>
</ul>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/common/calendar.js'/>"></script>
<script src="<c:url value='/js/common/postDrawer.js'/>"></script>
<script src="<c:url value='/js/main/main.js'/>"></script>
</body>
</html>
