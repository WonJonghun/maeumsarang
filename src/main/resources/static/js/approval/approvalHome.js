$(function () {
    loadApprovalFlowList()
});

// 전자결재 분기 목록 호출
function loadApprovalFlowList() {
    const data = {
        searchFromDate: cmGetToday('-'),
        searchToDate: cmSubDays(cmGetToday('-'), 90, '-'),
        searchId: $.trim($('#loginIcCode').val() || ''),
    };

    cmAjax('/approval/approvalFlowlist.do', 'GET', data, true).done(function (list) {
        console.log(list);
    });
}
