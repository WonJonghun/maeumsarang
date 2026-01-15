$(function () {
    highlightTodaySchedule();

    //전체보기
    $(document).on('click', 'a.js-move-window', function (e) {
        e.preventDefault();

        const a = $(this);
        const winCode = $.trim(a.data('win-code') || '');
        const winName = $.trim(a.data('win-name') || '');

        if (!winCode) return;
        cmMoveWindow(winCode, winName);
    });

    //달력 만들기
    let mainCalendar = createCalendar();

    //달력 셀 선택 이벤트 0.5초 누르고있어야됨
    if (mainCalendar && mainCalendar.grid) {
        let pressTimer = null;
        let moved = false;

        mainCalendar.grid.on('mousedown touchstart', '.cal-day', function () {
            moved = false;

            let cell = $(this);
            let dateStr = cell.data('date');
            if (!dateStr) return;

            // 같은 날짜면 동작 금지
            let currentSelected = mainCalendar.grid.find('.cal-day.selected').data('date');
            if (currentSelected === dateStr) return;

            let dateDotStr = dateStr.replace(/-/g, '.');

            pressTimer = setTimeout(function () {
                if (moved) return;

                mainCalendar.grid.find('.cal-day').removeClass('selected');
                cell.addClass('selected');

                loadScheduleByDate(dateStr);
                loadPatientStatusByDate(dateStr);
                loadDayDutyByDate(dateStr);

                $('.card-subtitle').text(' / ' + dateDotStr);
            }, 500); // 0.5초
        });

        mainCalendar.grid.on('mousemove touchmove', '.cal-day', function () {
            moved = true;
            clearTimeout(pressTimer);
        });

        mainCalendar.grid.on('mouseup mouseleave touchend touchcancel', '.cal-day', function () {
            clearTimeout(pressTimer);
        });
    }

    // 게시글 클릭시
    $(document).on('click', '.notice-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();

        let selRow = $(this);
        let tvUk = selRow.data('tv-uk');
        let saCd = $.trim($('#loginIcCode').val() || '');

        //읽읍표시
        if (tvUk && saCd && selRow.data('viewSent') !== true) {
            selRow.data('viewSent', true);
            selRow.find('.dot-blue').removeClass('dot-blue').addClass('dot-gray');
            selRow.find('.notice-title').removeClass('text-deep-blue');

            // 조회 여부 프로시저
            cmAjax('/notice/totalNoteView.do', 'POST', {tvUk: tvUk, saCd: saCd}, false);
        }

        // 게시글 상세 조회
        window.postDetail(this, true);
    });

    // 환자현황 툴팁(이벤트는 위임이라 1회 바인딩이면 끝)
    $(document).off('click.patientTooltip').on('click.patientTooltip', '.patient-chart', function (e) {
        let tooltip = $(this).find('.patient-tooltip');
        $('.patient-tooltip').not(tooltip).hide();
        tooltip.toggle();
        e.stopPropagation();
    });

    $(document).off('click.patientTooltipClose').on('click.patientTooltipClose', function () {
        $('.patient-tooltip').hide();
    });
});

// 일정 하이라이트
function highlightTodaySchedule() {
    let now = new Date();
    let nowMinutes = now.getHours() * 60 + now.getMinutes();

    let scheduleRows = $('.schedule-row[data-time]');
    if (!scheduleRows.length) return;

    scheduleRows.each(function () {
        let timeSpan = $(this).find('.schedule-time-main');
        let card = $(this).find('.schedule-card');
        timeSpan.removeClass('schedule-time-main-blue').addClass('schedule-time-main-muted');
        card.removeClass('schedule-card-primary').addClass('schedule-card-muted');
    });

    let windowMin = Number.MAX_SAFE_INTEGER;
    let afterMin = Number.MAX_SAFE_INTEGER;

    scheduleRows.each(function () {
        let timeText = $(this).data('time');
        if (!timeText) return;

        let parts = String(timeText).split(':');
        if (parts.length !== 2) return;

        let hour = parseInt(parts[0], 10);
        let minute = parseInt(parts[1], 10);
        if (isNaN(hour) || isNaN(minute)) return;

        let total = hour * 60 + minute;

        if (total >= nowMinutes && total <= nowMinutes + 1 && total < windowMin) windowMin = total;
        if (total > nowMinutes && total < afterMin) afterMin = total;
    });

    let targetMinutes = null;
    if (windowMin !== Number.MAX_SAFE_INTEGER) targetMinutes = windowMin;
    else if (afterMin !== Number.MAX_SAFE_INTEGER) targetMinutes = afterMin;

    if (targetMinutes === null) return;

    scheduleRows.each(function () {
        let timeText = $(this).data('time');
        if (!timeText) return;

        let parts = String(timeText).split(':');
        if (parts.length !== 2) return;

        let hour = parseInt(parts[0], 10);
        let minute = parseInt(parts[1], 10);
        if (isNaN(hour) || isNaN(minute)) return;

        let total = hour * 60 + minute;

        if (total === targetMinutes) {
            let timeSpan = $(this).find('.schedule-time-main');
            let card = $(this).find('.schedule-card');
            timeSpan.removeClass('schedule-time-main-muted').addClass('schedule-time-main-blue');
            card.removeClass('schedule-card-muted').addClass('schedule-card-primary');
        }
    });
}

