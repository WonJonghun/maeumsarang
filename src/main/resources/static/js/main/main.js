$(function () {
    highlightTodaySchedule();
    setDashboardDateLabel(cmGetToday('-'));
    toggleFloatingSelectedDate();
    initMainCalendar();

    $(window).on('scroll', function () {
        toggleFloatingSelectedDate();
    });

    $(document).on('click', 'a.js-move-window', moveWindow);
    $(document).on('click', '.birth-vacation-more', toggleBirthVacationMore);
    $(document).on('click', '.notice-row', openNoticeDetail);
    $(document).on('click', '.patient-chart', togglePatientTooltip);
    $(document).on('click', function () {
        $('.patient-tooltip').hide();
    });
});

//달력
function initMainCalendar() {
    const mainCalendar = createCalendar();

    if (!mainCalendar || !mainCalendar.grid) return;

    mainCalendar.grid.on('click', '.cal-day', function () {
        selectCalendarDate(mainCalendar, $(this));
    });
}

function selectCalendarDate(mainCalendar, cell) {
    const dateStr = cell.data('date');

    if (!dateStr) return;
    if (mainCalendar.grid.find('.cal-day.selected').data('date') === dateStr) return;

    mainCalendar.grid.find('.cal-day').removeClass('selected');
    cell.addClass('selected');

    loadScheduleByDate(dateStr);
    loadPatientStatusByDate(dateStr);
    loadDayDutyByDate(dateStr);
    loadBirthVacationByDate(dateStr);
    loadMealByDate(dateStr);

    setDashboardDateLabel(dateStr);
}

//전체보기
function moveWindow(e) {
    e.preventDefault();

    const btn = $(this);
    const url = $.trim(btn.data('url') || '');

    if (!url) return;

    cmMovePage(url, {
        ccBaseKey: $.trim(btn.data('baseKey') || ''),
        ccWinCode: $.trim(btn.data('winCode') || ''),
        ccMenuName: $.trim(btn.data('menuName') || '')
    });
}

//생일자/휴가자 더보기
function toggleBirthVacationMore() {
    const btn = $(this);
    const open = btn.data('open') === true;

    btn.closest('.birth-vacation-block').find('.birth-vacation-list').toggleClass('is-collapsed', open);
    btn.data('open', !open).text(open ? '더보기' : '접기');
}

//게시글 상세
function openNoticeDetail(e) {
    if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;

    e.preventDefault();

    const row = $(this);
    const tvUk = row.data('tv-uk');
    const saCd = $.trim($('#loginIcCode').val() || '');

    if (tvUk && saCd && row.data('viewSent') !== true) {
        row.data('viewSent', true);
        row.find('.dot-blue').removeClass('dot-blue').addClass('dot-gray');
        row.find('.notice-title').removeClass('text-deep-blue');

        cmAjax('/notice/totalNoteView.do', 'POST', {
            tvUk: tvUk,
            saCd: saCd
        }, false);
    }

    postDetail(this, true);
}

//환자현황 툴팁
function togglePatientTooltip(e) {
    const tooltip = $(this).find('.patient-tooltip');

    $('.patient-tooltip').not(tooltip).hide();
    tooltip.toggle();

    e.stopPropagation();
}

