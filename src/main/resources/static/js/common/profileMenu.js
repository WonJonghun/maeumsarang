$(function () {
    loadCheckApproList();
    bindEvents();
});

//이벤트 바인딩
function bindEvents() {
    //프로필 클릭
    $(document)
        .off('click.profileMenuOpen', '.topbar .profile')
        .on('click.profileMenuOpen', '.topbar .profile', function (e) {
            e.preventDefault();

            const html = $('#profileMenuTemplate').html();
            if (!html) return false;

            detailDrawerShow(html, true);

            //드로어 DOM 주입 후 렌더
            // renderProfileCheckCounts();
            loadCheckApproList();
            loadCommuteStat();

            return false;
        });

    //프로필 메뉴(6개) 클릭 -> 임시로 메인 이동
    $(document)
        .off('click.profileMenuGoMain', '.profile-check-item')
        .on('click.profileMenuGoMain', '.profile-check-item', function (e) {
            e.preventDefault();
            location.href = '/main.do';
            return false;
        });
}

//전자결재 및 우편 등 확인할 내용 불러오기
function loadCheckApproList() {
    const param = {
        searchId: $('#loginIcCode').val(),
        searchDate: cmGetToday('-'),
    };

    cmAjax('/profile/checkApproList.do', 'GET', param, true).done(function (list) {
        let profileCheckData;
        if ($.isArray(list) && list.length) profileCheckData = list[0];
        else if (list && typeof list === 'object') profileCheckData = list;
        else profileCheckData = null;

        // if (!$('#profileCheckGrid').length) return;
        if (!profileCheckData) return;

        const approval = (Number(profileCheckData.ccCnt1) || 0) + (Number(profileCheckData.ccCnt111) || 0);
        const mail = Number(profileCheckData.ccCnt99) || 0;
        const official = Number(profileCheckData.ccCnt12) || 0;
        const post = Number(profileCheckData.ccCnt22) || 0;
        const parcel = Number(profileCheckData.ccCnt32) || 0;
        const coop = Number(profileCheckData.ccCnt2) || 0;

        const total = approval + mail + official + post + parcel + coop;

        const badgeMap = {
            total: total,
            approval: approval,
            mail: mail,
            official: official,
            post: post,
            parcel: parcel,
            coop: coop,
        };

        $.each(badgeMap, function (key, cnt) {
            const badge = $('.profile-check-badge[data-key="' + key + '"]');
            if (!badge.length) return;

            if ((Number(cnt) || 0) > 0) {
                badge.text(cnt);
                badge.show();
            } else {
                badge.hide();
            }
        });
    });
}

//출퇴근 시간
function loadCommuteStat() {
    const param = {
        searchId: $('#loginIcCode').val(),
        searchDate: cmGetToday('-')
    };

    cmAjax('/profile/commuteStat.do', 'GET', param, true).done(function (list) {
        const row = (list && list.length) ? list[0] : null;

        const inTime = row && row.ilIntime ? row.ilIntime.substring(0, 2) + ':' + row.ilIntime.substring(2, 4) : '-';
        const outTime = row && row.ilOuttime ? row.ilOuttime.substring(0, 2) + ':' + row.ilOuttime.substring(2, 4) : '-';

        $('#commuteInTime').text(inTime);
        $('#commuteOutTime').text(outTime);
    });
}