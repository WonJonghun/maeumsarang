$(function () {
    cmSetSelectOptions($('#selectBox1'), '문서종류',
        JSON.parse($('#approvalDocTypeJson').val())
    );

    loadApprovalList();

    // 상세 보기
    $(document).on('click', '#approvalList .approval-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        if (!detailDrawerShow) return;

        approvalDetail(this);
    });

    // 검색 버튼
    $('#topbarFilterSearch').on('click', function (e) {
        e.preventDefault();
        loadApprovalList();
    });

    // 텍스트 실시간 검색
    $('#searchKeyword').on('input', function () {
        filterApprovalList();
    });

    // 결재완료
    $(document).on('click', '#approvalSignBtn', function () {
        signApproval('11');
    });

    // 결재취소
    $(document).on('click', '#approvalCancelBtn', function () {
        signApproval('12');
    });
});

let approvalListAll = [];
let approvalDetailRow = null;

// 전자결재 목록 호출
function loadApprovalList() {
    const ccBaseKey = $.trim($('#baseKey').val() || '');

    if (ccBaseKey === 'PL') {
        const monthRange = cmGetThisMonthRange('-');

        $('#searchFromDate').val(monthRange.from);
        $('#searchToDate').val(monthRange.to);
    }

    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchId: $('#loginIcCode').val(),
        ccHomeFlag: $('#ccHomeFlag').val(),
        ccBaseKey: ccBaseKey,
        ccFlag: $('#selectBox1').val() || $('#ccFlag').val()
    };

    return cmAjax('/approval/selectApprovalList.do', 'GET', data, true).done(function (list) {
        approvalListAll = list || [];
        filterApprovalList();
    });
}

// 텍스트 검색
function filterApprovalList() {
    const keyword = $('#searchKeyword').val().toLowerCase();
    const filteredList = approvalListAll.filter(function (row) {
        return String(row.ccTitle || '').toLowerCase().indexOf(keyword) > -1;
    });

    renderApprovalList(filteredList, keyword ? '검색 결과가 없습니다.' : '문서가 없습니다.');
}

// 목록 그리기
function renderApprovalList(list, emptyText) {
    const approvalListEl = $('#approvalList');
    const ccBaseKey = $.trim($('#baseKey').val() || '');

    approvalListEl.empty();

    if (!list || list.length === 0) {
        approvalListEl.append($('<div/>', {
            class: 'approval-empty',
            text: emptyText || '문서가 없습니다.'
        }));
        return;
    }

    for (let i = 0; i < list.length; i++) {
        const row = list[i] || {};

        const title = $.trim(row.ccTitle || '');
        const ymd = String(row.ccDate || '').substring(0, 10);
        const day = String(row.ccDay || '').substring(0, 1);
        const team = $.trim(row.ccBuserNm || '');
        const fgNm = $.trim(row.ccFgNm || '');
        const fcNum = $.trim(row.fcNum || '');

        let subText;

        if (ccBaseKey === 'PL') {
            const place = $.trim(row.ccRMK || '');

            subText = [[ymd, day].filter(Boolean).join(' '), place, fgNm]
                .filter(Boolean)
                .join(' · ');
        } else {
            subText = [[ymd, day].filter(Boolean).join(' '), team, fgNm]
                .filter(Boolean)
                .join(' · ');
        }

        const isDone = Number(row.ccOK1 || 0) === 1;
        const statusText = isDone ? '결재완료' : '진행중';
        const statusCls = isDone ? 'text-green' : 'text-yellow';

        const rowEl = $('<div/>', {
            class: 'approval-row',
            'data-cc-code': row.ccCode || '',
            'data-fc-num': fcNum
        });

        rowEl.append($('<div/>', {
            class: 'approval-title',
            text: title
        }));

        rowEl.append(
            $('<div/>', { class: 'approval-sub' })
                .append($('<span/>', { class: 'approval-sub-text', text: subText }))
                .append($('<span/>', { class: 'approval-status ' + statusCls, text: statusText }))
        );

        approvalListEl.append(rowEl);
    }
}

