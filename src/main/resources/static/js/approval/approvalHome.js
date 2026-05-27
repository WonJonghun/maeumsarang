$(function () {
    loadApprovalFlowList();

    $(document).on('click', '.approval-branch-card[data-cc-flag]', function () {
        const ccFlag = $.trim($(this).attr('data-cc-flag') || '');
        if (!ccFlag) return;

        cmMovePage('/approval/approvalList.do', {
            ccHomeFlag: ccFlag,
            title: $.trim($(this).find('.approval-branch-title').text() || '')
        });
    });
});

// 전자결재 분기 목록 호출
function loadApprovalFlowList() {
    const data = {
        searchFromDate: cmSubDays(cmGetToday('-'), 90, '-'),
        searchToDate: cmGetToday('-'),
        searchId: $.trim($('#loginIcCode').val() || ''),
    };

    cmAjax('/approval/approvalFlowlist.do', 'GET', data, true).done(function (list) {
        const wrapEl = $('#approvalHome');
        wrapEl.empty();

        const arr = list || [];

        for (let i = 0; i < arr.length; i++) {
            const row = arr[i] || {};
            const ccFlag = $.trim(row.ccFlag || '');
            const ccName = $.trim(row.ccName || '');
            if (!ccFlag || !ccName) continue;

            // ▣ 전체문서 (54) -> title=전체문서, cnt=54
            const m = (ccName || '').match(/\((\d+)\)/);
            const cnt = m ? parseInt(m[1], 10) : 0;

            const title = (ccName || '')
                .replace(/^▣\s*/, '')
                .replace(/\s*\(\d+\)\s*$/, '')
                .trim();

            let icon = 'bi bi-file-earmark-text';
            if (ccFlag === '1') icon = 'bi bi-files';
            else if (ccFlag === '2') icon = 'bi bi-folder2-open';
            else if (ccFlag === '3') icon = 'bi bi-arrow-return-left';
            else if (ccFlag === '4') icon = 'bi bi-check2-circle';
            else if (ccFlag === '5') icon = 'bi bi-people';
            else if (ccFlag === '6') icon = 'bi bi-pencil';
            else if (ccFlag === '10') icon = 'bi bi-pen';

            const stateClass = (cnt > 0) ? 'is-active' : 'is-inactive';

            const btnEl = $('<button/>', {
                type: 'button',
                class: 'approval-branch-card ' + stateClass,
                'data-cc-flag': ccFlag
            });

            const leftEl = $('<div/>', { class: 'approval-branch-left' });

            leftEl.append(
                $('<div/>', { class: 'approval-branch-icon flag-' + ccFlag })
                    .append($('<i/>', { class: icon }))
            );

            const textEl = $('<div/>', { class: 'approval-branch-text' });
            textEl.append($('<div/>', { class: 'approval-branch-title', text: title }));
            // textEl.append($('<div/>', { class: 'approval-branch-desc', text: '전자결재' }));
            leftEl.append(textEl);

            btnEl.append(leftEl);
            btnEl.append(
                $('<div/>', { class: 'approval-branch-right' })
                    .append($('<div/>', { class: 'approval-branch-count', text: cnt + '건' }))
            );

            wrapEl.append(btnEl);
        }
    });
}
