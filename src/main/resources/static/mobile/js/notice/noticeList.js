$(function () {

    const hcCode = 'IntGmenu';
    const limit = 100;

    let tnFlag = 1;
    let offset = 0;
    let loading = false;
    let hasMore = true;

    tnFlag = parseInt($.trim($('#noticeBaseKey').val() || '1'), 10);
    if (isNaN(tnFlag) || tnFlag <= 0) tnFlag = 1;

    loadList(true);

    function buildRow(item) {
        const ccView = item.ccView || '';
        const isNew = (ccView === 'N');

        const row = $('<div/>', { class: 'notice-row', role: 'button', tabindex: 0 })
            .data('tn-title', item.tnTitle || '')
            .data('tn-date-str', item.tnDateStr || '')
            .data('tn-uk', item.tnUk || '')
            .data('tv-uk', item.tvUk || '')
            .data('view-count', item.viewCount || '0')
            .data('tn-remark', item.tnRemark || '')
            .data('tn-img-num', item.tnImgNum || '')
            .data('cc-view', ccView);

        const dot = $('<div/>', { class: (isNew ? 'dot-blue' : 'dot-gray') });

        const text = $('<div/>', { class: 'notice-text' });
        text.append($('<p/>', { class: 'notice-title' + (isNew ? ' text-deep-blue' : ''), text: item.tnTitle || '' }));
        text.append($('<p/>', {
            class: 'notice-date',
            text: (item.tnDateStr || '') + ' · ' + (item.tnUk || '') + ' · 조회 ' + (item.viewCount || '0')
        }));

        row.append(dot).append(text);
        return row;
    }

    function renderEmptyIfNeeded() {
        const list = $('#noticeList');
        if (list.find('.notice-row').length > 0) return;
        list.html('<div class="notice-empty">게시글이 없습니다.</div>');
    }

    function loadList(reset) {
        if (loading) return;
        if (!hasMore && !reset) return;

        const loginIcCode = $.trim($('#loginIcCode').val() || '');
        if (!loginIcCode) return;

        loading = true;

        if (reset) {
            offset = 0;
            hasMore = true;
            $('#noticeList').empty();
        }

        cmAjax('/notice/list.do', 'GET', {
            hcCode: hcCode,
            tnFlag: tnFlag,
            offset: offset,
            limit: limit,
            searchId: loginIcCode,
            searchFromDate: $('#searchFromDate').val(),
            searchToDate: $('#searchToDate').val(),
            searchKeyword: $('#searchKeyword').val()
        }, false).done(function (list) {

            if (!list || list.length === 0) {
                hasMore = false;
                renderEmptyIfNeeded();
                return;
            }

            for (let i = 0; i < list.length; i++) {
                $('#noticeList').append(buildRow(list[i]));
            }

            offset += list.length;
            hasMore = (list.length === limit);

        }).always(function () {
            loading = false;
        });
    }

    $(document).on('topbar:search', function () {
        loadList(true);
    });

    $(document).on('click', '#noticeList .notice-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();

        if (window.cmHeader && typeof window.cmHeader.saveSearchState === 'function') {
            window.cmHeader.saveSearchState();
        }

        const selRow = $(this);
        const tvUk = selRow.data('tv-uk');
        const saCd = $.trim($('#loginIcCode').val() || '');

        if (tvUk && saCd && selRow.data('viewSent') !== true) {
            selRow.data('viewSent', true);
            selRow.find('.dot-blue').removeClass('dot-blue').addClass('dot-gray');
            selRow.find('.notice-title').removeClass('text-deep-blue');

            cmAjax('/notice/totalNoteView.do', 'POST', { tvUk: tvUk, saCd: saCd }, false);
        }

        postDetail(this, true);
    });

});