// 일정
function loadScheduleByDate(dateStr) {
    let loginBuser = $.trim($('#loginBuser').val() || '');
    let loginIcCode = $.trim($('#loginIcCode').val() || '');

    if (!loginBuser || !loginIcCode) {
        console.log('todayScheduleList param missing', loginBuser, loginIcCode);
        return;
    }

    cmAjax('/schedule/todayScheduleList.do', 'GET', {
        searchDate: dateStr,
        ccBuser: loginBuser,
        userId: loginIcCode
    }, false)
        .done(function (list) {
            let scheduleWrap = $('#todayScheduleList');
            if (!scheduleWrap.length) return;

            scheduleWrap.empty();

            if (!list || !list.length) {
                scheduleWrap.append(`
                    <div class="schedule-row">
                        <div class="schedule-card schedule-card-muted">
                            <p class="schedule-title">등록된 일정이 없습니다.</p>
                        </div>
                    </div>
                `);
            } else {
                $.each(list, function (_, item) {
                    let time = item.ccTime || '';
                    let rmk = item.ccRmk || '';

                    scheduleWrap.append(`
                        <div class="schedule-row" data-time="${cmEscapeHtml(time)}">
                            <div class="schedule-time">
                                <span class="schedule-time-main schedule-time-main-muted">${cmEscapeHtml(time)}</span>
                            </div>
                            <div class="schedule-card schedule-card-muted">
                                <p class="schedule-title">${cmEscapeHtml(rmk)}</p>
                            </div>
                        </div>
                    `);
                });
            }

            highlightTodaySchedule();
        })
        .fail(function (xhr) {
            console.log('todayScheduleList error', xhr);
        });
}

// 환자현황
function loadPatientStatusByDate(dateStr) {
    cmAjax('/customer/dailyStats.do', 'GET', {baseDt: dateStr}, false)
        .done(function (data) {
            let statusWrap = $('.patient-status-wrap');
            if (!statusWrap.length) return;

            if (!data) {
                statusWrap.html('<p class="text-muted">환자 현황 데이터가 없습니다.</p>');
                return;
            }

            let cnt1 = parseInt(data.cnt1, 10) || 0; // 재원
            let cnt2 = parseInt(data.cnt2, 10) || 0; // 입원(월)
            let cnt3 = parseInt(data.cnt3, 10) || 0; // 퇴원(월)
            let cnt4 = parseInt(data.cnt4, 10) || 0; // 입원(일)
            let cnt5 = parseInt(data.cnt5, 10) || 0; // 퇴원(일)
            let cnt8 = parseInt(data.cnt8, 10) || 0; // 외래접수
            let cnt9 = parseInt(data.cnt9, 10) || 0; // 진료완료

            let beds = 560;
            let inHosPercent = beds > 0 ? Math.round(cnt1 * 100 / beds) : 0;

            let inoutDayTotal = cnt4 + cnt5;
            let inoutPercent = inoutDayTotal > 0 ? Math.round(cnt5 * 100 / inoutDayTotal) : 0;

            let outPercent = cnt8 > 0 ? Math.round(cnt9 * 100 / cnt8) : 0;

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
                            <p>${cnt1}명 / 560명</p>
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
        })
        .fail(function (xhr) {
            console.log('dailyStats error', xhr);
        });
}

//당직자 / 외래진료
function loadDayDutyByDate(dateStr) {
    function renderDutyList(ul, list, roleClass) {
        if (!ul || !ul.length) return;

        ul.empty();

        if (!list || !list.length) {
            ul.append(
                '<li class="duty-row">' +
                '<span class="' + roleClass + '">-</span>' +
                '<span class="duty-name">등록된 정보가 없습니다.</span>' +
                '</li>'
            );
            return;
        }

        $.each(list, function (_, item) {
            let type = item.hcName || '';
            let name = item.duName || '';

            ul.append(
                '<li class="duty-row">' +
                '<span class="' + roleClass + '">' + cmEscapeHtml(type) + '</span>' +
                '<span class="duty-name">' + cmEscapeHtml(name) + '</span>' +
                '</li>'
            );
        });
    }

    // 당직자
    cmAjax('/schedule/dayDuty.do', 'GET', {searchDate: dateStr}, false)
        .done(function (list) {
            renderDutyList($('.duty-column .duty-list').first(), list, 'duty-role');
        })
        .fail(function (xhr) {
            console.log('dayDuty error', xhr);
        });

    // 외래진료
    cmAjax('/schedule/outDayDuty.do', 'GET', {searchDate: dateStr}, false)
        .done(function (list) {
            renderDutyList($('.outduty-column .duty-list'), list, 'outduty-role');
        })
        .fail(function (xhr) {
            console.log('outDayDuty error', xhr);
        });
}
