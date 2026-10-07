$(function () {
    //식단 기본 선택
    const today = cmGetToday('-');
    const now = new Date();
    const minute = now.getHours() * 60 + now.getMinutes();
    const meal = minute <= 540 ? 1 : minute <= 810 ? 2 : 3;

    $('#pcMealTabs button')
        .attr('aria-pressed', 'false')
        .filter('[data-meal="' + meal + '"]')
        .attr('aria-pressed', 'true');

    //초기화
    updatePcMainClock();
    setInterval(updatePcMainClock, 1000);
    loadPcMainNotifications();
    loadPcMainCalendar(today);
    loadPcMainDay(today);
    loadPcMainBoards();
    loadPcMainBulletin();

    //카드 높이 맞춤
    const center = $('.pc-dashboard-column-center')[0];
    const observer = new ResizeObserver(function () {
        const gap = parseFloat(getComputedStyle(center).rowGap);
        const brand = $('.pc-brand-card').outerHeight();
        const meal = $('.pc-meal-card').outerHeight();
        const duty = parseFloat(getComputedStyle($('.pc-duty-card')[0]).minHeight);

        $(center).css('min-height', brand + meal + gap * 2 + duty);

        const height = $(center).outerHeight();
        $('.pc-people-card').css('height', height - $('.pc-myinfo-card').outerHeight() - gap);
        $('.pc-duty-card').css('height', height - brand - meal - gap * 2);
    });
    observer.observe(center);
    observer.observe($('.pc-meal-card')[0]);
    observer.observe($('.pc-brand-card')[0]);

    //달력과 일정 높이 맞춤
    const calendar = $('.pc-calendar')[0];
    new ResizeObserver(function () {
        $('.pc-main-schedules').css('height', $(calendar).outerHeight());
    }).observe(calendar);

    //이전·다음 달 선택
    $('#pcCalendarPrev, #pcCalendarNext').on('click', function () {
        const date = new Date($('#pcCalendarMonth').attr('data-month') + '-01T00:00:00');
        date.setMonth(date.getMonth() + (this.id === 'pcCalendarPrev' ? -1 : 1));
        loadPcMainCalendar(cmFormatYmd(date, '-'));
    });

    //오늘 선택
    $('#pcCalendarToday').on('click', function () {
        loadPcMainCalendar(cmGetToday('-'));
        loadPcMainDay(cmGetToday('-'));
    });

    //날짜 선택
    $('#pcCalendarDays').on('click', '.pc-calendar-day', function () {
        const ymd = $(this).attr('data-date');
        $('#pcCalendarDays button').attr('aria-pressed', 'false');
        $(this).attr('aria-pressed', 'true');
        loadPcMainDay(ymd);

        if (ymd.substring(0, 7) !== $('#pcCalendarMonth').attr('data-month')) {
            loadPcMainCalendar(ymd);
        }
    });

    //프로필 기본 이미지
    $('#pcMainProfileImage').on('error', function () {
        $(this).off('error').attr('src', $(this).attr('data-fallback-src'));
    });
    const photo = $('#pcMainProfileImage')[0];
    if (photo.complete && photo.naturalWidth === 0) {
        $(photo).trigger('error');
    }

    //게시판 전체보기
    $('.pc-board-more').on('click', function () {
        customAlert('알림', '준비 중입니다.', 'CONFIRM');
    });

    //식단 탭 선택
    $('#pcMealTabs').on('click', 'button', function () {
        $('#pcMealTabs button').attr('aria-pressed', 'false');
        $(this).attr('aria-pressed', 'true');
        $('#pcMealMenus .pc-meal-section')
            .prop('hidden', true)
            .filter('[data-meal="' + $(this).attr('data-meal') + '"]')
            .prop('hidden', false);
    });
});