//일정 하이라이트
function highlightTodaySchedule() {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const scheduleRows = $('.schedule-row[data-time]');

    if (!scheduleRows.length) return;

    scheduleRows.each(function () {
        $(this).find('.schedule-time-main').removeClass('schedule-time-main-blue').addClass('schedule-time-main-muted');
        $(this).find('.schedule-card').removeClass('schedule-card-primary').addClass('schedule-card-muted');
    });

    let windowMin = Number.MAX_SAFE_INTEGER;
    let afterMin = Number.MAX_SAFE_INTEGER;

    scheduleRows.each(function () {
        const timeText = $(this).data('time');
        const parts = String(timeText || '').split(':');

        if (parts.length !== 2) return;

        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);

        if (isNaN(hour) || isNaN(minute)) return;

        const total = hour * 60 + minute;

        if (total >= nowMinutes && total <= nowMinutes + 1 && total < windowMin) windowMin = total;
        if (total > nowMinutes && total < afterMin) afterMin = total;
    });

    let targetMinutes = null;

    if (windowMin !== Number.MAX_SAFE_INTEGER) {
        targetMinutes = windowMin;
    } else if (afterMin !== Number.MAX_SAFE_INTEGER) {
        targetMinutes = afterMin;
    }

    if (targetMinutes === null) return;

    scheduleRows.each(function () {
        const timeText = $(this).data('time');
        const parts = String(timeText || '').split(':');

        if (parts.length !== 2) return;

        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);

        if (isNaN(hour) || isNaN(minute)) return;

        if ((hour * 60 + minute) === targetMinutes) {
            $(this).find('.schedule-time-main').removeClass('schedule-time-main-muted').addClass('schedule-time-main-blue');
            $(this).find('.schedule-card').removeClass('schedule-card-muted').addClass('schedule-card-primary');
        }
    });
}

//일정
function loadScheduleByDate(dateStr) {
    const loginBuser = $.trim($('#loginBuser').val() || '');
    const loginIcCode = $.trim($('#loginIcCode').val() || '');

    if (!loginBuser || !loginIcCode) return;

    cmAjax('/schedule/todayScheduleList.do', 'GET', {
        searchDate: dateStr,
        ccBuser: loginBuser,
        userId: loginIcCode
    }, false)
        .done(function (list) {
            renderScheduleList(list || []);
            highlightTodaySchedule();
        })
        .fail(function (xhr) {
            console.log('todayScheduleList error', xhr);
        });
}

function renderScheduleList(list) {
    const scheduleWrap = $('#todayScheduleList');

    if (!scheduleWrap.length) return;

    if (!list.length) {
        scheduleWrap.html(`
            <div class="schedule-row">
                <div class="schedule-card schedule-card-muted">
                    <p class="schedule-title">등록된 일정이 없습니다.</p>
                </div>
            </div>
        `);
        return;
    }

    let html = '';

    $.each(list, function (_, item) {
        html += `
            <div class="schedule-row" data-time="${cmEscapeHtml(item.ccTime || '')}">
                <div class="schedule-time">
                    <span class="schedule-time-main schedule-time-main-muted">${cmEscapeHtml(item.ccTime || '')}</span>
                </div>
                <div class="schedule-card schedule-card-muted">
                    <p class="schedule-title">${cmEscapeHtml(item.ccRmk || '')}</p>
                </div>
            </div>
        `;
    });

    scheduleWrap.html(html);
}

//환자현황
function loadPatientStatusByDate(dateStr) {
    cmAjax('/customer/dailyStats.do', 'GET', {baseDt: dateStr}, false)
        .done(function (data) {
            renderPatientStatus(data);
        })
        .fail(function (xhr) {
            console.log('dailyStats error', xhr);
        });
}

