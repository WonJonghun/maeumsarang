$(function () {
    // 최초리스트 호출
    loadScheduleList();

    // 이벤트 바인딩
    bindEvents();
});

function bindEvents() {

}

//조회
function loadScheduleList() {
    const baseKey = $.trim($('#baseKey').val() || '');
    const year = '2026';
    const month = '01';
    const baseDt = year + '-' + month + '-01';

    let scheduleParam = {
        flagCd: baseKey,
        baseDt: baseDt
    }

    //근무표
    cmAjax('/schedule/scheduleList.do', 'GET', scheduleParam, true).done(function (scheduleData) {
        const scheduleList = scheduleData.list;

        let holiParam
        //휴일
        cmAjax('/schedule/holidayList.do', 'GET', holiParam, false).done(function (holidayData) {

        })
    }).fail(function () {
        $('#scheduleList').empty().append($('<div/>', { class: 'schedule-error', text: '근무표 조회에 실패했습니다.' }));
    });
}

