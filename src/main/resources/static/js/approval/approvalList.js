$(function () {
    loadApprovalList()

    // 상세 보기
    $(document).on('click', '#approvalList .approval-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        if (!window.detailDrawerShow) return;

        approvalDetail(this);
    });
});

let approvalListAll = [];

// 전자결재 목록 호출
function loadApprovalList() {
    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchId: $('#loginIcCode').val(),
        ccFlag: $('#ccFlag').val()
    };

    cmAjax('/approval/list.do', 'GET', data, true).done(function (list) {
        approvalListAll = list || [];

        const approvalListEl = $('#approvalList');
        approvalListEl.empty();

        if (approvalListAll.length === 0) {
            approvalListEl.append($('<div/>', { class: 'approval-empty', text: '문서가 없습니다.' }));
            return;
        }

        for (let i = 0; i < approvalListAll.length; i++) {
            const row = approvalListAll[i] || {};

            const title = $.trim(row.ccTitle || '');
            const ymd = String(row.ccDate).substring(0, 10);
            const day = String(row.ccDay).substring(0, 1);
            const team = $.trim(row.ccBuserNm || '');
            const fgNm = $.trim(row.ccFgNm || '');

            const subText = [[ymd, day].filter(Boolean).join(' '), team, fgNm]
                .filter(Boolean)
                .join(' · ');

            const isDone = Number(row.ccOK1 || 0) === 1;
            const statusText = isDone ? '결재완료' : '진행중';
            const statusCls = isDone ? 'text-green' : 'text-yellow';

            const rowEl = $('<div/>', {
                class: 'approval-row',
                'data-cc-code': row.ccCode || ''
            });

            // 제목 단독
            rowEl.append($('<div/>', { class: 'approval-title', text: title }));

            // 서브타이틀 오른쪽에 딱지
            rowEl.append(
                $('<div/>', { class: 'approval-sub' })
                    .append($('<span/>', { class: 'approval-sub-text', text: subText }))
                    .append($('<span/>', { class: 'approval-status ' + statusCls, text: statusText }))
            );

            approvalListEl.append(rowEl);
        }
    });
}

// 상세 조회
function approvalDetail(rowEl) {
    const selRow = $(rowEl);

    if (!window.detailDrawerShow) return;

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

    window.detailDrawerShow(headHtml, true);

    const data = {
        ccCode: ccCode,
        ccFlag: ccFlag
    };

    cmAjaxHtml('/approval/approvalDetail.do', 'GET', data, true).done(function (bodyHtml) {
        if (!bodyHtml) return;
        window.detailDrawerShow(headHtml + bodyHtml, true);
    }).fail(function (xhr) {
        console.log('detail fail:', xhr);
        window.detailDrawerShow(headHtml + '<div style="padding:16px;">상세 조회 실패</div>', true);
    });
}