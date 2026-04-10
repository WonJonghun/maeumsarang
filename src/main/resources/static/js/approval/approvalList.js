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
});

let approvalListAll = [];

// 전자결재 목록 호출
function loadApprovalList() {
    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchId: $('#loginIcCode').val(),
        ccHomeFlag: $('#ccHomeFlag').val(),
        ccFlag: $('#selectBox1').val() || $('#ccFlag').val()
    };

    cmAjax('/approval/selectApprovalList.do', 'GET', data, true).done(function (list) {
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

        const subText = [[ymd, day].filter(Boolean).join(' '), team, fgNm]
            .filter(Boolean)
            .join(' · ');

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

    const subText = [[ymd, day].filter(Boolean).join(' '), team, fgNm]
        .filter(Boolean)
        .join(' · ');

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
        detailDrawerShow(headHtml + bodyHtml, true, row.ccImgNO);
    }).fail(function (xhr) {
        console.log('detail fail:', xhr);
        detailDrawerShow(headHtml + '<div style="padding:16px;">상세 조회 실패</div>', true);
    });
}