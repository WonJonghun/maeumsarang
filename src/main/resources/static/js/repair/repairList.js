$(function () {

    // 초기 리스트 호출
    loadRepairList();

    // 검색 시
    $(document).on('topbar:search', function () {
        loadRepairList();
    });

    // 상세 보기
    $(document).on('click', '#repairList .repair-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        if (!window.detailDrawerShow) return;

        repairDetail(this);
    });
});

// 목록 리스트
function loadRepairList() {

    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchKeyword: $('#searchKeyword').val(),
        searchBuserCd: cmGetSearchBuserCd($('#adminKey').val())
    };

    cmAjax('/repair/list.do', 'GET', data, true).done(function (list) {
        const repairListEl = $('#repairList');
        repairListEl.empty();

        if (!list || list.length === 0) {
            repairListEl.html('<div class="repair-empty">수리신청이 없습니다.</div>');
            return;
        }

        for (let i = 0; i < list.length; i++) {
            const item = list[i];

            const title = $.trim(item.rpOrRemark);

            const dateTimeText = $.trim(item.rpDate)
                .replace('T', ' ').substring(0, 16).replace(/-/g, '.');

            const deptText = $.trim(item.buserNm);
            const nameText = $.trim(item.userNm);

            let statusText = '진행중';
            let statusClass = 'text-yellow';

            switch (Number(item.rpReFlag)) {
                case 1: statusText = '진행중'; statusClass = 'text-yellow'; break;
                case 2: statusText = '수리완료'; statusClass = 'text-green'; break;
                case 3: statusText = '수리불가'; statusClass = 'text-red'; break;
                case 4: statusText = 'AS신청'; statusClass = 'text-green'; break;
                default: statusText = '진행중'; statusClass = 'text-yellow'; break;
            }

            const row = $('<div/>', { class: 'repair-row', role: 'button', tabindex: 0 })
                .data('rp-date', item.rpDate)            // 신청일
                .data('rp-number', item.rpNumber)        // 일련번호
                .data('rp-flag', item.rpFlag)            // 긴급구분
                .data('rp-se-flag', item.rpSeFlag)       // 수리구분코드
                .data('se-flag-nm', item.seFlagNm)       // 수리구분명
                .data('rp-buser', item.rpBuser)          // 부서코드
                .data('buser-nm', item.buserNm)          // 부서명
                .data('rp-or-remark', item.rpOrRemark)   // 신청내용
                .data('rp-sa-flag', item.rpSaFlag)       // 파손경위
                .data('rp-user-id', item.rpUserId)       // 신청자ID
                .data('user-nm', item.userNm)            // 신청자명
                .data('rp-sign1', item.rpSign1)
                .data('rp-re-user-id', item.rpReUserId)  // 접수자ID
                .data('re-user-nm', item.reUserNm)       // 접수자명
                .data('rp-re-date', item.rpReDate)       // 처리일
                .data('rp-job-user-id', item.rpJobUserId)// 작업자ID
                .data('job-user-nm', item.jobUserNm)     // 작업자명
                .data('rp-re-remark', item.rpReRemark)   // 처리내용
                .data('rp-re-flag', item.rpReFlag)       // 작업상태
                .data('status-text', statusText)         // 작업상태명
                .data('status-class', statusClass)       // 작업상태 색상
                .data('cc-re-flag', item.ccReFlag)
                .data('rp-ex-date', item.rpExDate)
                .data('rp-ex-user-id', item.rpExUserId)
                .data('rp-sign2', item.rpSign2)
                .data('rp-reg-date', item.rpRegDate)     // 등록일시
                .data('rp-img-num', item.rpImgNum);

            if (Number(item.rpFlag) === 1) row.addClass('is-urgent'); // 긴급

            row.append(
                $('<div/>', { class: 'repair-text' })
                    .append($('<p/>', { class: 'repair-title', text: title }))
                    .append(
                        $('<p/>', { class: 'repair-sub-title' })
                            .append($('<span/>', { class: 'repair-sub-left', text: dateTimeText + ' · ' + deptText + ' · ' + nameText }))
                            .append($('<span/>', { class: 'repair-status ' + statusClass, text: statusText }))
                    )
            );
            repairListEl.append(row);
        }
    });
}

