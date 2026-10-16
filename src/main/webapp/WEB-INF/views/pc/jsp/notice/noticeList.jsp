<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <title><c:out value="${menuName}"/> | 마음사랑병원 인트라넷</title>
    <%@ include file="/WEB-INF/views/pc/jsp/common/font-inc.jspf" %>
    <%@ include file="/WEB-INF/views/common/jsp/common-inc.jspf" %>
    <link rel="stylesheet" href="<c:url value='/pc/css/common/layout.css'/>">
    <link rel="stylesheet" href="<c:url value='/pc/css/common/board.css'/>">
    <link rel="stylesheet" href="<c:url value='/common/css/cmPopup.css'/>">
    <script src="<c:url value='/common/js/cmPopup.js'/>"></script>
</head>
<body class="pc-page pc-board-page pc-work-page">
<a class="pc-skip-link" href="#pcContent">본문 바로가기</a>
    <main id="pcContent" class="pc-content" tabindex="-1" aria-label="전자게시판">
        <div id="pcBoard" class="pc-board" data-base-key="<c:out value='${baseKey}'/>">
            <aside class="pc-board-sidebar" aria-labelledby="pcBoardMenuTitle">
                <div class="pc-board-path">사내업무 <i class="bi bi-chevron-right" aria-hidden="true"></i> 전자게시판</div>
                <h2 id="pcBoardMenuTitle"><i class="bi bi-layout-text-sidebar" aria-hidden="true"></i> 전자게시판</h2>
                <nav id="pcBoardMenus" aria-label="게시판 모음"></nav>
                <p id="pcBoardMenuStatus" class="pc-board-status" role="status">게시판을 불러오는 중입니다.</p>
            </aside>
            <section class="pc-board-panel" aria-labelledby="pcBoardTitle">
                <div class="pc-board-heading">
                    <h1 id="pcBoardTitle"><c:out value="${menuName}"/></h1>
                    <div class="pc-board-search-scroll pc-board-toolbar">
                        <p id="pcBoardCount" role="status">게시글을 불러오는 중입니다.</p>
                        <form id="pcBoardSearch" class="pc-board-search" role="search">
                            <div class="pc-board-period">
                                <label for="pcBoardFrom">조회 기간</label>
                                <span class="pc-board-date-field">
                                    <input type="date" id="pcBoardFrom" required aria-label="조회 시작일" aria-haspopup="dialog" aria-controls="pcBoardDatePicker" aria-expanded="false">
                                    <i class="bi bi-calendar3" aria-hidden="true"></i>
                                </span>
                                <span aria-hidden="true">~</span>
                                <span class="pc-board-date-field">
                                    <input type="date" id="pcBoardTo" required aria-label="조회 종료일" aria-haspopup="dialog" aria-controls="pcBoardDatePicker" aria-expanded="false">
                                    <i class="bi bi-calendar3" aria-hidden="true"></i>
                                </span>
                            </div>
                            <div class="pc-board-keyword">
                                <select id="pcBoardSearchType" aria-label="검색 조건">
                                    <option value="titleContent">제목+내용</option>
                                    <option value="title">제목</option>
                                    <option value="content">내용</option>
                                    <option value="writer">작성자</option>
                                </select>
                                <input type="search" id="pcBoardKeyword" maxlength="200" placeholder="검색어를 입력하세요" aria-label="검색어">
                                <button type="submit" class="pc-board-search-button"><i class="bi bi-search" aria-hidden="true"></i> 검색</button>
                            </div>
                        </form>
                        <div class="pc-board-toolbar-actions">
                            <button type="button" id="pcBoardRefresh" class="pc-board-refresh" title="새로고침" aria-label="게시글 새로고침"><i class="bi bi-arrow-clockwise" aria-hidden="true"></i></button>
                            <select id="pcBoardLimit" aria-label="페이지당 게시글 수">
                                <option value="20">20개씩 보기</option>
                                <option value="50">50개씩 보기</option>
                                <option value="100">100개씩 보기</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="pc-board-body">
                    <div class="pc-board-results">
                        <div class="pc-board-list">
                            <div id="pcBoardScroll" class="pc-board-scroll">
                                <table class="pc-board-table" aria-label="게시글 목록">
                                    <colgroup><col class="pc-board-col-number"><col><col class="pc-board-col-writer"><col class="pc-board-col-date"><col class="pc-board-col-views"><col class="pc-board-col-file"></colgroup>
                                    <thead><tr><th scope="col">번호</th><th scope="col" class="pc-board-subject">제목</th><th scope="col">작성자</th><th scope="col">등록일</th><th scope="col">조회</th><th scope="col">첨부</th></tr></thead>
                                    <tbody id="pcBoardRows"><tr><td colspan="6" class="pc-board-empty">게시글을 불러오는 중입니다.</td></tr></tbody>
                                </table>
                            </div>
                            <button type="button" id="pcBoardScrollHint" class="pc-board-scroll-hint" title="목록 맨 아래로 이동"
                                    aria-label="목록 맨 아래로 이동" aria-controls="pcBoardScroll" hidden>
                                <i class="bi bi-chevron-down" aria-hidden="true"></i>
                            </button>
                        </div>
                        <nav id="pcBoardPagination" class="pc-board-pagination" aria-label="게시글 페이지"></nav>
                    </div>
                    <section id="pcBoardPreview" class="pc-board-preview" aria-label="게시글 상세" aria-busy="false">
                        <div id="pcBoardPreviewMessage" class="pc-board-preview-message" role="status">
                            <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                            <p id="pcBoardPreviewText">게시글을 선택하면 내용을 확인할 수 있습니다.</p>
                        </div>
                        <iframe id="pcBoardDetailFrame" class="pc-board-detail-frame" title="게시글 상세" hidden></iframe>
                    </section>
                </div>
            </section>
        </div>
    </main>
<div id="pcBoardDatePicker" class="pc-board-date-picker" popover="auto" role="dialog" aria-labelledby="pcBoardDateTitle">
    <h2 id="pcBoardDateTitle">조회 기간</h2>
    <div id="pcBoardDateCalendars" class="pc-board-date-calendars"></div>
    <div class="pc-board-date-actions"><button type="button" id="pcBoardDateClose">닫기</button></div>
</div>
<script src="<c:url value='/pc/js/common/tabs.js'/>"></script>
<script src="<c:url value='/pc/js/common/board.js'/>"></script>
</body>
</html>
