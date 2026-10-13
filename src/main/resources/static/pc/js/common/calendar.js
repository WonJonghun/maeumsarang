$(function () {
    //달력 크기·글자 맞춤
    const observer = new ResizeObserver(function (entries) {
        entries.forEach(entry => fitPcCalendarLabels($(entry.target)));
    });
    $('.pc-calendar').each(function () {
        observer.observe(this);
    });
    document.fonts.ready.then(function () {
        $('.pc-calendar').each(function () {
            fitPcCalendarLabels($(this));
        });
    });

    //일정 이름·헬퍼 병동 표시
    const tooltip = $('<div class="pc-calendar-tooltip" role="tooltip" hidden></div>').appendTo('body');
    $('.pc-calendar-days').on('mousemove mouseleave', function (event) {
        const block = $(event.target).closest('.pc-calendar-week-row')
            .find('.pc-calendar-event.is-truncated, .pc-calendar-event[data-helper-teams]')
            .filter(function () {
                const rect = this.getBoundingClientRect();
                return event.clientX >= rect.left && event.clientX <= rect.right
                    && event.clientY >= rect.top && event.clientY <= rect.bottom;
            }).first();

        if (event.type === 'mouseleave' || !block.length) {
            tooltip.prop('hidden', true);
            return;
        }

        tooltip.text(block.attr('data-helper-teams') || block.attr('data-label')).prop('hidden', false);
        tooltip.css({
            left: Math.min(event.clientX + 12, window.innerWidth - tooltip.outerWidth() - 12),
            top: Math.min(event.clientY + 16, window.innerHeight - tooltip.outerHeight() - 12)
        });
    });

});

const pcCalendarSymbols = /[\u00bc-\u00be\u2150-\u2189\u2460-\u24ff\u3251-\u325f\u32b1-\u32bf]+/g;