// 상세 조회 (기존 그대로)
function repairDetail(rowEl) {
    const d = $(rowEl).data();

    const rpRegDate = d.rpRegDate || '';
    const dateText = d.rpDate ? cmFormatYmd(d.rpDate, '.') : '';
    const timeText = rpRegDate ? String(rpRegDate).replace('T', ' ').substring(11, 16) : '';
    const subLeftText = ((dateText && timeText) ? (dateText + ' ' + timeText + ' · ') : '') + $.trim(d.buserNm || '') + ' · ' + $.trim(d.userNm || '');

    const chk = function (v, target) { return (Number(v || 0) === Number(target)) ? ' checked' : ''; };

    let html = '';
    html += '<div class="rd-head">';
    html += '  <h3 class="rd-title">' + cmEscapeHtml(d.rpOrRemark || '수리신청 상세') + '</h3>';
    html += '  <div class="rd-sub-line">';
    html += '    <span class="rd-sub-left">' + cmEscapeHtml(subLeftText) + '</span>';
    html += '    <span class="rd-status-chip ' + cmEscapeHtml(d.statusClass || '') + '">' + cmEscapeHtml(d.statusText || '') + '</span>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="repair-detail-wrap">';

    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label">신청일자</div><div class="rd-field">' + cmEscapeHtml(cmDateOnly(d.rpDate || '')) + '</div>';
    html += '    <div class="rd-label">신청번호</div><div class="rd-field">' + cmEscapeHtml(d.rpNumber == null ? '' : String(d.rpNumber)) + '</div>';
    html += '    <div class="rd-label">수리종류</div><div class="rd-field">' + cmEscapeHtml($.trim(d.seFlagNm || '')) + '</div>';
    html += '    <div class="rd-label">신청직원</div><div class="rd-field">' + cmEscapeHtml($.trim(d.userNm || '')) + '</div>';
    html += '    <div class="rd-label">신청부서</div><div class="rd-field">' + cmEscapeHtml($.trim(d.buserNm || '')) + '</div>';
    html += '    <div class="rd-label">신청시간</div><div class="rd-field">' + cmEscapeHtml(timeText) + '</div>';
    html += '  </div>';

    html += '  <div style="height:10px;"></div>';
    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label">긴급구분</div>';
    html += '    <div class="rd-span-3 rd-radio-3col">';
    html += '      <label style="color: var(--red-e11d48);"><input type="radio"' + chk(d.rpFlag, 1) + ' tabindex="-1">긴급</label>';
    html += '      <label><input type="radio"' + chk(d.rpFlag, 2) + ' tabindex="-1">보통</label>';
    html += '      <span></span>';
    html += '    </div>';
    html += '    <div class="rd-label">파손경위</div>';
    html += '    <div class="rd-span-3 rd-radio-3col">';
    html += '      <label><input type="radio"' + chk(d.rpSaFlag, 1) + ' tabindex="-1">사용중</label>';
    html += '      <label><input type="radio"' + chk(d.rpSaFlag, 2) + ' tabindex="-1">환자가</label>';
    html += '      <label><input type="radio"' + chk(d.rpSaFlag, 3) + ' tabindex="-1">부주의</label>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div style="height:10px;"></div>';
    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label rd-text-label">수리내용<br/>(세부내용)</div>';
    html += '    <div class="rd-text-area">' + cmNl2br(d.rpOrRemark || '') + '</div>';
    html += '  </div>';

    html += '  <div class="rd-divider"></div>';

    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label">접수직원</div><div class="rd-field">' + cmEscapeHtml($.trim(d.reUserNm || '')) + '</div>';
    html += '    <div class="rd-label">처리예정일</div><div class="rd-field">' + cmEscapeHtml(cmDateOnly(d.rpReDate || '')) + '</div>';
    html += '    <div class="rd-label">작업직원</div><div class="rd-field">' + cmEscapeHtml($.trim(d.jobUserNm || '')) + '</div>';
    html += '  </div>';

    html += '  <div style="height:10px;"></div>';
    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label rd-text-label">작업내용</div>';
    html += '    <div class="rd-text-area">' + cmNl2br(d.rpReRemark || '') + '</div>';
    html += '  </div>';

    html += '  <div style="height:10px;"></div>';
    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label">작업상태</div>';
    html += '    <div class="rd-span-3 rd-radio-1line">';
    html += '      <label><input type="radio"' + chk(d.rpReFlag, 1) + ' tabindex="-1"><span class="text-yellow">진행중</span></label>';
    html += '      <label><input type="radio"' + chk(d.rpReFlag, 2) + ' tabindex="-1"><span class="text-green">수리완료</span></label>';
    html += '      <label><input type="radio"' + chk(d.rpReFlag, 3) + ' tabindex="-1"><span class="text-red">수리불가</span></label>';
    html += '      <label><input type="radio"' + chk(d.rpReFlag, 4) + ' tabindex="-1"><span class="text-green">AS신청</span></label>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div class="rd-divider"></div>';

    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label">담당팀장</div><div class="rd-field">' + cmEscapeHtml($.trim(d.rpSign1 || '')) + '</div>';
    html += '    <div class="rd-label">작업종료</div><div class="rd-field">' + cmEscapeHtml(cmDateOnly(d.rpExDate || '')) + '</div>';
    html += '    <div class="rd-label">작업확인</div><div class="rd-field">' + cmEscapeHtml($.trim(d.rpSign2 || '')) + '</div>';
    html += '  </div>';

    html += '</div>';

    detailDrawerShow(html, true);
}