//환자현황
function renderPatientStatus(data) {
    const statusWrap = $('.patient-status-wrap');

    if (!statusWrap.length) return;

    if (!data) {
        statusWrap.html('<p class="text-muted">환자 현황 데이터가 없습니다.</p>');
        return;
    }

    const cnt1 = parseInt(data.cnt1, 10) || 0;
    const cnt2 = parseInt(data.cnt2, 10) || 0;
    const cnt3 = parseInt(data.cnt3, 10) || 0;
    const cnt4 = parseInt(data.cnt4, 10) || 0;
    const cnt5 = parseInt(data.cnt5, 10) || 0;
    const cnt8 = parseInt(data.cnt8, 10) || 0;
    const cnt9 = parseInt(data.cnt9, 10) || 0;
    const beds = parseInt(data.srTo, 10) || 0;

    const inHosPercent = beds > 0 ? Math.round(cnt1 * 100 / beds) : 0;
    const inoutDayTotal = cnt4 + cnt5;
    const inoutPercent = inoutDayTotal > 0 ? Math.round(cnt5 * 100 / inoutDayTotal) : 0;
    const outPercent = cnt8 > 0 ? Math.round(cnt9 * 100 / cnt8) : 0;

    statusWrap.html(`
        <div class="patient-chart">
            <p class="patient-chart-label">재원</p>
            <div class="circle-chart" style="--value:${inHosPercent}; --chart-color:#1976d2;">
                <div class="circle-chart-inner">
                    <span class="circle-chart-value">${cnt1}명</span>
                    <span class="circle-chart-caption">(${inHosPercent}%)</span>
                </div>
            </div>
            <div class="patient-tooltip">
                <div class="patient-tooltip-inner">
                    <p>${cnt1}명 / ${beds}명</p>
                    <p>(재원환자 / 허가병상)</p>
                </div>
            </div>
        </div>

        <div class="patient-chart">
            <p class="patient-chart-label">입/퇴원</p>
            <div class="circle-chart inout_chart" style="--value:${inoutPercent}; --chart-color:#fda433;">
                <div class="circle-chart-inner">
                    <span class="circle-chart-value">${cnt4} / ${cnt5}</span>
                    <span class="circle-chart-caption">(당일)</span>
                </div>
            </div>
            <div class="patient-tooltip">
                <div class="patient-tooltip-inner">
                    <p>${cnt2}명 / ${cnt3}명</p>
                    <p>(월 누계)</p>
                </div>
            </div>
        </div>

        <div class="patient-chart patient-chart-right">
            <p class="patient-chart-label">외래</p>
            <div class="circle-chart" style="--value:${outPercent}; --chart-color:#43a047;">
                <div class="circle-chart-inner">
                    <span class="circle-chart-value">${cnt9}명</span>
                    <span class="circle-chart-caption">(${outPercent}%)</span>
                </div>
            </div>
            <div class="patient-tooltip">
                <div class="patient-tooltip-inner">
                    <p>${cnt9}명 / ${cnt8}명</p>
                    <p>(진료완료 / 외래접수)</p>
                </div>
            </div>
        </div>
    `);
}

//당직자 / 외래진료
function loadDayDutyByDate(dateStr) {
    cmAjax('/schedule/dayDuty.do', 'GET', {searchDate: dateStr}, false)
        .done(function (list) {
            renderDutyList($('.duty-column .duty-list').first(), list || [], 'duty-role');
        })
        .fail(function (xhr) {
            console.log('dayDuty error', xhr);
        });

    cmAjax('/schedule/outDayDuty.do', 'GET', {searchDate: dateStr}, false)
        .done(function (list) {
            renderDutyList($('.outduty-column .duty-list'), list || [], 'outduty-role');
        })
        .fail(function (xhr) {
            console.log('outDayDuty error', xhr);
        });
}

function renderDutyList(ul, list, roleClass) {
    if (!ul.length) return;

    if (!list.length) {
        ul.html(`
            <li class="duty-row">
                <span class="${roleClass}">-</span>
                <span class="duty-name">등록된 정보가 없습니다.</span>
            </li>
        `);
        return;
    }

    let html = '';

    $.each(list, function (_, item) {
        html += `
            <li class="duty-row">
                <span class="${roleClass}">${cmEscapeHtml(item.hcName || '')}</span>
                <span class="duty-name">${cmEscapeHtml(item.duName || '')}</span>
            </li>
        `;
    });

    ul.html(html);
}

//생일자 / 휴가자
function loadBirthVacationByDate(dateStr) {
    cmAjax('/main/birthDayList.do', 'GET', {searchDate: dateStr}, false)
        .done(function (list) {
            renderBirthVacationList(list || []);
        })
        .fail(function (xhr) {
            console.log('birthDayList error', xhr);
        });
}

