<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <title>마음사랑병원 인트라넷</title>
    <%@ include file="/WEB-INF/views/common/jsp/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/pc/css/common/layout.css'/>">
    <link rel="stylesheet" href="<c:url value='/pc/css/main/main.css'/>">
</head>
<body class="pc-page">
<a class="pc-skip-link" href="#pcContent">본문 바로가기</a>
<%@ include file="../common/header.jspf" %>

<div class="pc-shell">
    <%@ include file="../common/menu.jspf" %>
    <main id="pcContent" class="pc-content" tabindex="-1" aria-label="업무 콘텐츠">
        <div id="pcDashboard" class="pc-dashboard" data-user-id="<c:out value='${user.icCode}'/>"
             data-team-code="<c:out value='${user.icBuser}'/>" data-work-flag="<c:out value='${user.flag}'/>">
            <div class="pc-dashboard-grid">
                <div class="pc-dashboard-column pc-dashboard-column-left">

                    <section class="pc-main-card pc-myinfo-card" aria-labelledby="pcMyInfoTitle">
                        <div class="pc-main-card-heading"><h2 id="pcMyInfoTitle">내정보</h2><i class="bi bi-person" aria-hidden="true"></i></div>
                        <div class="pc-myinfo-user">
                            <span class="profile pc-profile pc-main-profile">
                                <img id="pcMainProfileImage" src="<c:out value='${pcProfileImageUrl}'/>"
                                     data-fallback-src="<c:url value='/images/emptyUser.png'/>" alt="" class="profile-img">
                            </span>
                            <div><strong><c:out value="${user.icName}"/></strong><p class="pc-myinfo-details"><span><c:out value="${user.ccBuser}"/></span><span class="pc-myinfo-code"><c:out value="${user.icCode}"/></span></p></div>
                        </div>
                        <div class="pc-commute" aria-label="선택일 출퇴근 시간">
                            <div><span>출근</span><strong id="pcCommuteIn">조회 중</strong></div>
                            <div><span>퇴근</span><strong id="pcCommuteOut">조회 중</strong></div>
                        </div>
                    </section>

                    <section class="pc-main-card pc-people-card" aria-labelledby="pcPeopleTitle">
                        <div class="pc-main-card-heading"><h2 id="pcPeopleTitle">휴가자 · 생일자</h2><span class="pc-selected-date"></span></div>
                        <div class="pc-people-columns">
                            <div class="pc-people-section"><h3>휴가자 <span id="pcVacationCount" class="pc-main-count">0</span></h3><ul id="pcMainVacations" class="pc-person-list pc-main-body"><li class="pc-main-empty">조회 중입니다.</li></ul></div>
                            <div class="pc-people-section"><h3>생일자 <span id="pcBirthdayCount" class="pc-main-count">0</span></h3><ul id="pcMainBirthdays" class="pc-person-list pc-main-body"><li class="pc-main-empty">조회 중입니다.</li></ul></div>
                        </div>
                    </section>

                </div>

                <div class="pc-dashboard-column pc-dashboard-column-center">
                    <section class="pc-main-notifications" aria-label="업무 알림">
                        <button type="button"><i class="bi bi-pencil-square" aria-hidden="true"></i><span>결재</span></button>
                        <button type="button"><i class="bi bi-envelope" aria-hidden="true"></i><span>메일</span></button>
                        <button type="button"><i class="bi bi-file-earmark-text" aria-hidden="true"></i><span>공문</span></button>
                        <button type="button"><i class="bi bi-mailbox" aria-hidden="true"></i><span>우편</span></button>
                        <button type="button"><i class="bi bi-box-seam" aria-hidden="true"></i><span>택배</span></button>
                        <button type="button"><i class="bi bi-people" aria-hidden="true"></i><span>협조</span></button>
                    </section>
                    <section class="pc-main-card pc-calendar-card" aria-labelledby="pcCalendarTitle">
                        <div class="pc-main-card-heading"><h2 id="pcCalendarTitle">달력 · 일정</h2><span class="pc-selected-date"></span></div>
                        <div class="pc-calendar-layout">
                            <div class="pc-calendar pc-main-body">
                                <div class="pc-calendar-toolbar">
                                    <button type="button" id="pcCalendarPrev" class="pc-main-icon-button" aria-label="이전 달"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
                                    <strong id="pcCalendarMonth"></strong>
                                    <button type="button" id="pcCalendarNext" class="pc-main-icon-button" aria-label="다음 달"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
                                    <button type="button" id="pcCalendarToday" class="pc-main-text-button">오늘</button>
                                </div>
                                <div class="pc-calendar-week" aria-hidden="true"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div>
                                <div id="pcCalendarDays" class="pc-calendar-days" aria-label="날짜 선택"></div>
                                <p id="pcCalendarStatus" class="pc-main-status" role="status"></p>
                                <p class="pc-calendar-caption">날짜를 선택하면 업무 현황이 함께 바뀝니다.</p>
                            </div>
                            <div class="pc-main-schedules">
                                <h3>선택일 일정</h3>
                                <div id="pcMainSchedules" class="pc-main-body" aria-live="polite"><p class="pc-main-empty">일정을 불러오는 중입니다.</p></div>
                            </div>
                        </div>
                    </section>

                    <section class="pc-main-card pc-patient-card" aria-labelledby="pcPatientTitle">
                        <div class="pc-main-card-heading"><h2 id="pcPatientTitle">환자 현황</h2><span class="pc-selected-date"></span></div>
                        <div id="pcMainPatients" class="pc-patient-metrics" aria-live="polite"><p class="pc-main-empty">환자 현황을 불러오는 중입니다.</p></div>
                    </section>

                </div>

                <div class="pc-dashboard-column pc-dashboard-column-right">

                    <section class="pc-brand-card" aria-label="마음사랑병원 슬로건">
                        <img src="<c:url value='/images/symbol1.png'/>" alt="" class="pc-brand-symbol">
                        <time id="pcDashboardClock" class="pc-dashboard-clock" aria-label="현재 날짜와 시간">
                            <span id="pcDashboardToday"></span>
                            <span class="pc-dashboard-clock-time"><span id="pcDashboardTime"></span><small id="pcDashboardSeconds"></small></span>
                        </time>
                        <div class="pc-brand-heading"><span class="pc-slogan-year">2026년 슬로건</span><strong>더 높이! 더 가까이!</strong></div>
                        <div class="pc-brand-heart">
                            <div class="pc-brand-copy">
                                <h3>MISSION</h3><p>최상의 의료서비스로 <em>인간사랑</em> 구현</p>
                                <h3>VISION 2026</h3>
                                <ul><li>전문성 있는 진료로 신뢰받는 병원</li><li>사랑실천으로 고객이 행복한 병원</li><li>창의적인 인재양성으로 신바람 나게 일하는 병원</li><li>지역사회의 건강과 행복한 삶에 기여하는 병원</li></ul>
                            </div>
                        </div>
                    </section>

                    <section class="pc-main-card pc-meal-card" aria-labelledby="pcMealTitle">
                        <div class="pc-main-card-heading"><h2 id="pcMealTitle">식단</h2><span class="pc-selected-date"></span></div>
                        <div class="pc-meal-layout">
                            <div id="pcMealTabs" class="pc-meal-tabs" role="group" aria-label="식사 선택">
                                <button type="button" data-meal="1" aria-pressed="true">아침</button>
                                <button type="button" data-meal="2" aria-pressed="false">점심</button>
                                <button type="button" data-meal="3" aria-pressed="false">저녁</button>
                            </div>
                            <div id="pcMealMenus" class="pc-main-body"><p class="pc-main-empty">식단을 불러오는 중입니다.</p></div>
                        </div>
                    </section>

                    <section class="pc-main-card pc-duty-card" aria-labelledby="pcDutyTitle">
                        <div class="pc-main-card-heading"><h2 id="pcDutyTitle">당직자 · 외래진료</h2><span class="pc-selected-date"></span></div>
                        <div class="pc-duty-columns">
                            <div><h3>당직자</h3><ul id="pcMainDuty" class="pc-duty-list pc-main-body"><li class="pc-main-empty">조회 중입니다.</li></ul></div>
                            <div><h3>외래진료</h3><ul id="pcMainOutDuty" class="pc-duty-list pc-main-body"><li class="pc-main-empty">조회 중입니다.</li></ul></div>
                        </div>
                    </section>

                </div>

                <section class="pc-main-card pc-notice-card" aria-labelledby="pcNoticesTitle">
                    <div class="pc-main-card-heading"><h2 id="pcNoticesTitle">공지사항</h2><button type="button" class="pc-board-more" aria-label="공지사항 전체보기"><i class="bi bi-chevron-right" aria-hidden="true"></i></button></div>
                    <div id="pcMainNotices" class="pc-main-body"><p class="pc-main-empty">게시글을 불러오는 중입니다.</p></div>
                </section>

                <section class="pc-main-card pc-board-card" aria-labelledby="pcBoardsTitle">
                    <div class="pc-main-card-heading"><h2 id="pcBoardsTitle">자유게시판</h2><button type="button" class="pc-board-more" aria-label="자유게시판 전체보기"><i class="bi bi-chevron-right" aria-hidden="true"></i></button></div>
                    <div id="pcMainBoards" class="pc-main-body"><p class="pc-main-empty">게시글을 불러오는 중입니다.</p></div>
                </section>

                <section class="pc-main-card pc-library-card" aria-labelledby="pcLibraryTitle">
                    <div class="pc-main-card-heading"><h2 id="pcLibraryTitle">자료실</h2><button type="button" class="pc-board-more" aria-label="자료실 전체보기"><i class="bi bi-chevron-right" aria-hidden="true"></i></button></div>
                    <div id="pcMainLibrary" class="pc-main-body"><p class="pc-main-empty">게시글을 불러오는 중입니다.</p></div>
                </section>

                <section class="pc-main-card pc-bulletin-card" aria-labelledby="pcBulletinTitle">
                    <div class="pc-main-card-heading"><h2 id="pcBulletinTitle">알림판</h2></div>
                    <div id="pcMainBulletin" class="pc-main-body"><p class="pc-main-empty">알림을 불러오는 중입니다.</p></div>
                </section>
            </div>
        </div>
    </main>
</div>

<script src="<c:url value='/pc/js/common/layout.js'/>"></script>
<script src="<c:url value='/pc/js/main/main.js'/>"></script>
</body>
</html>
