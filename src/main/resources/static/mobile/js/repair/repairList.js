let repairList = [];
let currentRepairTab = 'all';

$(function () {
    loadRepairList();

    $(document).on('topbar:search', function () {
        loadRepairList();
    });

    $('.repair-tab').on('click', function () {
        $('.repair-tab').removeClass('active');
        $(this).addClass('active');

        currentRepairTab = String($(this).data('tab'));
        renderRepairList();
    });

    $(document).on('click', '#repairList .repair-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        if (!detailDrawerShow) return;

        repairDetail(this);
    });

    $(document).on('click', '#btnRepairSave', function () {
        saveRepairDetail();
    });
});

// 목록 리스트
function loadRepairList() {

    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchKeyword: $('#searchKeyword').val(),
        searchBuserCd: cmGetAdminYn($('#adminKey').val())
    };

    cmAjax('/repair/list.do', 'GET', data, true).done(function (list) {
        repairList = list || [];
        renderRepairList();
    });
}

// 목록 렌더
function renderRepairList() {
    const repairListEl = $('#repairList');
    repairListEl.empty();

    const list = repairList.filter(function (item) {
        if (currentRepairTab === 'all') return true;

        return getRepairStatusInfo(item.rpReFlag).code === Number(currentRepairTab);
    });

    if (list.length === 0) {
        repairListEl.html('<div class="repair-empty">수리신청이 없습니다.</div>');
        return;
    }

    for (let i = 0; i < list.length; i++) {
        const item = list[i];

        const title = $.trim(item.rpOrRemark);
        const isUrgent = Number(item.rpFlag) === 1;

        const dateTimeText = $.trim(item.rpDate)
            .replace('T', ' ').substring(0, 16).replace(/-/g, '.');

        const deptText = $.trim(item.buserNm);
        const nameText = $.trim(item.userNm);
        const statusInfo = getRepairStatusInfo(item.rpReFlag);

        const titleEl = $('<p/>', { class: 'repair-title' });

        if (isUrgent) {
            titleEl.append($('<span/>', { class: 'repair-urgent-label', text: '긴급' }));
        }

        titleEl.append($('<span/>', { class: 'repair-title-text', text: title }));

        const row = $('<div/>', { class: 'repair-row', role: 'button', tabindex: 0 })
            .data('rp-date', item.rpDate)
            .data('rp-number', item.rpNumber)
            .data('rp-flag', item.rpFlag)
            .data('rp-se-flag', item.rpSeFlag)
            .data('se-flag-nm', item.seFlagNm)
            .data('rp-buser', item.rpBuser)
            .data('buser-nm', item.buserNm)
            .data('rp-or-remark', item.rpOrRemark)
            .data('rp-sa-flag', item.rpSaFlag)
            .data('rp-user-id', item.rpUserId)
            .data('user-nm', item.userNm)
            .data('rp-sign1', item.rpSign1)
            .data('rp-re-user-id', item.rpReUserId)
            .data('re-user-nm', item.reUserNm)
            .data('rp-re-date', item.rpReDate)
            .data('rp-job-user-id', item.rpJobUserId)
            .data('job-user-nm', item.jobUserNm)
            .data('rp-re-remark', item.rpReRemark)
            .data('rp-re-flag', item.rpReFlag)
            .data('status-text', statusInfo.text)
            .data('status-class', statusInfo.className)
            .data('cc-re-flag', item.ccReFlag)
            .data('rp-ex-date', item.rpExDate)
            .data('rp-ex-user-id', item.rpExUserId)
            .data('rp-sign2', item.rpSign2)
            .data('rp-reg-date', item.rpRegDate)
            .data('rp-img-num', item.rpImgNum);

        if (isUrgent) row.addClass('is-urgent');

        row.append(
            $('<div/>', { class: 'repair-text' })
                .append(titleEl)
                .append(
                    $('<p/>', { class: 'repair-sub-title' })
                        .append($('<span/>', {
                            class: 'repair-sub-left',
                            text: dateTimeText + ' · ' + deptText + ' · ' + nameText
                        }))
                        .append($('<span/>', {
                            class: 'repair-status ' + statusInfo.className,
                            text: statusInfo.text
                        }))
                )
        );

        repairListEl.append(row);
    }
}

