let currentMonYmd = '';
let weekStartDt = '';
let weekEndDt = '';
let resizeTimer;
let scheduleList = [];
let isInitialFocusDone = false;

$(function () {
    setStickyOffsets();
    setWeek();
    loadScheduleList();
    bindEvents();
    initScheduleDeptSuggest();

    $(window).on('resize', function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            setStickyOffsets();
        }, 80);
    });
});

//이벤트
function bindEvents() {
    $('#btnWeekPrev').on('click', function () {
        moveWeek(-1);
    });

    $('#btnWeekNext').on('click', function () {
        moveWeek(1);
    });

    //내 부서
    $('#chkMyDept').on('change', function () {
        applyDeptFilterAndRender();
    });

    //상단바 검색(submit)
    $(document).off('topbar:search.scheduleList').on('topbar:search.scheduleList', function (e, p) {
        applyDeptFilterAndRender(p && p.searchKeyword);
    });

    //타이핑 즉시 검색
    $('#searchKeyword').off('input.scheduleList').on('input.scheduleList', function () {
        applyDeptFilterAndRender($(this).val());
    });

    //셀 클릭
    $('#scheduleTbody').on('click', '.day-cell', function () {
        selectScheduleCell($(this));
    });

    //사람 클릭(팝업)
    $('#scheduleTbody').on('click', '.td-left', function (e) {
        e.stopPropagation();

        const el = $(this);

        if ($('#empPopup').length && $('#empPopup').data('anchorEl') === this) {
            $('#empPopup').remove();
            return;
        }

        showEmpPopup(el, {
            name: String(el.data('name') == null ? '' : el.data('name')),
            buserNm: String(el.data('buserNm') == null ? '' : el.data('buserNm')),
            jikgubNm: String(el.data('jikgubNm') == null ? '' : el.data('jikgubNm')),
            hp: String(el.data('hp') == null ? '' : el.data('hp')),
            sa: String(el.data('sa') == null ? '' : el.data('sa'))
        });
    });

    //바깥 클릭/터치 시 팝업 닫기
    $(document).on('mousedown touchstart', function (e) {
        if (!$('#empPopup').length) return;
        if ($(e.target).closest('#empPopup').length) return;
        if ($(e.target).closest('.td-left').length) return;
        $('#empPopup').remove();
    });

    //스크롤/드래그 시 팝업 닫기
    $(window).on('scroll', function () {
        $('#empPopup').remove();
    });

    $(document).on('touchmove', function () {
        $('#empPopup').remove();
    });
}

//부서명 연관검색어 초기화
function initScheduleDeptSuggest() {
    const searchField = $('.topbar-search-field');
    if (!searchField.length) return;

    if (!$('#scheduleDeptSuggestToggle').length) {
        searchField.append('<button type="button" id="scheduleDeptSuggestToggle" class="schedule-dept-suggest-toggle" aria-label="부서명 목록"></button>');
    }

    if (!$('#scheduleDeptSuggest').length) {
        searchField.append('<div id="scheduleDeptSuggest" class="schedule-dept-suggest" style="display:none;"></div>');
    }

    $('#searchKeyword').off('focus.scheduleDeptSuggest').on('focus.scheduleDeptSuggest', function () {
        showScheduleDeptSuggest();
    });

    $('#searchKeyword').off('blur.scheduleDeptSuggest').on('blur.scheduleDeptSuggest', function () {
        setTimeout(function () {
            hideScheduleDeptSuggest();
        }, 120);
    });

    $('#scheduleDeptSuggestToggle').off('mousedown.scheduleDeptSuggest').on('mousedown.scheduleDeptSuggest', function (e) {
        e.preventDefault();
    });

    $('#scheduleDeptSuggestToggle').off('click.scheduleDeptSuggest').on('click.scheduleDeptSuggest', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if ($('#scheduleDeptSuggest').is(':visible')) {
            hideScheduleDeptSuggest();
            return false;
        }

        $('#searchKeyword').focus();
        showScheduleDeptSuggest();
        return false;
    });

    searchField.off('mousedown.scheduleDeptSuggest').on('mousedown.scheduleDeptSuggest', '.schedule-dept-suggest-item', function (e) {
        e.preventDefault();

        $('#searchKeyword').val($(this).text()).trigger('input');
        hideScheduleDeptSuggest();
    });
}

