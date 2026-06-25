$(function () {
    loadSatScheduleList();
});

let satScheduleList = [];

//목록조회
function loadSatScheduleList() {
    const thisMonth = cmGetThisMonthRange('-');

    const data = {
        searchFromDate: thisMonth.from,
        searchToDate: cmGetToday('-')
    };

    cmAjax('/schedule/satScheduleList.do', 'GET', data, true).done(function (list) {
        satScheduleList = list || [];
        renderSatScheduleList();
    });
}

//목록렌더
function renderSatScheduleList() {
    if (!satScheduleList.length) {
        $('#sat-schedule-table').html(`
            <div class="sat-schedule-empty">목록이 없습니다.</div>
        `);
        return;
    }

    let html = `
        <div class="sat-schedule-table-wrap">
            <table class="sat-schedule-table">
                <thead>
                    <tr>
                        <th>날짜</th>
                        <th>요일</th>
                        <th>부서</th>
                        <th>이름</th>
                        <th>근무</th>
                        <th>출근</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < satScheduleList.length; i++) {
        html += getSatScheduleRowHtml(i);
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    $('#sat-schedule-table').html(html);
}

//row
function getSatScheduleRowHtml(index) {
    const row = satScheduleList[index];
    const dateChangeClass = index > 0 && satScheduleList[index - 1].guDate !== row.guDate ? ' class="date-change-row"' : '';

    let html = `<tr${dateChangeClass}>`;

    html += getSatScheduleMergeTd(index, ['guDate\'], \'guDate\', row.guDate);\n'+
    '    html += getSatScheduleMergeTd(index, [\'guDate'], 'ccDay', row.ccDay);
    html += getSatScheduleMergeTd(index, ['guDate', 'ccBuser'], 'ccBuser', row.ccBuser);

    html += `<td>${cmEscapeHtml(row.ccName)}</td>`;
    html += getSatScheduleMergeTd(index, ['guDate', 'ccBuser', 'guFlag'], 'guFlag', row.guFlag);
    html += `<td>${cmEscapeHtml(row.ccInTime)}</td>`;

    html += '</tr>';

    return html;
}

//병합 td
function getSatScheduleMergeTd(index, groupKeys, key, value) {
    if (index > 0 && isSameSatScheduleGroup(index - 1, index, groupKeys)) {
        return '';
    }

    const rowspan = getSatScheduleRowspan(index, groupKeys);

    return `<td rowspan="${rowspan}">${cmEscapeHtml(value)}</td>`;
}

//rowspan 계산
function getSatScheduleRowspan(index, groupKeys) {
    let rowspan = 1;

    for (let i = index + 1; i < satScheduleList.length; i++) {
        if (!isSameSatScheduleGroup(index, i, groupKeys)) {
            break;
        }

        rowspan++;
    }

    return rowspan;
}

//같은 그룹 여부
function isSameSatScheduleGroup(baseIndex, targetIndex, groupKeys) {
    for (let i = 0; i < groupKeys.length; i++) {
        if (satScheduleList[baseIndex][groupKeys[i]] !== satScheduleList[targetIndex][groupKeys[i]]) {
            return false;
        }
    }

    return true;
}