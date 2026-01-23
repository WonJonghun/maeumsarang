$(function () {
    // 초기 리스트 호출
    loadContactList();

    // 상단바 검색이벤트
    $(document).off('topbar:search.contactList').on('topbar:search.contactList', function (e, p) {
        contactFiltered(p && p.searchKeyword);
    });

    // 타이핑 즉시 필터링
    $('#searchKeyword').off('input.contactList').on('input.contactList', function () {
        contactFiltered($(this).val());
    });
});

let contactListAll = [];

// 직원연락처 리스트 호출
function loadContactList() {
    cmAjax('/contact/list.do', 'GET', { baseDt: cmGetToday('-') }, true).done(function (list) {
        contactListAll = list || [];
        renderContactList(contactListAll);
    });
}

//검색어 필터
function contactFiltered(keyword) {
    const k = $.trim(keyword || '');
    if (!k) {
        renderContactList(contactListAll);
        return;
    }

    const lk = k.toLowerCase();
    const lkNum = lk.replace(/[^0-9]/g, ''); // 전화번호용(하이픈/공백 제거)

    const filtered = (contactListAll || []).filter(function (row) {
        row = row || {};
        const dept = row.icBuserNm || '';
        const rank = row.icJik3 || row.icJikgub || '';
        const name = row.icName || '';
        const hp = row.icHPphone || '';
        const sa = row.icSaphone || '';

        const text = (dept + ' ' + rank + ' ' + name + ' ' + hp + ' ' + sa).toLowerCase();
        if (text.indexOf(lk) > -1) return true;

        if (lkNum) {
            const hpNum = (hp || '').replace(/[^0-9]/g, '');
            const saNum = (sa || '').replace(/[^0-9]/g, '');
            return (hpNum.indexOf(lkNum) > -1) || (saNum.indexOf(lkNum) > -1);
        }
        return false;
    });

    filtered.sort(function (a, b) {
        const aDept = (a && a.icBuserNm) || '';
        const bDept = (b && b.icBuserNm) || '';
        if (aDept !== bDept) return aDept.localeCompare(bDept);

        const aRank = (a && (a.icJik3 || a.icJikgub)) || '';
        const bRank = (b && (b.icJik3 || b.icJikgub)) || '';
        if (aRank !== bRank) return aRank.localeCompare(bRank);

        const aName = (a && a.icName) || '';
        const bName = (b && b.icName) || '';
        return aName.localeCompare(bName);
    });

    renderContactList(filtered);
}


//테이블 그리기
function renderContactList(list) {
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

    if (!list.length) {
        html += '<tr><td colspan="5">검색 결과가 없습니다.</td></tr>';
        html += '  </tbody></table>';
        $('#contactList').html(html);
        return;
    }

    for (let i = 0; i < list.length; ) {
        const dept = list[i].icBuserNm || '';
        let deptSpan = 1;
        while (i + deptSpan < list.length && (list[i + deptSpan].icBuserNm || '') === dept) deptSpan++;

        const deptLastIdx = i + deptSpan - 1;

        for (let j = i; j < i + deptSpan; ) {
            const rank = list[j].icJik3 || list[j].icJikgub || '';
            let rankSpan = 1;
            while (j + rankSpan < i + deptSpan) {
                const nextRank = list[j + rankSpan].icJik3 || list[j + rankSpan].icJikgub || '';
                if (nextRank !== rank) break;
                rankSpan++;
            }

            const rankLastIdx = j + rankSpan - 1;
            const isRankToDeptEnd = (rankLastIdx === deptLastIdx);

            for (let r = 0; r < rankSpan; r++) {
                const rowIdx = j + r;
                const row = list[rowIdx] || {};
                const trClass = (rowIdx === deptLastIdx ? ' class="dept-end"' : '');
                const hp = row.icHPphone || '';
                const hpTel = (hp || '').replace(/[^0-9+]/g, '');

                html += '<tr' + trClass + '>'
                    + (j === i && r === 0
                        ? '<td class="group-cell dept-cell" rowspan="' + deptSpan + '">' + cmEscapeHtml(dept) + '</td>'
                        : '')
                    + (r === 0
                        ? '<td class="group-cell' + (isRankToDeptEnd ? ' dept-end-span' : '') + '" rowspan="' + rankSpan + '">' + cmEscapeHtml(rank) + '</td>'
                        : '')
                    + '<td>' + cmEscapeHtml(row.icName || '') + '</td>'
                    + '<td>'
                    + (hpTel ? ('<a class="tel-link" href="tel:' + hpTel + '">' + cmEscapeHtml(hp) + '</a>') : cmEscapeHtml(hp))
                    + '</td>'
                    + '<td>' + cmEscapeHtml(row.icSaphone || '') + '</td>'
                    + '</tr>';
            }
            j += rankSpan;
        }
        i += deptSpan;
    }

    html += '  </tbody></table>';
    $('#contactList').html(html);
}
