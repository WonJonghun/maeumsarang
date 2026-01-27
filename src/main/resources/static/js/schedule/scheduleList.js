$(function () {
    // 초기화
    const now = new Date();
    setYmToInput(now.getFullYear(), now.getMonth() + 1);

    // 최초리스트 호출
    loadScheduleList();

    // 이벤트 바인딩
    bindEvents();
});

function bindEvents() {
    // 검색
    $(document).off('topbar:search.schedule').on('topbar:search.schedule', function (e, p) {
        const kw = $.trim((p && p.searchKeyword) || $('#searchKeyword').val() || '');
        scheduleFiltered(kw);
    });

    // 이전/다음 달
    $('#btnYmPrev').off('click.scheduleYmPrev').on('click.scheduleYmPrev', function () {
        moveYm(-1);
    });

    $('#btnYmNext').off('click.scheduleYmNext').on('click.scheduleYmNext', function () {
        moveYm(1);
    });

    // YYYY-MM 입력 숫자만
    $(document).off('input.scheduleYm').on('input.scheduleYm', '#scheduleYm', function () {
        const raw = String($(this).val() || '');
        $(this).val(formatYmTyping(raw));
    });

    // 입력 유효하면 조회, 아니면 원복
    $(document).off('blur.scheduleYm').on('blur.scheduleYm', '#scheduleYm', function () {
        commitYmAndLoad();
    });

    $(document).off('keydown.scheduleYmEnter').on('keydown.scheduleYmEnter', '#scheduleYm', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        commitYmAndLoad();
    });

    $(document).off('change.scheduleYm').on('change.scheduleYm', '#scheduleYm', function () {
        commitYmAndLoad();
    });

    // 셀 클릭
    $('#scheduleList').off('click.scheduleCell').on('click.scheduleCell', '.schedule-table tbody td.click-row', function () {
        selectScheduleCell($(this));
    });
}

function moveYm(offsetMonth) {
    const cur = getYmFromInputOrStateOrNow();
    const dt = new Date(cur.year, cur.month - 1 + Number(offsetMonth || 0), 1); // overflow 처리
    setYmToInput(dt.getFullYear(), dt.getMonth() + 1);
    loadScheduleList();
}

function setYmToInput(year, month) {
    const dt = new Date(Number(year), Number(month) - 1, 1);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;

    const ymVal = String(y) + '-' + String(m).padStart(2, '0');
    $('#scheduleYm').val(ymVal);

    scheduleState.year = y;
    scheduleState.month = m;
}