// 상세 조회
function approvalDetail(rowEl) {
    const selRow = $(rowEl);
    const ccBaseKey = $.trim($('#baseKey').val() || '');

    if (!detailDrawerShow) return;

    const ccCode = $.trim(selRow.data('cc-code') || '');
    const row = (approvalListAll || []).find(function (x) {
        return String((x && x.ccCode) || '') === ccCode;
    }) || {};

    const title = $.trim(row.ccTitle || '');
    const ymd = String(row.ccDate || '').substring(0, 10);
    const day = String(row.ccDay || '').substring(0, 1);
    const team = $.trim(row.ccBuserNm || '');
    const fgNm = $.trim(row.ccFgNm || '');
    const ccFlag = $.trim(row.ccFlag || '');
    const fcNum = $.trim(selRow.data('fc-num') || row.fcNum || '');

    let subText;

    if (ccBaseKey === 'PL') {
        const place = $.trim(row.ccRMK || '');

        subText = [[ymd, day].filter(Boolean).join(' '), place, fgNm]
            .filter(Boolean)
            .join(' · ');
    } else {
        subText = [[ymd, day].filter(Boolean).join(' '), team, fgNm]
            .filter(Boolean)
            .join(' · ');
    }

    const isDone = Number(row.ccOK1 || 0) === 1;
    const statusText = isDone ? '결재완료' : '진행중';
    const statusCls = isDone ? 'text-green' : 'text-yellow';

    let headHtml = '';
    headHtml += '<div class="post-detail-head">';
    headHtml += '  <h3 class="post-detail-title">' + cmEscapeHtml(title) + '</h3>';
    headHtml += '  <div class="approval-detail-sub-line">';
    headHtml += '    <span class="approval-detail-sub-left">' + cmEscapeHtml(subText) + '</span>';
    headHtml += '    <span class="approval-status ' + cmEscapeHtml(statusCls) + '">' + cmEscapeHtml(statusText) + '</span>';
    headHtml += '  </div>';
    headHtml += '</div>';

    const data = {
        ccCode: ccCode,
        ccFlag: ccFlag,
        ymd: ymd,
        fcNum: fcNum,
        ccSeq: row.ccSeq
    };

    cmAjaxHtml('/approval/approvalDetail.do', 'GET', data, true).done(function (bodyHtml) {
        if (!bodyHtml) return;

        approvalDetailRow = row;
        detailDrawerShow(headHtml + bodyHtml + getApprovalActionHtml(row), true, row.ccImgNO);
    }).fail(function (xhr) {
        console.log('detail fail:', xhr);
        detailDrawerShow(headHtml + '<div style="padding:16px;">상세 조회 실패</div>', true);
    });
}

// 결재 버튼 HTML
function getApprovalActionHtml(row) {
    if (isMyApprovalTurn(row)) {
        return `
            <div class="approval-action-wrap">
                <button type="button" id="approvalSignBtn" class="approval-action-btn approval-sign-btn">결재완료</button>
            </div>
        `;
    }

    if (canCancelMyApproval(row)) {
        return `
            <div class="approval-action-wrap">
                <button type="button" id="approvalCancelBtn" class="approval-action-btn approval-cancel-btn">결재취소</button>
            </div>
        `;
    }

    return '';
}

// 내 결재 차례 여부
function isMyApprovalTurn(row) {
    const seq = getMySignSeq(row);

    if (seq < 1) return false;
    if (String(row.ccReSignDt || '') !== '') return false;
    if (Number(row['ccSignOK' + seq] || 0) === 1) return false;

    for (let i = 1; i < seq; i++) {
        if (Number(row['ccSignOK' + i] || 0) !== 1) return false;
    }

    return true;
}

// 내 결재취소 가능 여부
function canCancelMyApproval(row) {
    const seq = getMySignSeq(row);
    const signCnt = Number(row.ccSignCnt || 0);

    if (seq < 1) return false;
    if (Number(row['ccSignOK' + seq] || 0) !== 1) return false;

    if (seq < signCnt && Number(row['ccSignOK' + (seq + 1)] || 0) === 1) {
        return false;
    }

    return true;
}

// 내 결재 순번 찾기
function getMySignSeq(row) {
    const loginId = $.trim($('#loginIcCode').val() || '');

    for (let i = 1; i <= 8; i++) {
        if (getSignSaCd(row['ccSign' + i]) === loginId) {
            return i;
        }
    }

    return 0;
}

// 이미지번호 또는 사번에서 사번 추출
function getSignSaCd(value) {
    const signValue = $.trim(value || '');

    if (signValue.length > 6) {
        return signValue.substr(8, 10);
    }

    return signValue;
}

// 결재 처리
function signApproval(flag) {
    if (!approvalDetailRow) return;

    const msg = flag === '11' ? '결재 처리하시겠습니까?' : '결재취소 처리하시겠습니까?';

    customAlert('알림', msg, 'YN').then(function (ok) {
        if (!ok) return;

        cmAjax('/approval/signApproval.do', 'POST', {
            ccCode: approvalDetailRow.ccCode,
            flag: flag,
            rmk: ''
        }, true).done(function (res) {
            if (!res || res.success !== true) {
                customAlert('경고', (res && res.message) || '처리 실패', 'WARN').then(function () {
                    detailDrawerClose(true, true);
                    loadApprovalList();
                });
                return;
            }

            customAlert('알림', '처리되었습니다.', 'CONFIRM').then(function () {
                detailDrawerClose(true, true);
                reloadApprovalDetail();
            });
        });
    });
}

// 상세 새로고침
function reloadApprovalDetail() {
    const ccCode = approvalDetailRow.ccCode;

    loadApprovalList().done(function () {
        const row = approvalListAll.find(function (x) {
            return String(x.ccCode || '') === String(ccCode || '');
        });

        if (!row) {
            detailDrawerClose(true, true);
            return;
        }

        approvalDetailRow = row;

        const $rowEl = $('#approvalList .approval-row').filter(function () {
            return String($(this).data('cc-code') || '') === String(ccCode || '');
        }).first();

        if ($rowEl.length > 0) {
            approvalDetail($rowEl[0]);
        } else {
            detailDrawerClose(true, true);
        }
    });
}