//부서명 연관검색어 세팅
function setScheduleDeptSuggest() {
    const deptMap = {};
    let html = '';

    (scheduleList || []).forEach(function (row) {
        const dept = $.trim((row && row.icBuserNm) || '');
        if (!dept || deptMap[dept]) return;

        deptMap[dept] = true;
        html += '<button type="button" class="schedule-dept-suggest-item">' + scheduleEscapeHtml(dept) + '</button>';
    });

    $('#scheduleDeptSuggest').html(html);

    if ($('#searchKeyword').is(':focus')) {
        showScheduleDeptSuggest();
    }
}

//부서명 연관검색어 열기
function showScheduleDeptSuggest() {
    const suggest = $('#scheduleDeptSuggest');
    if (!suggest.length || !$.trim(suggest.html() || '')) return;

    suggest.show();
    $('#scheduleDeptSuggestToggle').addClass('is-open');
}

//부서명 연관검색어 닫기
function hideScheduleDeptSuggest() {
    $('#scheduleDeptSuggest').hide();
    $('#scheduleDeptSuggestToggle').removeClass('is-open');
}

//문자 escape
function scheduleEscapeHtml(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

//일자 설정
function setWeek(monYmd) {
    let mon;

    if (monYmd) {
        currentMonYmd = monYmd;
        mon = cmSubDays(monYmd, 0, '.');
    } else {
        const today = cmGetToday('');
        const day = new Date().getDay();
        const diffToMon = (day === 0) ? 6 : (day - 1);

        mon = cmSubDays(today, diffToMon, '.');
        currentMonYmd = mon.replace(/\./g, '');
    }

    weekStartDt = cmSubDays(currentMonYmd, 0, '-');
    weekEndDt = cmSubDays(currentMonYmd, -6, '-');

    const y = parseInt(currentMonYmd.substring(0, 4), 10);
    const m = parseInt(currentMonYmd.substring(4, 6), 10) - 1;
    const d = parseInt(currentMonYmd.substring(6, 8), 10);

    const date = new Date(y, m, d);
    const monthNo = date.getMonth() + 1;
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const weekNo = Math.floor((date.getDate() + firstDay - 1) / 7) + 1;

    $('.week-badge').html('<span class="week-n">' + monthNo + '</span>월 <span class="week-n">' + weekNo + '</span>주차');

    const sun = cmSubDays(currentMonYmd, -6, '.');
    $('.week-range-text').text(mon + '(월) ~ ' + sun.substring(5) + '(일)');

    const headCols = $('.schedule-thead .day-col');
    for (let i = 0; i < 7; i++) {
        const ymdDash = cmSubDays(currentMonYmd, -i, '-');
        headCols.eq(i).find('.dom').text(ymdDash.substring(8, 10).replace(/^0/, ''));
    }

    setStickyOffsets();
    loadHolidayList();
    applyTodayHighlight();
}

//주 변경
function moveWeek(weekDiff) {
    if (!currentMonYmd) {
        setWeek();
        return;
    }

    setWeek(cmSubDays(currentMonYmd, -(weekDiff * 7), ''));
    loadScheduleList();
}

//조회
function loadScheduleList() {
    const baseKey = $.trim($('#baseKey').val());

    const scheduleParam = {
        searchKeyword: baseKey,
        searchFromDate: weekStartDt,
        searchToDate: weekEndDt
    };

    cmAjax('/schedule/scheduleWeekList.do', 'GET', scheduleParam, true).done(function (scheduleData) {
        scheduleList = $.isArray(scheduleData) ? scheduleData : [];
        setScheduleDeptSuggest();
        applyDeptFilterAndRender();
    }).fail(function () {
        scheduleList = [];
        $('.head-count').text('0');
        $('#scheduleTbody').empty().append($('<div/>', { class: 'schedule-error', text: '근무표 조회에 실패했습니다.' }));
    });
}

//공휴일 조회
function loadHolidayList() {
    const year = weekStartDt.substring(0, 4);
    const month = weekStartDt.substring(5, 7);

    const holiParam = {
        year: year,
        month: month,
        ccWeekendCd: 0
    };

    return cmAjax('/schedule/holidayList.do', 'GET', holiParam, false).done(function (holidayData) {
        const list = (holidayData && holidayData.list) ? holidayData.list : holidayData;
        const holidayList = $.isArray(list) ? list : [];

        const holidayMap = {};
        for (let i = 0; i < holidayList.length; i++) {
            const h = holidayList[i];
            if (!h) continue;

            const nm = $.trim(String(h.ccOffNm == null ? '' : h.ccOffNm));
            if (!nm) continue;

            const raw = String(h.ccDt == null ? '' : h.ccDt);
            const digits = raw.replace(/\D/g, '');
            if (digits.length < 8) continue;

            const key = digits.substring(0, 4) + '-' + digits.substring(4, 6) + '-' + digits.substring(6, 8);
            holidayMap[key] = nm;
        }

        const headCols = $('.schedule-thead .day-col');
        for (let i = 0; i < 7; i++) {
            const ymdDash = cmSubDays(currentMonYmd, -i, '-');
            const col = headCols.eq(i);

            col.removeClass('holiday');
            col.removeAttr('title');

            const nm = holidayMap[ymdDash];
            if (!nm) continue;

            col.addClass('holiday');
            col.attr('title', nm);
        }
    });
}

//근무표 그리기
function renderScheduleList(list, keyword) {
    const viewList = $.isArray(list) ? list : [];
    const k = $.trim(keyword == null ? '' : String(keyword));

    $('.head-count').text(viewList.length);

    const scheduleBodyEl = $('#scheduleTbody');
    scheduleBodyEl.empty();

    if (!viewList.length) {
        scheduleBodyEl.append($('<div/>', { class: 'schedule-empty', text: '표시할 데이터가 없습니다.' }));
        applyInitialScheduleSelection(viewList);
        return;
    }

    //이미지 호출
    const defaultAvatarUrl = '/images/emptyUser.png';

    const bodyEl = $('<div/>', { class: 'schedule-tbody' });

    for (let i = 0; i < viewList.length; i++) {
        const row = viewList[i];
        if (!row) continue;

        const trEl = $('<div/>', { class: 'schedule-tr' });

        const icName = String(row.icName == null ? '' : row.icName);
        const buserNm = String(row.icBuserNm == null ? '' : row.icBuserNm);
        const jikgubNm = String(row.icJikgubNm == null ? '' : row.icJikgubNm);
        const hp = String(row.icHpPhone == null ? '' : row.icHpPhone);
        const sa = String(row.icSaPhone == null ? '' : row.icSaPhone);

        const rawCode = String(row.icCode == null ? '' : row.icCode);
        const afNum = $.trim(rawCode.replace(/\D/g, ''));

        const imgUrl = afNum
            ? '/attach/profileView.do?afNum=' + encodeURIComponent(afNum) + '&afSeq=1'
            : defaultAvatarUrl;
        const imgEl = $('<img/>', {
            class: 'schedule-profile-img',
            alt: '',
            loading: 'lazy',
            decoding: 'async'
        }).attr('src', imgUrl).on('error', function () {
            if (this.src.indexOf(defaultAvatarUrl) > -1) return;
            this.src = defaultAvatarUrl;
        });

        const nameEl = $('<div/>', { class: 'ic-name' });
        nameEl.html(buildNameHighlightHtml(icName, k));

        const leftEl = $('<div/>', { class: 'schedule-td td-left' })
            .data('name', icName)
            .data('buserNm', buserNm)
            .data('jikgubNm', jikgubNm)
            .data('hp', hp)
            .data('sa', sa)
            .append($('<div/>', { class: 'profile-circle' }).append(imgEl))
            .append(nameEl);

        const daysEl = $('<div/>', { class: 'schedule-td td-days' });

        for (let d = 1; d <= 7; d++) {
            const key = 'a' + d;
            const rawVal = row[key];
            const val = rawVal == null ? '' : String(rawVal);

            const cellEl = $('<div/>', { class: 'day-cell' });

            if (val) {
                const s = val.trim().toUpperCase();
                let type = 'etc';

                if (s.indexOf('당직') > -1) type = 'duty';
                else if (s.indexOf('D') === 0) type = 'd';
                else if (s.indexOf('E') === 0) type = 'e';
                else if (s.indexOf('N') === 0) type = 'n';

                cellEl.append($('<span/>', { class: 'shift-tag shift-' + type, text: val }));
            }

            daysEl.append(cellEl);
        }

        trEl.append(leftEl).append(daysEl);
        bodyEl.append(trEl);
    }

    scheduleBodyEl.append(bodyEl);
    applyInitialScheduleSelection(viewList);
}

//내부서 + 검색
function applyDeptFilterAndRender(keyword) {
    clearScheduleSelection();

    const isMyDept = $('#chkMyDept').is(':checked');
    const loginBuser = String($('#loginBuser').val() == null ? '' : $('#loginBuser').val());

    const k = $.trim(keyword == null ? $('#searchKeyword').val() : keyword);
    const lk = k ? k.toLowerCase() : '';
    const lkNum = k ? lk.replace(/[^0-9]/g, '') : '';

    const src = scheduleList;

    const filtered = [];
    for (let i = 0; i < src.length; i++) {
        const row = src[i];
        if (!row) continue;

        if (isMyDept) {
            const icBuser = String(row.icBuser == null ? '' : row.icBuser);
            if (icBuser !== loginBuser) continue;
        }

        if (!k) {
            filtered.push(row);
            continue;
        }

        const name = String(row.icName == null ? '' : row.icName);
        const dept = String(row.icBuserNm == null ? '' : row.icBuserNm);
        const rank = String(row.icJikgubNm == null ? '' : row.icJikgubNm);
        const hp = String(row.icHpPhone == null ? '' : row.icHpPhone);
        const sa = String(row.icSaPhone == null ? '' : row.icSaPhone);

        const text = (name + ' ' + dept + ' ' + rank + ' ' + hp + ' ' + sa).toLowerCase();
        if (text.indexOf(lk) > -1) {
            filtered.push(row);
            continue;
        }

        if (lkNum) {
            const hpNum = hp.replace(/[^0-9]/g, '');
            const saNum = sa.replace(/[^0-9]/g, '');
            if (hpNum.indexOf(lkNum) > -1 || saNum.indexOf(lkNum) > -1) filtered.push(row);
        }
    }

    renderScheduleList(filtered, k);
}

//상단바 고정 css 넣기
function setStickyOffsets() {
    const weekbarEl = document.querySelector('.schedule-weekbar');
    if (!weekbarEl) return;

    const h = weekbarEl.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--weekbar-h', h + 'px');
}

//오늘 하이라이트
function applyTodayHighlight() {
    $('.schedule-thead .day-col').removeClass('is-today');
    $('#scheduleTbody .day-cell').removeClass('is-today');

    const todayColIdx = getTodayColIdx();
    if (todayColIdx < 0) return;

    setScheduleColumn(todayColIdx, 'is-today');
}

//초기 선택
function applyInitialScheduleSelection(viewList) {
    clearScheduleSelection();

    const todayColIdx = getTodayColIdx();
    if (todayColIdx >= 0) setScheduleColumn(todayColIdx, 'is-today');

    const myRowIdx = getMyRowIdx(viewList);
    if (myRowIdx < 0) return;

    const trEl = $('#scheduleTbody .schedule-tr').eq(myRowIdx);
    if (!trEl.length) return;

    trEl.addClass('is-selected-row');

    if (todayColIdx >= 0) {
        trEl.find('.td-days .day-cell').eq(todayColIdx).addClass('is-selected-cell');
        $('#scheduleTbody').data('selColIdx', todayColIdx);
    }

    $('#scheduleTbody').data('selRowIdx', myRowIdx);

    if (!isInitialFocusDone) {
        focusScheduleRow(trEl);
        isInitialFocusDone = true;
    }
}

//셀 선택
function selectScheduleCell(cellEl) {
    const trEl = cellEl.closest('.schedule-tr');
    const colIdx = cellEl.index();

    if (!trEl.length || colIdx < 0) return;

    clearScheduleSelection();

    const todayColIdx = getTodayColIdx();
    if (todayColIdx >= 0) {
        $('.schedule-thead .day-col').eq(todayColIdx).addClass('is-today');
    }

    setScheduleColumn(colIdx, 'is-selected-col');

    trEl.addClass('is-selected-row');
    cellEl.addClass('is-selected-cell');

    $('#scheduleTbody').data('selColIdx', colIdx);
    $('#scheduleTbody').data('selRowIdx', trEl.index());
}

//선택 초기화
function clearScheduleSelection() {
    $('.schedule-thead .day-col').removeClass('is-today is-selected-col');
    $('#scheduleTbody .day-cell').removeClass('is-today is-selected-col is-selected-cell');
    $('#scheduleTbody .schedule-tr').removeClass('is-selected-row');
    $('#scheduleTbody').removeData('selColIdx').removeData('selRowIdx');
}

//컬럼 선택
function setScheduleColumn(colIdx, className) {
    $('.schedule-thead .day-col').eq(colIdx).addClass(className);

    $('#scheduleTbody .schedule-tr').each(function () {
        $(this).find('.td-days .day-cell').eq(colIdx).addClass(className);
    });
}

//오늘 컬럼
function getTodayColIdx() {
    const todayDash = cmSubDays(cmGetToday(''), 0, '-');

    for (let i = 0; i < 7; i++) {
        if (cmSubDays(currentMonYmd, -i, '-') === todayDash) return i;
    }

    return -1;
}

//내 행 번호
function getMyRowIdx(viewList) {
    const loginIcCode = String($('#loginIcCode').val() == null ? '' : $('#loginIcCode').val());
    const myKey = loginIcCode.replace(/\D/g, '');
    const rows = $.isArray(viewList) ? viewList : [];

    if (!myKey) return -1;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const rowKey = String(row.icCode == null ? '' : row.icCode).replace(/\D/g, '');
        if (rowKey && rowKey === myKey) return i;
    }

    return -1;
}

