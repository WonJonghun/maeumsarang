$(function () {
    // 초기 리스트 호출
    loadContactList();
});

let contactListAll = [];

// 직원연락처 리스트 호출
function loadContactList() {
    cmAjax('/contact/list.do', 'GET', { baseDt: cmGetToday('-') }, true).done(function (list) {
        contactListAll = list || [];
        renderContactList(contactListAll);
    });
}

//테이블 그리기
function renderContactList(list) {

}
