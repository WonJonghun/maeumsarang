let mailList = [];
let currentMailTab = 'receive';

$(function () {
    loadMailList();

    $(document).on('topbar:search.mailList', function (e, p) {
        renderMailList(p && p.searchKeyword);
    });

    $('#searchKeyword').off('input.mailList').on('input.mailList', function () {
        renderMailList($(this).val());
    });

    $('.mail-tab').on('click', function () {
        $('.mail-tab').removeClass('active');
        $(this).addClass('active');

        currentMailTab = $(this).data('tab');
        renderMailList($('#searchKeyword').val());
    });

    //상세 조회
    $(document).on('click', '#mailList .mail-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();

        mailDetail(this);
    });
});

// 메일 목록
function loadMailList() {
    cmAjax('/mail/list.do', 'GET', {}, true).done(function (list) {
        mailList = list || [];
        renderMailList($('#searchKeyword').val());
    });
}

// 메일 렌더
function renderMailList(keyword) {
    const mailListEl = $('#mailList');
    mailListEl.empty();

    const k = $.trim(keyword == null ? $('#searchKeyword').val() : keyword);
    const lk = k ? k.toLowerCase() : '';

    const list = mailList.filter(function (item) {
        const ccFlag = Number(item.ccFlag);
        const flag1 = Number(item.flag1);

        if (currentMailTab === 'old') {
            if (flag1 !== 1) return false;
        }

        if (currentMailTab === 'delete') {
            if (flag1 === 1 || ccFlag !== 3) return false;
        }

        if (currentMailTab === 'receive') {
            if (flag1 === 1 || ccFlag === 3 || ccFlag !== 1) return false;
        }

        if (currentMailTab === 'send') {
            if (flag1 === 1 || ccFlag === 3 || ccFlag !== 2) return false;
        }

        if (!k) return true;

        const title = $.trim(item.maTitle || '(제목 없음)');
        const nameText = getMailNameText(item);
        const dateText = formatMailDate(item.maRegDate || item.maDate);
        const typeText = getMailTypeText(item);
        const fileText = item.maFileFlag === 'Y' ? '첨부' : '';
        const subText = [dateText, nameText, typeText, fileText].filter(Boolean).join(' · ');

        return (title + ' ' + subText).toLowerCase().indexOf(lk) > -1;
    });

    if (list.length === 0) {
        mailListEl.html('<div class="mail-empty">메일이 없습니다.</div>');
        return;
    }

    for (let i = 0; i < list.length; i++) {
        const item = list[i];

        const title = $.trim(item.maTitle || '(제목 없음)');
        const nameText = getMailNameText(item);
        const dateText = formatMailDate(item.maRegDate || item.maDate);
        const typeText = getMailTypeText(item);
        const fileText = item.maFileFlag === 'Y' ? '첨부' : '';
        const isUnread = Number(item.chk || 0) !== 1;

        const subText = [dateText, nameText, typeText].filter(Boolean).join(' · ');

        const rowEl = $(`
            <div class="mail-row${isUnread ? ' is-unread' : ''}">
                <div class="mail-text">
                    <p class="mail-title"></p>
                    <p class="mail-sub-title">
                        <span class="mail-sub-left"></span>
                        ${fileText ? '<span class="mail-file">첨부</span>' : ''}
                    </p>
                </div>
            </div>
        `).data('mail-item', item);

        rowEl.find('.mail-title').html(highlightMailText(title, k));
        rowEl.find('.mail-sub-left').html(highlightMailText(subText, k));

        mailListEl.append(rowEl);
    }
}

// 메일 상세
function mailDetail(rowEl) {
    const item = $(rowEl).data('mail-item') || {};

    updateMailView(rowEl, item);

    const title = $.trim(item.maTitle || '(제목 없음)');
    const dateText = formatMailDate(item.maRegDate || item.maDate);
    const nameText = getMailNameText(item);
    const typeText = getMailTypeText(item);
    const receiveText = $.trim(item.icName || '');
    const sendText = $.trim(item.maUk || '');
    const subTitle = [dateText, nameText, typeText].filter(Boolean).join(' · ');

    detailDrawerShow(`
        <div class="post-detail-head">
            <h3 class="post-detail-title">${cmEscapeHtml(title)}</h3>
            <div class="mail-detail-sub-line">
                <span class="mail-detail-sub-left">${cmEscapeHtml(subTitle)}</span>
            </div>
        </div>

        <div class="mail-detail-wrap">
            <div class="mail-detail-info">
                <div class="mail-detail-info-row">
                    <span class="mail-detail-info-label">보낸사람</span>
                    <span class="mail-detail-info-value">${cmEscapeHtml(sendText)}</span>
                </div>
                <div class="mail-detail-info-row">
                    <span class="mail-detail-info-label">받는사람</span>
                    <span class="mail-detail-info-value">${cmEscapeHtml(receiveText)}</span>
                </div>
            </div>

            <div class="mail-detail-body">
                ${$.trim(item.maRemark || '') ? cmNl2br(item.maRemark) : '<div class="mail-detail-empty">내용이 없습니다.</div>'}
            </div>
        </div>
    `, true, $.trim(item.maImgNum || ''));
}

// 메일 읽음 처리
function updateMailView(rowEl, item) {
    if (Number(item.flag) !== 1) return;
    if (Number(item.chk) === 1) return;

    item.chk = 1;
    item.maView = 'Y';
    $(rowEl).removeClass('is-unread');

    cmAjax('/mail/view.do', 'POST', {
        maDate: item.maDate,
        maSeq: item.maSeq
    }, false);
}

// 메일 이름
function getMailNameText(item) {
    if (Number(item.flag) === 1) {
        return $.trim(item.maUk || '');
    }

    return $.trim(item.icName || '');
}

// 메일 구분
function getMailTypeText(item) {
    const flag = Number(item.flag);
    const ccFlag = Number(item.ccFlag);
    const flag1 = Number(item.flag1);

    if (flag1 === 1) {
        return flag === 2 ? '보낸 만료메일' : '받은 만료메일';
    }

    if (ccFlag === 3) {
        return flag === 2 ? '보낸 삭제메일' : '받은 삭제메일';
    }

    if (flag === 2) {
        return '보낸메일';
    }

    return '받은메일';
}

// 메일 날짜
function formatMailDate(value) {
    if (!value) return '';

    const text = String(value).replace('T', ' ');
    if (text.length >= 16) {
        return text.substring(0, 16).replace(/-/g, '.');
    }

    return text.substring(0, 10).replace(/-/g, '.');
}

// 검색어 강조
function highlightMailText(text, keyword) {
    const value = String(text || '');
    const k = $.trim(keyword || '');

    if (!k) return cmEscapeHtml(value);

    const escapedValue = cmEscapeHtml(value);
    const escapedKeyword = cmEscapeHtml(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return escapedValue.replace(new RegExp(escapedKeyword, 'gi'), function (match) {
        return '<span class="mail-search-highlight">' + match + '</span>';
    });
}