//내 행 포커스
function focusScheduleRow(trEl) {
    const wrapEl = $('.schedule-list-wrap');
    const trTop = trEl.position().top;
    const wrapHeight = wrapEl.height();
    const trHeight = trEl.outerHeight();

    wrapEl.scrollTop(wrapEl.scrollTop() + trTop - (wrapHeight / 2) + (trHeight / 2));

    const leftEl = trEl.find('.td-left');
    if (!leftEl.length) return;

    leftEl.attr('tabindex', '-1');

    try {
        leftEl[0].focus({ preventScroll: true });
    } catch (e) {
        leftEl[0].focus();
    }
}

//직원 팝업
function showEmpPopup(anchorEl, emp) {
    $('#empPopup').remove();

    const pop = $('<div/>', { id: 'empPopup', class: 'emp-pop' });
    pop.data('anchorEl', anchorEl[0]);

    pop.append($('<div/>', { class: 'emp-pop-name', text: emp.name }));

    const subText = (emp.buserNm ? emp.buserNm : '') + (emp.jikgubNm ? ' / ' + emp.jikgubNm : '');
    pop.append($('<div/>', { class: 'emp-pop-sub', text: subText }));

    const hpDigits = String(emp.hp == null ? '' : emp.hp).replace(/\D/g, '');
    const saDigits = String(emp.sa == null ? '' : emp.sa).replace(/\D/g, '');
    const saTel = saDigits ? ('0632402' + saDigits) : '';

    const hpValEl = $('<span/>', { class: 'emp-pop-val' });
    if (hpDigits) hpValEl.append($('<a/>', { class: 'emp-pop-link', href: 'tel:' + hpDigits, text: emp.hp }));
    else hpValEl.text('-');

    const saValEl = $('<span/>', { class: 'emp-pop-val' });
    if (saTel) saValEl.append($('<a/>', { class: 'emp-pop-link', href: 'tel:' + saTel, text: emp.sa }));
    else saValEl.text('-');

    pop.append($('<div/>', { class: 'emp-pop-line' })
        .append($('<span/>', { class: 'emp-pop-lbl', text: '휴대폰' }))
        .append(hpValEl));

    pop.append($('<div/>', { class: 'emp-pop-line' })
        .append($('<span/>', { class: 'emp-pop-lbl', text: '직  통' }))
        .append(saValEl));

    $('body').append(pop);

    const a = anchorEl[0].getBoundingClientRect();
    const pw = pop.outerWidth();
    const ph = pop.outerHeight();

    let left = a.left + window.scrollX;
    let top = a.bottom + window.scrollY - 8;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + pw > vw - 8) left = vw - pw - 8;
    if (top + ph > window.scrollY + vh - 8) top = a.top + window.scrollY - ph - 6;
    if (left < 8) left = 40;

    pop.css({ left: left + 'px', top: top + 'px' });

    pop.on('mousedown touchstart', function (e) {
        e.stopPropagation();
    });
}

//이름 하이라이트
function buildNameHighlightHtml(name, keyword) {
    const k = $.trim(keyword == null ? '' : String(keyword));
    const escape = function (s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const nm = String(name == null ? '' : name);
    if (!k) return escape(nm);

    const idx = nm.toLowerCase().indexOf(k.toLowerCase());
    if (idx < 0) return escape(nm);

    const before = nm.substring(0, idx);
    const mid = nm.substring(idx, idx + k.length);
    const after = nm.substring(idx + k.length);

    return escape(before) + '<span class="name-hit">' + escape(mid) + '</span>' + escape(after);
}