function getYmFromInputOrStateOrNow() {
    const v = $.trim($('#scheduleYm').val() || '');
    const parsed = parseYmStrict(v);
    if (parsed.ok) return { year: parsed.year, month: parsed.month };

    if (scheduleState.year && scheduleState.month) return { year: scheduleState.year, month: scheduleState.month };

    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function commitYmAndLoad() {
    const v = $.trim($('#scheduleYm').val() || '');
    const parsed = parseYmStrict(v);

    if (!parsed.ok) {
        const cur = getYmFromInputOrStateOrNow();
        setYmToInput(cur.year, cur.month);
        return;
    }

    setYmToInput(parsed.year, parsed.month);
    loadScheduleList();
}

// 타이핑 중 보정, 숫자만 뽑아서 YYYY-MM 형태로
function formatYmTyping(raw) {
    const digits = String(raw || '').replace(/[^\d]/g, '').substring(0, 6);
    if (digits.length <= 4) return digits;
    return digits.substring(0, 4) + '-' + digits.substring(4);
}

// YYYY-MM  파싱
function parseYmStrict(v) {
    const s = $.trim(String(v || ''));
    const m = /^(\d{4})-(\d{2})$/.exec(s);
    if (!m) return { ok: false };

    const year = Number(m[1]);
    const month = Number(m[2]);
    if (!year || month < 1 || month > 12) return { ok: false };

    return { ok: true, year: year, month: month };
}

//내 사번 선택되게
function selectScheduleCell(td) {
    const wrapEl = $('#scheduleList');
    const tr = td.closest('tr');

    wrapEl.find('.schedule-table tbody tr.row-selected').removeClass('row-selected');
    wrapEl.find('.schedule-table tbody td.cell-selected').removeClass('cell-selected');

    tr.addClass('row-selected');
    td.addClass('cell-selected');
}

const scheduleState = {
    year: 0,
    month: 0,
    dayCount: 0,
    dataList: [],
    holidayList: []
};

//조회
function loadScheduleList() {
    const baseKey = $.trim($('#baseKey').val() || '');

    const ym = getYmFromInputOrStateOrNow();
    setYmToInput(ym.year, ym.month);

    const yearStr = String(scheduleState.year);
    const monthStr = String(scheduleState.month).padStart(2, '0');
    const baseDt = yearStr + '-' + monthStr + '-01';

    //근무표
    cmAjax('/schedule/scheduleList.do', 'GET', { flagCd: baseKey, baseDt: baseDt }).done(function (scheduleData) {
        const tmp1 = (scheduleData && scheduleData.list) ? scheduleData.list : scheduleData;
        const dataList = $.isArray(tmp1) ? tmp1 : [];

        //휴일
        cmAjax('/schedule/holidayList.do', 'GET', { year: yearStr, month: monthStr, ccWeekendCd: 0 }).done(function (holidayData) {
            const tmp2 = (holidayData && holidayData.list) ? holidayData.list : holidayData;
            const holidayList = $.isArray(tmp2) ? tmp2 : [];

            scheduleState.dataList = dataList;
            scheduleState.holidayList = holidayList;

            const kw = $.trim($('#searchKeyword').val() || '');
            scheduleFiltered(kw);
        }).fail(function () {
            scheduleState.dataList = dataList;
            scheduleState.holidayList = [];

            const kw = $.trim($('#searchKeyword').val() || '');
            scheduleFiltered(kw);
        });
    }).fail(function () {
        $('#scheduleList').empty().append($('<div/>', { class: 'schedule-error', text: '스케줄 조회에 실패했습니다.' }));
    });
}

//검색
function scheduleFiltered(keyword) {
    const kw = $.trim(keyword || '');
    const src = scheduleState.dataList || [];

    if (!kw) {
        renderScheduleTable(src, scheduleState.holidayList || [], scheduleState.year, scheduleState.month);
        return;
    }

    const k = kw.toLowerCase();
    const filtered = [];

    for (let i = 0; i < src.length; i++) {
        const it = src[i] || {};
        const name = $.trim((it.icName || '') + '').toLowerCase();
        const dept = $.trim((it.icBuserNm || '') + '').toLowerCase();
        const rank = $.trim((it.icJikgubNm || '') + '').toLowerCase();

        if (name.indexOf(k) >= 0 || dept.indexOf(k) >= 0 || rank.indexOf(k) >= 0) {
            filtered.push(it);
        }
    }
    renderScheduleTable(filtered, scheduleState.holidayList || [], scheduleState.year, scheduleState.month);
}

//근무표 구현
function renderScheduleTable(dataList, holidayList, year, month) {
    const now = new Date();
    const isThisMonth = (year === now.getFullYear() && month === (now.getMonth() + 1));
    const todayD = now.getDate();

    const dowMap = ['일', '월', '화', '수', '목', '금', '토'];
    const offMap = holidayMap(holidayList, year, month);

    let dayCount = new Date(year, month, 0).getDate();
    if (dataList.length && (dataList[0].flag != null || dataList[0].Flag != null)) {
        const f = Number(dataList[0].flag != null ? dataList[0].flag : dataList[0].Flag);
        if (!isNaN(f) && f > 0 && f <= 31) dayCount = f;
    }
    scheduleState.dayCount = dayCount;

    const deptColorMap = {};
    let deptColorIdx = 0;
    for (let x = 0; x < dataList.length; x++) {
        const deptNm = $.trim((dataList[x].icBuserNm || '') + '');
        if (deptNm && deptColorMap[deptNm] == null) {
            deptColorMap[deptNm] = deptColorIdx % 9;
            deptColorIdx++;
        }
    }

    const wrapEl = $('#scheduleList');
    const tableEl = $('<table/>', { class: 'schedule-table' });

    const colgroupEl = $('<colgroup/>')
        .append($('<col/>', { class: 'col-dept' }))
        .append($('<col/>', { class: 'col-rank' }))
        .append($('<col/>', { class: 'col-name' }));
    for (let d = 1; d <= dayCount; d++) colgroupEl.append($('<col/>', { class: 'col-day' }));
    tableEl.append(colgroupEl);

    const theadEl = $('<thead/>');
    const tr0El = $('<tr/>');
    const tr1El = $('<tr/>');
    const tr2El = $('<tr/>');

    tr0El.append($('<th/>', { text: '부서', rowspan: 3 }));
    tr0El.append($('<th/>', { text: '직급', rowspan: 3 }));
    tr0El.append($('<th/>', { text: '성명', rowspan: 3, class: 'sticky-name' }));

    for (let d = 1; d <= dayCount; d++) {
        const dow = new Date(year, month - 1, d).getDay();
        const isSat = (dow === 6);
        const isSun = (dow === 0);

        const holidayNm = $.trim((offMap.publicNameByDay[d] || '') + '');
        const offLabel = holidayNm ? '공휴' : ((isSat || isSun) ? '주말' : '');

        const dayBaseCls = ((isSat ? ' day-sat' : '') + (isSun ? ' day-sun' : '') + (holidayNm ? ' day-holiday' : '')).trim();
        const todayCls = (isThisMonth && d === todayD) ? ' col-today' : '';

        tr0El.append($('<th/>', {
            text: offLabel,
            class: ('th-off ' + dayBaseCls + todayCls).trim(),
            title: holidayNm ? holidayNm : ''
        }));
        tr1El.append($('<th/>', { text: String(d), class: ('th-day ' + dayBaseCls + todayCls).trim() }));
        tr2El.append($('<th/>', { text: dowMap[dow], class: ('th-dow ' + dayBaseCls + todayCls).trim() }));
    }

    theadEl.append(tr0El).append(tr1El).append(tr2El);
    tableEl.append(theadEl);

    //tbody
    const tbodyEl = $('<tbody/>');

    if (!dataList.length) {
        customAlert('경고', '조회 결과가 없습니다.', 'WARN');
        tbodyEl.append(
            $('<tr/>').append(
                $('<td/>', { colspan: 3 + dayCount, class: 'td-empty', text: '조회 결과가 없습니다.' })
            )
        );
    } else {
        let i = 0;
        while (i < dataList.length) {
            const deptNm = $.trim((dataList[i].icBuserNm || '') + '');
            const deptClass = 'dept-bg-' + (deptColorMap[deptNm] == null ? 0 : deptColorMap[deptNm]);

            let deptEnd = i;
            while (deptEnd < dataList.length) {
                const curDept = $.trim((dataList[deptEnd].icBuserNm || '') + '');
                if (curDept !== deptNm) break;
                deptEnd++;
            }
            const deptRowspan = deptEnd - i;

            let j = i;
            let deptFirstRow = true;

            while (j < deptEnd) {
                const rankNm = $.trim((dataList[j].icJikgubNm || '') + '');

                let rankEnd = j;
                while (rankEnd < deptEnd) {
                    const curRank = $.trim((dataList[rankEnd].icJikgubNm || '') + '');
                    if (curRank !== rankNm) break;
                    rankEnd++;
                }
                const rankRowspan = rankEnd - j;

                let rankFirstRow = true;

                for (let k = j; k < rankEnd; k++) {
                    const item = dataList[k];
                    const trEl = $('<tr/>', { class: deptClass });
                    trEl.attr('data-ic-code', $.trim((item.icCode || '') + ''));
                    if (deptFirstRow) trEl.addClass('dept-start');

                    if (deptFirstRow) {
                        trEl.append($('<td/>', { class: 'td-left td-dept', rowspan: deptRowspan, text: deptNm }));
                        deptFirstRow = false;
                    }

                    if (rankFirstRow) {
                        trEl.append($('<td/>', { class: 'td-left td-rank', rowspan: rankRowspan, text: rankNm }));
                        rankFirstRow = false;
                    }

                    trEl.append($('<td/>', {
                        class: 'td-left td-name sticky-name click-row',
                        text: $.trim((item.icName || '') + '')
                    }));

                    for (let d = 1; d <= dayCount; d++) {
                        const dow = new Date(year, month - 1, d).getDay();
                        const isSat = (dow === 6);
                        const isSun = (dow === 0);
                        const isHoliday = !!$.trim((offMap.publicNameByDay[d] || '') + '');

                        const dayBaseCls = ((isSat ? ' day-sat' : '') + (isSun ? ' day-sun' : '') + (isHoliday ? ' day-holiday' : '')).trim();
                        const todayCls = (isThisMonth && d === todayD) ? ' col-today' : '';

                        const v = item['a' + d] == null ? '' : String(item['a' + d]);
                        const t = $.trim(v);
                        let dutyCls = '';

                        if (t) {
                            const c = t.charAt(0).toUpperCase();
                            dutyCls = (c === 'D') ? 'duty-d' : (c === 'N') ? 'duty-n' : (c === 'E') ? 'duty-e' : 'duty-etc';
                        }

                        trEl.append($('<td/>', {
                            class: ('td-day click-row ' + dayBaseCls + todayCls + (dutyCls ? ' ' + dutyCls : '')).trim(),
                            text: v
                        }));
                    }

                    tbodyEl.append(trEl);
                }

                j = rankEnd;
            }

            i = deptEnd;
        }
    }

    tableEl.append(tbodyEl);
    wrapEl.empty().append(tableEl);
    tableEl.css('--sticky-name-left', '0px');

    selectMyRow();
    focusTodayColumn(year, month);
}

//공휴
function holidayMap(list, year, month) {
    const publicNameByDay = {};
    const y = String(year);
    const m = String(month).padStart(2, '0');

    for (let i = 0; i < (list || []).length; i++) {
        const item = list[i] || {};
        const nm = $.trim((item.ccOffNm || '') + '');
        if (!nm) continue;

        if (nm === '토요일' || nm === '일요일' || nm === '토' || nm === '일' || nm === '주말') continue;

        const dtRaw = (item.ccDt == null ? '' : String(item.ccDt));
        const digits = dtRaw.replace(/\D/g, '');
        if (digits.length < 8) continue;

        const yy = digits.substring(0, 4);
        const mm = digits.substring(4, 6);
        const dd = digits.substring(6, 8);

        if (yy !== y || mm !== m) continue;

        const dayNo = Number(dd);
        if (!dayNo || dayNo < 1 || dayNo > 31) continue;

        if (publicNameByDay[dayNo]) {
            if (publicNameByDay[dayNo].indexOf(nm) < 0) publicNameByDay[dayNo] = publicNameByDay[dayNo] + '/' + nm;
        } else {
            publicNameByDay[dayNo] = nm;
        }
    }

    return { publicNameByDay: publicNameByDay };
}

//내사번 찾기
function selectMyRow() {
    const myCode = $.trim($('#loginIcCode').val() || '');
    if (!myCode) return;

    const tableEl = $('#scheduleList').find('.schedule-table');
    if (!tableEl.length) return;

    const myTr = tableEl.find('tbody tr').filter(function () {
        return $.trim(($(this).attr('data-ic-code') || '') + '') === myCode;
    }).first();

    if (!myTr.length) return;

    const myTd = myTr.find('td.td-name.click-row').first();
    if (!myTd.length) return;

    selectScheduleCell(myTd);
}

// 오늘날짜 포커스 + 내 사번 로우 포커스
function focusTodayColumn(year, month) {
    const now = new Date();
    const isThisMonth = (year === now.getFullYear() && month === (now.getMonth() + 1));
    if (!isThisMonth) return;

    const wrapEl = $('#scheduleList');
    if (!wrapEl.length) return;

    const tableEl = wrapEl.find('.schedule-table');
    if (!tableEl.length) return;

    const targetTh = tableEl.find('thead tr:nth-child(2) th.col-today').first();
    if (!targetTh.length) return;

    if (!targetTh.attr('tabindex')) targetTh.attr('tabindex', '-1');

    const wrapDom = wrapEl.get(0);
    const tableDom = tableEl.get(0);
    const targetDom = targetTh.get(0);
    if (!wrapDom || !tableDom || !targetDom) return;

    const wrapOffset = wrapEl.offset();
    const targetOffset = targetTh.offset();
    if (!wrapOffset || !targetOffset) return;

    const currentLeft = wrapDom.scrollLeft;
    const targetLeftInWrap = targetOffset.left - wrapOffset.left + currentLeft;

    const wrapW = wrapDom.clientWidth || wrapEl.width() || 0;
    const targetW = targetTh.outerWidth() || 0;
    const desiredLeft = targetLeftInWrap - Math.max(0, (wrapW - targetW) / 2);
    const maxLeft = Math.max(0, (tableDom.scrollWidth || tableEl.outerWidth() || 0) - wrapW);
    wrapDom.scrollLeft = Math.max(0, Math.min(maxLeft, desiredLeft));

    const myTr = tableEl.find('tbody tr.row-selected').first();
    if (myTr.length) {
        if (!myTr.attr('tabindex')) myTr.attr('tabindex', '-1');

        const trDom = myTr.get(0);
        const wrapH = wrapDom.clientHeight || wrapEl.height() || 0;

        const trTop = trDom.offsetTop;
        const trH = trDom.offsetHeight;

        const desiredTop = Math.max(0, trTop - Math.max(0, (wrapH - trH) / 2));
        const maxTop = Math.max(0, (wrapDom.scrollHeight || 0) - wrapH);
        wrapDom.scrollTop = Math.min(maxTop, desiredTop);

        try { trDom.focus({ preventScroll: true }); } catch (e) { trDom.focus(); }
        return;
    }

    try { targetDom.focus({ preventScroll: true }); } catch (e) { targetDom.focus(); }
}