//업무 알림 조회
function loadPcMainNotifications() {
    cmAjax('/profile/pc/checkApproList.do', 'GET', {}, false).done(function (list) {
        const row = list[0];
        const fields = {
            approval: 'ccCnt1',
            mail: 'ccCnt99',
            official: 'ccCnt12',
            post: 'ccCnt22',
            parcel: 'ccCnt32',
            coop: 'ccCnt2'
        };

        $.each(fields, function (key, field) {
            const count = row ? Number(row[field]) || 0 : 0;
            const badge = $('.pc-notification-badge[data-key="' + key + '"]');
            const button = badge.parent();
            const label = button.children('span').first().text();

            badge.text(count).prop('hidden', count <= 0);
            button.attr('aria-label', count > 0 ? label + ' 알림 ' + count + '건' : label);
        });
    });
}

//달력 조회
function loadPcMainCalendar(ymd) {
    const monthKey = ymd.substring(0, 7);
    const date = new Date(monthKey + '-01T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth();
    $('#pcCalendarMonth')
        .attr('data-month', monthKey)
        .text(year + '.' + String(month + 1).padStart(2, '0'));
    $('#pcCalendarDays').attr('aria-busy', 'true');
    $('#pcCalendarStatus').text('');

    const holidays = cmAjax('/schedule/holidayList.do', 'GET', {
        year: year,
        month: String(month + 1).padStart(2, '0')
    }, false).then(function (list) {
        return list;
    }, function () {
        if ($('#pcCalendarMonth').attr('data-month') === monthKey) {
            $('#pcCalendarStatus').text('공휴일 정보를 불러오지 못했습니다.');
        }
        return [];
    });

    const work = cmAjax('/schedule/scheduleList.do', 'GET', {
        baseDt: monthKey + '-01',
        flagCd: $('#pcDashboard').attr('data-work-flag'),
        saCd: $('#pcDashboard').attr('data-user-id')
    }, false).then(function (list) {
        return list;
    }, function () {
        if ($('#pcCalendarMonth').attr('data-month') === monthKey) {
            $('#pcCalendarStatus').text('근무 일정을 불러오지 못했습니다.');
        }
        return [];
    });

    $.when(holidays, work).done(function (holidayList, workList) {
        if ($('#pcCalendarMonth').attr('data-month') !== monthKey) return;

        const cursor = new Date(year, month, 1 - date.getDay());
        const last = new Date(year, month + 1, 0);
        const end = new Date(year, month, last.getDate() + 6 - last.getDay());
        let html = '';

        while (cursor <= end) {
            const day = cmFormatYmd(cursor, '-');
            const inMonth = cursor.getMonth() === month;
            const holiday = holidayList.find(function (item) {
                return item.ccDt.substring(0, 10) === day;
            });
            const shift = inMonth && workList.length ? workList[0]['a' + cursor.getDate()] : '';
            const selected = day === $('#pcDashboard').attr('data-selected-date');
            const label = formatPcMainDate(day)
                + (holiday ? ' ' + holiday.ccOffNm : '')
                + (shift ? ' 근무 ' + shift : '');

            let cls = 'pc-calendar-day';
            if (!inMonth) cls += ' is-other-month';
            if (cursor.getDay() === 0) cls += ' is-sunday';
            if (cursor.getDay() === 6) cls += ' is-saturday';
            if (holiday) cls += ' is-holiday';
            if (day === cmGetToday('-')) cls += ' is-today';
            if (/[\u2460-\u24ff\u3251-\u325f\u32b1-\u32bf]/.test(shift)) cls += ' has-symbol-shift';

            html += `
                <button type="button" class="${cls}"
                        data-date="${day}" aria-pressed="${selected}"
                        aria-label="${cmEscapeHtml(label)}">
                    <span>${cursor.getDate()}</span>
                    <small>${cmEscapeHtml(shift)}</small>
                </button>`;
            cursor.setDate(cursor.getDate() + 1);
        }
        $('#pcCalendarDays').html(html).attr('aria-busy', 'false');
    });
}

//선택일 업무 현황 조회
function loadPcMainDay(ymd) {
    $('#pcDashboard').attr('data-selected-date', ymd);
    $('.pc-selected-date').text(formatPcMainDate(ymd).substring(5));
    loadPcMainCommute(ymd);
    $('#pcMainSchedules, #pcMainPatients, #pcMealMenus').html('<p class="pc-main-empty">조회 중입니다.</p>');
    $('#pcMainVacations, #pcMainBirthdays, #pcMainDuty, #pcMainOutDuty').html('<li class="pc-main-empty">조회 중입니다.</li>');
    $('#pcVacationCount, #pcBirthdayCount').text('—');

    cmAjax('/schedule/todayScheduleList.do', 'GET', {
        searchDate: ymd,
        ccBuser: $('#pcDashboard').attr('data-team-code'),
        userId: $('#pcDashboard').attr('data-user-id')
    }, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        const html = list.map(function (item) {
            const {time, remark} = detailPcMainSchedule(item);

            return `
                <div class="pc-main-schedule">
                    ${time ? `<time>${cmEscapeHtml(time)}</time>` : ''}
                    <p>${cmNl2br(remark)}</p>
                </div>`;
        }).join('');

        $('#pcMainSchedules').html(list.length ? html : '<p class="pc-main-empty">등록된 일정이 없습니다.</p>');
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMainSchedules').html('<p class="pc-main-empty">일정을 불러오지 못했습니다.</p>');
    });

    cmAjax('/customer/dailyStats.do', 'GET', {baseDt: ymd}, false).done(function (data) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        if (!data) {
            $('#pcMainPatients').html('<p class="pc-main-empty">환자 현황이 없습니다.</p>');
            return;
        }

        const beds = cmToNumber(data.srTo);
        const total = cmToNumber(data.cnt1);
        const emergency = cmToNumber(data.emergencyCnt);
        const admit = cmToNumber(data.cnt4);
        const discharge = cmToNumber(data.cnt5);
        const register = cmToNumber(data.cnt8);
        const exam = cmToNumber(data.cnt9);
        const metrics = [
            {
                name: '재원',
                color: '#004a80',
                percent: beds ? Math.round(total * 100 / beds) : 0,
                number: total + '<small>명</small>',
                detail: '허가병상 ' + beds + '병상'
            },
            {
                name: '급성기병상',
                color: '#c56753',
                percent: Math.round(emergency * 100 / 40),
                number: emergency + '<small>명</small>',
                detail: '급성기병상 40병상'
            },
            {
                name: '입 · 퇴원',
                isInout: true,
                color: '#fda433',
                percent: admit + discharge ? Math.round(discharge * 100 / (admit + discharge)) : 0,
                number: admit + ' / ' + discharge,
                detail: '월 누계 ' + cmToNumber(data.cnt2) + ' / ' + cmToNumber(data.cnt3)
            },
            {
                name: '외래',
                color: '#52a243',
                percent: register ? Math.round(exam * 100 / register) : 0,
                number: exam + '<small>명</small>',
                detail: '접수 ' + register + '명'
            }
        ];
        const html = metrics.map(function (item) {
            const percent = Math.max(0, Math.min(item.percent, 100));

            if (item.isInout) {
                return `
                    <div class="pc-patient-metric pc-patient-inout${admit + discharge ? '' : ' is-empty'}">
                        <h3>${item.name}</h3>
                        <div class="pc-patient-ring"
                             style="--metric-color:${item.color};--metric-percent:${percent}"
                             aria-label="당일 입원 ${admit}명, 퇴원 ${discharge}명">
                            <span>${item.number}<small>당일</small></span>
                        </div>
                        <div class="pc-patient-number pc-patient-inout-labels">
                            <span class="pc-patient-admit">입원</span>
                            <span class="pc-patient-discharge">퇴원</span>
                        </div>
                        <small class="pc-patient-detail">${item.detail}</small>
                    </div>`;
            }

            return `
                <div class="pc-patient-metric">
                    <h3>${item.name}</h3>
                    <div class="pc-patient-ring"
                         style="--metric-color:${item.color};--metric-percent:${percent}"
                         aria-label="${item.name} ${item.percent}%">
                        <span>${item.percent}%</span>
                    </div>
                    <strong class="pc-patient-number">${item.number}</strong>
                    <small class="pc-patient-detail">${item.detail}</small>
                </div>`;
        }).join('');

        $('#pcMainPatients').html(html);
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMainPatients').html('<p class="pc-main-empty">환자 현황을 불러오지 못했습니다.</p>');
    });

    ['/schedule/dayDuty.do', '/schedule/outDayDuty.do'].forEach(function (url, index) {
        const target = index === 0 ? '#pcMainDuty' : '#pcMainOutDuty';
        cmAjax(url, 'GET', {searchDate: ymd}, false).done(function (list) {
            if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

            const html = list.map(function (item) {
                return `
                    <li>
                        <span class="pc-person-name">${cmEscapeHtml(item.duName)}</span>
                        <small class="pc-person-description">${cmEscapeHtml(item.hcName)}</small>
                    </li>`;
            }).join('');

            $(target).html(list.length ? html : '<li class="pc-main-empty">등록된 정보가 없습니다.</li>');
        }).fail(function () {
            if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
            $(target).html('<li class="pc-main-empty">정보를 불러오지 못했습니다.</li>');
        });
    });

    cmAjax('/main/birthDayList.do', 'GET', {searchDate: ymd}, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        [4, 2].forEach(function (sort) {
            const people = list.filter(function (item) {
                return Number(item.sort) === sort;
            });
            const target = sort === 4 ? '#pcMainVacations' : '#pcMainBirthdays';
            $(sort === 4 ? '#pcVacationCount' : '#pcBirthdayCount').text(people.length);

            const html = people.map(function (item) {
                let type = item.ccRemark;
                if (sort === 2 && type) {
                    if (type.includes('+')) type = '양력';
                    else if (type.includes('-')) type = '음력';
                }

                return `
                    <li>
                        <span class="pc-person-name">${sort === 4 ? formatPcMainSymbols(item.ccName) : cmEscapeHtml(item.ccName)}</span>
                        <small class="pc-person-description">${sort === 4 ? formatPcMainSymbols(type) : cmEscapeHtml(type)}</small>
                    </li>`;
            }).join('');

            $(target).html(people.length
                ? html
                : `<li class="pc-main-empty">${sort === 4 ? '휴가자' : '생일자'}가 없습니다.</li>`);
        });
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMainVacations, #pcMainBirthdays').html('<li class="pc-main-empty">정보를 불러오지 못했습니다.</li>');
    });

    cmAjax('/main/mealList.do', 'GET', {searchDate: ymd}, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        const selected = Number($('#pcMealTabs button[aria-pressed="true"]').attr('data-meal'));
        const html = [1, 2, 3].map(function (flag) {
            const meals = list.filter(function (item) {
                return Number(item.fmFlag) === flag;
            });
            const names = meals.map(function (item) {
                return `<li>${cmEscapeHtml(item.reName)}</li>`;
            }).join('');
            const kcal = meals.reduce(function (sum, item) {
                return sum + cmToNumber(item.fmKal);
            }, 0);
            const menu = meals.length
                ? `<ul class="pc-meal-names">${names}</ul>
                   <span class="pc-meal-kcal">${kcal} kcal</span>`
                : '<p class="pc-main-empty">등록된 식단이 없습니다.</p>';

            return `
                <div class="pc-meal-section" data-meal="${flag}"
                     aria-label="${['아침', '점심', '저녁'][flag - 1]} 식단"${flag !== selected ? ' hidden' : ''}>
                    ${menu}
                </div>`;
        }).join('');

        $('#pcMealMenus').html(html);
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMealMenus').html('<p class="pc-main-empty">식단을 불러오지 못했습니다.</p>');
    });
}