//달력 조회
function loadPcCalendar(calendar, ymd) {
    const monthTitle = calendar.find('.pc-calendar-month');
    const calendarDays = calendar.find('.pc-calendar-days');
    const status = calendar.find('.pc-calendar-status');
    const monthKey = ymd.substring(0, 7);
    const previousMonth = monthTitle.attr('data-month');
    let monthClass = '';
    if (previousMonth && monthKey !== previousMonth) {
        monthClass = monthKey > previousMonth ? ' is-month-next' : ' is-month-prev';
    }
    const date = new Date(monthKey + '-01T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth();
    monthTitle
        .attr('data-month', monthKey)
        .text(year + '.' + String(month + 1).padStart(2, '0'));
    calendarDays.attr('aria-busy', 'true');
    status.text('');

    const holidays = cmAjax('/schedule/holidayList.do', 'GET', {
        year: year,
        month: String(month + 1).padStart(2, '0')
    }, calendar.attr('data-loading') !== 'false').then(function (list) {
        return list;
    }, function () {
        if (monthTitle.attr('data-month') === monthKey) {
            status.text('공휴일 정보를 불러오지 못했습니다.');
        }
        return [];
    });

    const work = cmAjax('/schedule/scheduleList.do', 'GET', {
        baseDt: monthKey + '-01',
        flagCd: calendar.attr('data-work-flag'),
        saCd: calendar.attr('data-user-id')
    }, calendar.attr('data-loading') !== 'false').then(function (list) {
        return list;
    }, function () {
        if (monthTitle.attr('data-month') === monthKey) {
            status.text('근무 일정을 불러오지 못했습니다.');
        }
        return [];
    });

    $.when(holidays, work).done(function (holidayList, workList) {
        if (monthTitle.attr('data-month') !== monthKey) return;

        const cursor = new Date(year, month, 1 - date.getDay());
        const last = new Date(year, month + 1, 0);
        const end = new Date(year, month, last.getDate() + 6 - last.getDay());
        const days = [];
        const teamCode = calendar.attr('data-team-code');

        while (cursor <= end) {
            const day = cmFormatYmd(cursor, '-');
            const inMonth = cursor.getMonth() === month;
            const dayOff = holidayList.filter(function (item) {
                return item.ccDt.substring(0, 10) === day;
            });
            const shifts = inMonth ? workList.filter(item => item['a' + cursor.getDate()]) : [];
            const shift = shifts.map(item => item['a' + cursor.getDate()].replaceAll('ⓗ', '')).join(' · ');
            const helpers = shifts.filter(item => item.icBuser !== teamCode);
            const helperTeams = helpers.map(item => item.icBuserNm).join(' · ');
            let workType = 'etc';
            if (shift) {
                const code = shift.trim().toUpperCase();
                if (code.includes('당직')) workType = 'duty';
                else if (code.startsWith('D')) workType = 'd';
                else if (code.startsWith('E')) workType = 'e';
                else if (code.startsWith('N')) workType = 'n';
            }
            const selected = day === calendar.attr('data-selected-date');
            const label = formatPcCalendarDate(day)
                + (dayOff.length ? ' ' + dayOff.map(item => item.ccOffNm).join(', ') : '')
                + (shift ? ' 근무 ' + shift : '')
                + (helpers.length ? ' (다른 부서 근무 포함: ' + helperTeams + ')' : '');
            let cls = 'pc-calendar-day';
            if (!inMonth) cls += ' is-other-month';
            if (cursor.getDay() === 0) cls += ' is-sunday';
            if (cursor.getDay() === 6) cls += ' is-saturday';
            if (dayOff.length) cls += ' is-holiday';
            if (day === cmGetToday('-')) cls += ' is-today';
            days.push({
                date: day,
                number: cursor.getDate(),
                cls: cls,
                selected: selected,
                label: label,
                holiday: dayOff.map(item => item.ccOffNm).join(' · '),
                shift: shift,
                otherTeam: helpers.length > 0,
                helperTeams: helperTeams,
                workType: workType
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        const html = [];
        for (let index = 0; index < days.length; index += 7) {
            const week = days.slice(index, index + 7);
            const buttons = week.map(function (item) {
                return `
                    <button type="button" class="${item.cls}"
                            data-date="${item.date}" data-work="${cmEscapeHtml(item.shift)}" aria-pressed="${item.selected}"
                            aria-label="${cmEscapeHtml(item.label)}">
                        <span class="pc-calendar-number">${item.number}</span>
                    </button>`;
            }).join('');
            let blocks = '';

            //날짜별 근무·공휴일 표시
            [{key: 'shift', row: 1}, {key: 'holiday', row: 2}].forEach(function (lane) {
                week.forEach(function (item, index) {
                    const label = item[lane.key];
                    if (!label) return;

                    let cls = lane.key === 'holiday' ? 'is-holiday' : 'is-work is-' + item.workType;
                    if (label.match(pcCalendarSymbols)) cls += ' has-symbol-shift';

                    blocks += `
                        <span class="pc-calendar-event ${cls}" data-label="${cmEscapeHtml(label)}"
                              ${lane.key === 'shift' && item.otherTeam ? `data-helper-teams="${cmEscapeHtml(item.helperTeams)}"` : ''}
                              style="grid-column: ${index + 1} / ${index + 2}; grid-row: ${lane.key === 'holiday' && !item.shift ? 1 : lane.row}">
                            <span class="pc-calendar-event-label">${formatPcCalendarSymbols(label)}</span>
                            ${lane.key === 'shift' && item.otherTeam
                                ? '<span class="pc-calendar-event-team">H</span>' : ''}
                        </span>`;
                });
            });

            html.push(`
                <div class="pc-calendar-week-row${monthClass}">
                    ${buttons}
                    <div class="pc-calendar-events" aria-hidden="true">${blocks}</div>
                </div>`);
        }
        calendarDays.html(html.join('')).attr('aria-busy', 'false');
        fitPcCalendarLabels(calendar);
        calendar.trigger('pcCalendar:loaded');
    });
}

//달력 글자 너비 맞춤
function fitPcCalendarLabels(calendar) {
    calendar.find('.pc-calendar-event-label').each(function () {
        const full = $(this).parent().attr('data-label');
        const letters = Array.from(full);
        $(this).html(formatPcCalendarSymbols(full));

        if (this.scrollWidth <= this.clientWidth) {
            $(this).parent().removeClass('is-truncated');
            return;
        }

        while (letters.length && this.scrollWidth > this.clientWidth) {
            letters.pop();
            $(this).html(formatPcCalendarSymbols(letters.join('') + '..'));
        }
        $(this).parent().addClass('is-truncated');
    });
}

//달력 특수문자 표시
function formatPcCalendarSymbols(text) {
    return cmEscapeHtml(text).replace(pcCalendarSymbols, '<span class="pc-calendar-symbol">$&</span>');
}

//날짜 표시
function formatPcCalendarDate(ymd) {
    const date = new Date(ymd + 'T00:00:00');
    return ymd.replaceAll('-', '.') + ' (' + ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] + ')';
}
