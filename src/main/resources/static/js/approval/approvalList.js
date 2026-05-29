$(function () {
    if ($('#selectBox1').length > 0) {
        cmSetSelectOptions($('#selectBox1'), '문서종류',
            JSON.parse($('#approvalDocTypeJson').val())
        );
    }

    initApprovalSearchDate();
    setApprovalPaperTab();
    loadApprovalList();

    // 상단바 검색
    $(document).on('topbar:search.approvalList', function () {
        loadApprovalList();
    });

    // 상세 보기
    $(document).on('click', '#approvalList .approval-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        if (!detailDrawerShow) return;

        approvalDetail(this);
    });

    // 텍스트 실시간 검색
    $('#searchKeyword').on('input', function () {
        filterApprovalList();
    });

    // 문서수신관리 탭
    $(document).on('click', '.approval-tab', function () {
        $('.approval-tab').removeClass('active');
        $(this).addClass('active');

        approvalPaperTab = $.trim($(this).data('paper-tab') || '');
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

    // 문서접수
    $(document).on('click', '#approvalReceiveBtn', function () {
        receiveApprovalPaper();
    });
});

let approvalListAll = [];
let approvalDetailRow = null;
let approvalPaperTab = getPaperTabParam();

// 검색일자 초기화
function initApprovalSearchDate() {
    if (getCcBaseKey() !== 'PL') return;

    const monthRange = cmGetThisMonthRange('-');

    $('#searchFromDate').val(monthRange.from);
    $('#searchToDate').val(monthRange.to);
}

// 전자결재 목록 호출
function loadApprovalList() {
    const ccBaseKey = getCcBaseKey();

    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchId: $('#loginIcCode').val(),
        ccHomeFlag: $('#ccHomeFlag').val(),
        ccBaseKey: ccBaseKey,
        ccFlag: ccBaseKey === 'PL' ? '' : ($('#selectBox1').val() || $('#ccFlag').val())
    };

    return cmAjax('/approval/selectApprovalList.do', 'GET', data, true).done(function (list) {
        approvalListAll = list || [];
        filterApprovalList();
    });
}

// 목록 필터
function filterApprovalList() {
    const keyword = $.trim($('#searchKeyword').val() || '').toLowerCase();
    const ccBaseKey = getCcBaseKey();

    const filteredList = approvalListAll.filter(function (row) {
        if (ccBaseKey === 'PL' && $.trim(row.ccFgNm || '') !== approvalPaperTab) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        return getApprovalSearchText(row, ccBaseKey).toLowerCase().indexOf(keyword) > -1;
    });

    renderApprovalList(filteredList, keyword ? '검색 결과가 없습니다.' : '문서가 없습니다.');
}

// 목록 그리기
function renderApprovalList(list, emptyText) {
    const approvalListEl = $('#approvalList');
    const ccBaseKey = getCcBaseKey();

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
        const fcNum = $.trim(row.fcNum || '');
        const isDone = Number(row.ccOK1 || 0) === 1;
        const statusText = getApprovalStatusText(ccBaseKey, isDone);
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
                .append($('<span/>', { class: 'approval-sub-text', text: getApprovalSubText(row, ccBaseKey) }))
                .append($('<span/>', { class: 'approval-status ' + statusCls, text: statusText }))
        );

        approvalListEl.append(rowEl);
    }
}

// 상세 조회
function approvalDetail(rowEl) {
    const selRow = $(rowEl);
    const ccBaseKey = getCcBaseKey();

    if (!detailDrawerShow) return;

    const ccCode = $.trim(selRow.data('cc-code') || '');
    const row = (approvalListAll || []).find(function (x) {
        return String((x && x.ccCode) || '') === ccCode;
    }) || {};

    const title = $.trim(row.ccTitle || '');
    const ymd = String(row.ccDate || '').substring(0, 10);
    const ccFlag = $.trim(row.ccFlag || '');
    const fcNum = $.trim(selRow.data('fc-num') || row.fcNum || '');
    const isDone = Number(row.ccOK1 || 0) === 1;
    const statusText = getApprovalStatusText(ccBaseKey, isDone);
    const statusCls = isDone ? 'text-green' : 'text-yellow';

    let headHtml = '';
    headHtml += '<div class="post-detail-head">';
    headHtml += '  <h3 class="post-detail-title">' + cmEscapeHtml(title) + '</h3>';
    headHtml += '  <div class="approval-detail-sub-line">';
    headHtml += '    <span class="approval-detail-sub-left">' + cmEscapeHtml(getApprovalSubText(row, ccBaseKey)) + '</span>';
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

        if (ccBaseKey === 'PL') {
            detailDrawerShow(headHtml + bodyHtml, true, row.ccImgNO);
            setApprovalReceiveButtonAfterPreview(getApprovalActionHtml(row));
        } else {
            detailDrawerShow(headHtml + bodyHtml + getApprovalActionHtml(row), true, row.ccImgNO);
        }
    }).fail(function (xhr) {
        console.log('detail fail:', xhr);
        detailDrawerShow(headHtml + '<div style="padding:16px;">상세 조회 실패</div>', true);
    });
}