//게시판 조회
function loadPcMainBoards() {
    [1, 2, 3].forEach(function (flag) {
        const target = ['#pcMainNotices', '#pcMainBoards', '#pcMainLibrary'][flag - 1];
        const url = flag === 3 ? '/pc/main/libraryList.do' : '/notice/list.do';
        const params = flag === 3 ? {} : {
            hcCode: 'IntGmenu',
            tnFlag: flag,
            offset: 0,
            limit: 5,
            searchId: $('#pcDashboard').attr('data-user-id')
        };

        cmAjax(url, 'GET', params, false).done(function (list) {
            const html = list.map(function (item) {
                return `
                    <article class="pc-main-post${item.ccView === 'N' ? ' is-unread' : ''}">
                        <h3 title="${cmEscapeHtml(item.tnTitle)}">${cmEscapeHtml(item.tnTitle)}</h3>
                        <p>
                            <span>${cmEscapeHtml(item.tnUk)} · 조회 ${cmEscapeHtml(item.viewCount)}</span>
                            <time>${cmEscapeHtml(item.tnDateStr)}</time>
                        </p>
                    </article>`;
            }).join('');

            $(target).html(list.length ? html : '<p class="pc-main-empty">등록된 게시글이 없습니다.</p>');
        }).fail(function () {
            $(target).html('<p class="pc-main-empty">게시글을 불러오지 못했습니다.</p>');
        });
    });
}