// 상세 조회
function repairDetail(rowEl) {
    const d = $(rowEl).data();
    const editable = cmGetAdminYn($('#adminKey').val()) === 'Y' && Number(d.rpReFlag || 1) === 1;

    const loginIcCode = $.trim($('#loginIcCode').val() || '');
    const loginName = $.trim($('.user-name').first().text() || '');

    const rpReUserId = $.trim(d.rpReUserId || '') || (editable ? loginIcCode : '');
    const rpJobUserId = $.trim(d.rpJobUserId || '') || (editable ? loginIcCode : '');
    const reUserNm = $.trim(d.reUserNm || '') || (editable ? loginName : '');
    const jobUserNm = $.trim(d.jobUserNm || '') || (editable ? loginName : '');

    const rawRpReRemark = d.rpReRemark == null ? '' : String(d.rpReRemark);
    const rpReRemark = $.trim(rawRpReRemark) === '' && editable ? getRepairDefaultRemark() : rawRpReRemark;

    const rpRegDate = d.rpRegDate || '';
    const dateText = d.rpDate ? cmFormatYmd(d.rpDate, '.') : '';
    const timeText = rpRegDate ? String(rpRegDate).replace('T', ' ').substring(11, 16) : '';
    const subLeftText = ((dateText && timeText) ? (dateText + ' ' + timeText + ' · ') : '') + $.trim(d.buserNm || '') + ' · ' + $.trim(d.userNm || '');

    const chk = function (v, target) {
        return Number(v || 0) === Number(target) ? ' checked' : '';
    };

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
    html += '    <div class="rd-label">접수직원</div>';
    html += '    <div class="rd-field">' + cmEscapeHtml(reUserNm) + '</div>';
    html += editable ? '    <input type="hidden" id="rpReUserId" value="' + cmEscapeHtml(rpReUserId) + '" />' : '';

    html += '    <div class="rd-label">처리예정일</div>';
    html += editable
        ? '    <input type="date" class="rd-input" id="rpReDateText" value="' + cmEscapeHtml(cmDateOnly(d.rpReDate || '')) + '" />'
        : '    <div class="rd-field">' + cmEscapeHtml(cmDateOnly(d.rpReDate || '')) + '</div>';

    html += '    <div class="rd-label">작업직원</div>';
    html += '    <div class="rd-field">' + cmEscapeHtml(jobUserNm) + '</div>';
    html += editable ? '    <input type="hidden" id="rpJobUserId" value="' + cmEscapeHtml(rpJobUserId) + '" />' : '';
    html += '  </div>';

    html += '  <div style="height:10px;"></div>';

    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label rd-text-label">작업내용</div>';
    html += editable
        ? '    <textarea class="rd-textarea" id="rpReRemark">' + cmEscapeHtml(rpReRemark) + '</textarea>'
        : '    <div class="rd-text-area">' + cmNl2br(rpReRemark) + '</div>';
    html += '  </div>';

    html += '  <div style="height:10px;"></div>';

    html += '  <div class="rd-grid">';
    html += '    <div class="rd-label">작업상태</div>';
    html += '    <div class="rd-span-3 rd-radio-1line' + (editable ? ' is-edit' : '') + '">';
    html += '      <label><input type="radio" name="rpReFlag" value="1"' + chk(d.rpReFlag, 1) + (editable ? '' : ' tabindex="-1"') + '><span class="text-yellow">진행중</span></label>';
    html += '      <label><input type="radio" name="rpReFlag" value="2"' + chk(d.rpReFlag, 2) + (editable ? '' : ' tabindex="-1"') + '><span class="text-green">처리완료</span></label>';
    html += '      <label><input type="radio" name="rpReFlag" value="3"' + chk(d.rpReFlag, 3) + (editable ? '' : ' tabindex="-1"') + '><span class="text-red">수리불가</span></label>';
    html += '      <label><input type="radio" name="rpReFlag" value="4"' + chk(d.rpReFlag, 4) + (editable ? '' : ' tabindex="-1"') + '><span class="text-blue">AS신청</span></label>';
    html += '    </div>';
    html += '  </div>';

    if (editable) {
        html += '  <div class="rd-action-wrap">';
        html += '    <button type="button" class="rd-save-btn" id="btnRepairSave" data-rp-date="' + cmEscapeHtml(cmDateOnly(d.rpDate || '')) + '" data-rp-number="' + cmEscapeHtml(d.rpNumber == null ? '' : String(d.rpNumber)) + '">저장</button>';
        html += '  </div>';
    }

    html += '</div>';

    detailDrawerShow(html, true);
}

// 상세 저장
function saveRepairDetail() {
    const data = {
        rpDate: $('#btnRepairSave').data('rp-date'),
        rpNumber: $('#btnRepairSave').data('rp-number'),
        rpReUserId: $('#rpReUserId').val(),
        rpReDateText: $('#rpReDateText').val(),
        rpJobUserId: $('#rpJobUserId').val(),
        rpReRemark: $('#rpReRemark').val(),
        rpReFlag: $('input[name="rpReFlag"]:checked').val()
    };

    if (!data.rpReFlag) {
        customAlert('알림', '작업상태를 선택하세요.', 'WARN');
        return;
    }

    customAlert('알림', '저장하시겠습니까?', 'YN').then(function (ok) {
        if (!ok) return;

        cmAjax('/repair/updateProcess.do', 'POST', data, true).done(function (res) {
            if (!res || !res.success) {
                customAlert('알림', (res && res.message) || '저장하지 못했습니다.', 'WARN');
                return;
            }

            customAlert('알림', '저장되었습니다.', 'CONFIRM').then(function () {
                loadRepairList();
                detailDrawerClose(true);
            });
        });
    });
}

// 작업상태
function getRepairStatusInfo(rpReFlag) {
    switch (Number(rpReFlag)) {
        case 2:
            return { code: 2, text: '처리완료', className: 'text-green' };
        case 3:
            return { code: 3, text: '수리불가', className: 'text-red' };
        case 4:
            return { code: 4, text: 'AS신청', className: 'text-blue' };
        case 1:
        default:
            return { code: 1, text: '진행중', className: 'text-yellow' };
    }
}

// 작업내용 기본값
function getRepairDefaultRemark() {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const dd = ('0' + d.getDate()).slice(-2);
    const hh = ('0' + d.getHours()).slice(-2);
    const mi = ('0' + d.getMinutes()).slice(-2);

    return yy + '/' + mm + '/' + dd + ' ' + hh + ':' + mi + '\n\n';
}