// 검색 대상 문자열
function getApprovalSearchText(row, ccBaseKey) {
    const isDone = Number(row.ccOK1 || 0) === 1;

    if (ccBaseKey === 'PL') {
        return [
            row.ccTitle,
            row.ccDate,
            row.ccDay,
            row.ccFgNm,
            row.ccRMK,
            row.ccPlace,
            row.ccPaperNo,
            row.ccManagerNm,
            row.ccReBuserNm,
            row.ccReSaNm,
            row.ccReDate,
            getApprovalStatusText(ccBaseKey, isDone)
        ].join(' ');
    }

    return [
        row.ccTitle,
        row.ccDate,
        row.ccDay,
        row.ccBuserNm,
        row.ccFgNm,
        row.fcNum,
        row.ccRMK,
        getApprovalStatusText(ccBaseKey, isDone)
    ].join(' ');
}

// 목록 부제목
function getApprovalSubText(row, ccBaseKey) {
    const ymd = String(row.ccDate || '').substring(0, 10);
    const day = String(row.ccDay || '').substring(0, 1);

    if (ccBaseKey === 'PL') {
        return [
            [ymd, day].filter(Boolean).join(' '),
            $.trim(row.ccRMK || ''),
            $.trim(row.ccFgNm || '')
        ].filter(Boolean).join(' · ');
    }

    return [
        [ymd, day].filter(Boolean).join(' '),
        $.trim(row.ccBuserNm || ''),
        $.trim(row.ccFgNm || '')
    ].filter(Boolean).join(' · ');
}

// 상태 라벨
function getApprovalStatusText(ccBaseKey, isDone) {
    if (ccBaseKey === 'PL') {
        return isDone ? '접수완료' : '접수대기';
    }

    return isDone ? '결재완료' : '진행중';
}

// 결재 버튼 HTML
function getApprovalActionHtml(row) {
    const ccBaseKey = getCcBaseKey();

    if (ccBaseKey === 'PL') {
        if (Number(row.ccOK1 || 0) !== 1) {
            return `
                <div class="approval-action-wrap">
                    <button type="button" id="approvalReceiveBtn" class="approval-action-btn approval-sign-btn">접수</button>
                </div>
            `;
        }

        return '';
    }

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

// 접수 버튼 이미지 미리보기 아래 배치
function setApprovalReceiveButtonAfterPreview(actionHtml) {
    if (!actionHtml) return;

    if ($('#detailImagePreview').length > 0) {
        $('#detailImagePreview').after(actionHtml);
        return;
    }

    $('#detailDrawerAttachRoot').prepend(actionHtml);
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

// 문서접수 처리
function receiveApprovalPaper() {
    if (!approvalDetailRow) return;

    customAlert('알림', '접수 처리하시겠습니까?', 'YN').then(function (ok) {
        if (!ok) return;

        cmAjax('/approval/receivePaper.do', 'POST', {
            ymd: String(approvalDetailRow.ccDate || '').substring(0, 10),
            piSeq: approvalDetailRow.ccSeq
        }, true).done(function (res) {
            if (!res || res.success !== true) {
                customAlert('경고', (res && res.message) || '처리 실패', 'WARN').then(function () {
                    detailDrawerClose(true, true);
                    loadApprovalList();
                });
                return;
            }

            customAlert('알림', '접수되었습니다.', 'CONFIRM').then(function () {
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

// baseKey
function getCcBaseKey() {
    return $.trim($('#baseKey').val() || $('#ccBaseKey').val() || '');
}

// 문서수신관리 탭 파라미터
function getPaperTabParam() {
    const params = new URLSearchParams(window.location.search);
    const paperTab = $.trim(params.get('paperTab') || '');

    if (paperTab === '등기' || paperTab === '택배') {
        return paperTab;
    }

    return '공문';
}

// 문서수신관리 탭 선택
function setApprovalPaperTab() {
    if (getCcBaseKey() !== 'PL') return;

    $('.approval-tab').removeClass('active');
    $('.approval-tab').filter(function () {
        return $.trim($(this).data('paper-tab') || '') === approvalPaperTab;
    }).addClass('active');
}