//알림판 조회
function loadPcMainBulletin() {
    cmAjax('/pc/main/bulletinList.do', 'GET', {}, false).done(function (list) {
        const html = list.map(function (item) {
            const cls = Number(item.ccColor) === 1 ? ' is-important' : '';

            return `
                <p class="pc-main-bulletin-item${cls}">${cmEscapeHtml(item.ccTitle)}</p>`;
        }).join('');

        $('#pcMainBulletin').html(list.length ? html : '<p class="pc-main-empty">등록된 알림이 없습니다.</p>');
    }).fail(function () {
        $('#pcMainBulletin').html('<p class="pc-main-empty">알림을 불러오지 못했습니다.</p>');
    });
}

//선택일 출퇴근 조회
function loadPcMainCommute(ymd) {
    $('.pc-commute').attr('aria-label', formatPcMainDate(ymd) + ' 출퇴근 시간');
    $('#pcCommuteIn, #pcCommuteOut').text('조회 중');
    cmAjax('/profile/commuteStat.do', 'GET', {
        searchId: $('#pcDashboard').attr('data-user-id'),
        searchDate: ymd
    }, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        const row = list[0];
        $('#pcCommuteIn').text(row && row.ilIntime
            ? row.ilIntime.substring(0, 2) + ':' + row.ilIntime.substring(2, 4)
            : '—');
        $('#pcCommuteOut').text(row && row.ilOuttime
            ? row.ilOuttime.substring(0, 2) + ':' + row.ilOuttime.substring(2, 4)
            : '—');
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcCommuteIn, #pcCommuteOut').text('조회 실패');
    });
}