function renderBirthVacationList(list) {
    const birthdayList = $.grep(list, function (item) {
        return Number(item.sort) === 2;
    });

    const vacationUserList = $.grep(list, function (item) {
        return Number(item.sort) === 4;
    });

    drawBirthVacation($('.birth-column'), birthdayList, '생일자가 없습니다.', true);
    drawBirthVacation($('.vacation-column'), vacationUserList, '휴가자가 없습니다.', false);

    const block = $('.birth-vacation-block');
    block.find('.birth-vacation-more').remove();

    if (birthdayList.length > 7 || vacationUserList.length > 7) {
        block.find('.card-body').append('<button type="button" class="birth-vacation-more" data-open="false">더보기</button>');
    }
}

function drawBirthVacation(column, list, emptyText, isBirthday) {
    const ul = column.find('.birth-vacation-list');

    column.toggleClass('has-data', list.length > 0);
    ul.toggleClass('is-collapsed', list.length > 7);

    if (!list.length) {
        ul.html(`<li class="birth-vacation-empty">${emptyText}</li>`);
        return;
    }

    let html = '';

    $.each(list, function (_, item) {
        const remark = item.ccRemark || '';
        const type = isBirthday && remark.indexOf('+') > -1 ? '양력' : isBirthday && remark.indexOf('-') > -1 ? '음력' : remark;

        html += `
            <li class="birth-vacation-row">
                <span class="birth-vacation-name">${cmEscapeHtml(item.ccName || '')}</span>
                <span class="birth-vacation-type">${cmEscapeHtml(type)}</span>
            </li>
        `;
    });

    ul.html(html);
}

//식단
function loadMealByDate(dateStr) {
    cmAjax('/main/mealList.do', 'GET', {searchDate: dateStr}, false)
        .done(function (list) {
            renderMealList(1, list || []);
            renderMealList(2, list || []);
            renderMealList(3, list || []);
        })
        .fail(function (xhr) {
            console.log('mealList error', xhr);
        });
}

function renderMealList(flag, list) {
    const menuList = $('.meal-menu-list[data-meal-flag="' + flag + '"]');
    const kcal = $('.meal-kcal[data-meal-kcal="' + flag + '"]');

    if (!menuList.length) return;

    const mealList = $.grep(list, function (item) {
        return Number(item.fmFlag) === flag;
    });

    if (!mealList.length) {
        menuList.html('<p class="meal-menu">등록된 식단이 없습니다.</p>');
        kcal.text('0 kcal');
        return;
    }

    let totalKcal = 0;
    let html = '';

    $.each(mealList, function (_, item) {
        totalKcal += Number(item.fmKal || 0);
        html += `<p class="meal-menu">${cmEscapeHtml(item.reName || '')}</p>`;
    });

    menuList.html(html);
    kcal.text(totalKcal + ' kcal');
}

//대시보드 날짜
function setDashboardDateLabel(dateStr) {
    $('.js-dashboard-date').text(formatDashboardDateLabel(dateStr));
}

function formatDashboardDateLabel(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date(cmGetToday('-') + 'T00:00:00');
    const weekNames = ['일', '월', '화', '수', '목', '금', '토'];

    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const week = weekNames[date.getDay()];

    if (date.getTime() === today.getTime()) {
        return month + '.' + day + '(' + week + ') / 오늘';
    }

    return month + '.' + day + '(' + week + ')';
}

//선택일 고정 표시
function toggleFloatingSelectedDate() {
    const calendarContainer = $('#calendarContainer');
    const floatingDate = $('.floating-selected-date');

    if (!calendarContainer.length || !floatingDate.length) return;

    floatingDate.toggleClass('is-visible', $(window).scrollTop() > calendarContainer.offset().top + calendarContainer.outerHeight());
}