$(function () {
    // 초기 리스트 호출
    loadContactList();
});

// 직원연락처 리스트 호출
function loadContactList() {

    cmAjax('/contact/list.do', 'GET', { baseDt: cmGetToday('-') }, true).done(function (list) {

        list = list || [];

        let html = ''
            + '<table class="contact-table">'
            + '  <thead>'
            + '    <tr>'
            + '      <th>부서명</th>'
            + '      <th>직급명</th>'
            + '      <th>이름</th>'
            + '      <th>휴대폰번호</th>'
            + '      <th>직통번호</th>'
            + '    </tr>'
            + '  </thead>'
            + '  <tbody>';

        //셀 병합
        for (let i = 0; i < list.length; ) {
            const dept = list[i].icBuserNm || '';
            let deptSpan = 1;
            while (i + deptSpan < list.length && (list[i + deptSpan].icBuserNm || '') === dept) deptSpan++;

            for (let j = i; j < i + deptSpan; ) {
                const rank = list[j].icJik3 || list[j].icJikgub || '';
                let rankSpan = 1;
                while (j + rankSpan < i + deptSpan) {
                    const nextRank = list[j + rankSpan].icJik3 || list[j + rankSpan].icJikgub || '';
                    if (nextRank !== rank) break;
                    rankSpan++;
                }

                for (let r = 0; r < rankSpan; r++) {
                    const row = list[j + r] || {};
                    html += '<tr>'
                        + (j === i && r === 0 ? '<td rowspan="' + deptSpan + '">' + cmEscapeHtml(dept) + '</td>' : '')
                        + (r === 0 ? '<td rowspan="' + rankSpan + '">' + cmEscapeHtml(rank) + '</td>' : '')
                        + '<td>' + cmEscapeHtml(row.icName || '') + '</td>'
                        + '<td>' + cmEscapeHtml(row.icHPphone || '') + '</td>'
                        + '<td>' + cmEscapeHtml(row.icSaphone || '') + '</td>'
                        + '</tr>';
                }
                j += rankSpan;
            }
            i += deptSpan;
        }

        html += '  </tbody></table>';
        $('#contactList').html(html);
    });
}