//일정 시간 추출
function detailPcMainSchedule(item) {
    let time = item.ccTime ? item.ccTime.trim() : '';
    if (time === ':') time = '';

    let remark = item.ccRmk;
    if (!time && remark) {
        const match = /(^|[^\d])((?:(오전|오후)\s*)?([01]?\d|2[0-3])\s*(?::\s*([0-5]\d)(?!\d)|시(?:\s*([0-5]?\d)\s*분)?))/u.exec(remark);
        if (match) {
            let hour = Number(match[4]);
            if (match[3] && hour >= 1 && hour <= 12) {
                hour = hour % 12 + (match[3] === '오후' ? 12 : 0);
            }
            time = String(hour).padStart(2, '0') + ':' + String(Number(match[5] || match[6] || 0)).padStart(2, '0');
            const start = match.index + match[1].length;
            remark = (remark.slice(0, start) + remark.slice(start + match[2].length)).trim();
        }
    }
    return {time: time, remark: remark};
}

//현재 날짜와 시간
function updatePcMainClock() {
    const now = new Date();
    $('#pcDashboardClock').attr('datetime', now.toISOString());
    $('#pcDashboardToday').text(formatPcMainDate(cmFormatYmd(now, '-')));
    $('#pcDashboardTime').text(
        String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
    );
    $('#pcDashboardSeconds').text(' ' + String(now.getSeconds()).padStart(2, '0'));
}

//원문자 표시
function formatPcMainSymbols(text) {
    return cmEscapeHtml(text).replace(/[\u2460-\u24ff\u3251-\u325f\u32b1-\u32bf]+/g,
        '<span class="pc-main-symbol">$&</span>');
}

//날짜 표시
function formatPcMainDate(ymd) {
    const date = new Date(ymd + 'T00:00:00');
    return ymd.replaceAll('-', '.') + ' (' + ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] + ')';
}
