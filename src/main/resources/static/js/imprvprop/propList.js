$(function () {
    //목록 조회
    loadPropList('');

    // 검색 이벤트
    $(document).on('topbar:search', function (e, payload) {
        loadPropList($.trim((payload && payload.keyword) ? payload.keyword : ''));
    });

    // Enter 검색
    $(document).on('keydown', '#topbarSearchInput', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        loadPropList($.trim($(this).val() || ''));
    });

    // 상세 보기
    $(document).on('click', '#propList .prop-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        if (!window.detailDrawerShow) return;

        propDetail(this);
    });
});

// 목록 리스트
function loadPropList(keyword) {
    const endDt = new Date();
    const startDt = new Date();
    startDt.setFullYear(endDt.getFullYear() - 3);

    let data = {
        searchFromDate: cmFormatYmd(startDt),
        searchToDate: cmFormatYmd(endDt),
        searchKeyword: $.trim(keyword || '')
    };

    cmAjax('/imprvProp/list.do', 'GET', data, false).done(function (list) {

        const propListEl = $('#propList');
        propListEl.empty();

        if (!list || list.length === 0) {
            propListEl.html('<div class="prop-empty">게시글이 없습니다.</div>');
            return;
        }

        for (let i = 0; i < list.length; i++) {
            const item = list[i];

            let row = $('<div/>', { class: 'prop-row', role: 'button', tabindex: 0 })
                .data('pl-date', cmDateOnly(item.plDate || item.Pl_Date || ''))
                .data('pl-number', $.trim(item.plNumber || item.Pl_Number || ''));

            row.append(
                $('<div/>', { class: 'prop-text' })
                    .append($('<p/>', { class: 'prop-title', text: $.trim(item.plTitle || item.Pl_title || '') }))
                    .append($('<p/>', { class: 'prop-date', text: cmDateOnly(item.plDate || item.Pl_Date || '') }))
            );

            propListEl.append(row);
        }
    });
}

// 상세 조회
function propDetail(rowEl) {
    const selRow = $(rowEl);

    window.detailDrawerShow('<div style="padding:16px;">상세 조회중...</div>', true);

    let data = {
        icCode: 'Int000001',
        searchDate: $.trim(selRow.data('pl-date') || ''),
        plNumber: $.trim(selRow.data('pl-number') || '')
    };

    cmAjax('/imprvProp/propDetail.do', 'GET', data, false).done(function (res) {

        if (!res || res.length === 0) {
            window.detailDrawerShow('<div style="padding:16px;">상세 데이터가 없습니다.</div>', true);
            return;
        }

        res.sort(function (a, b) {
            return (parseInt(a.ccSeq || '0', 10) || 0) - (parseInt(b.ccSeq || '0', 10) || 0);
        });

        let html = '';
        html += '<div class="post-detail-head">';
        html += '  <h3 class="post-detail-title">' + cmEscapeHtml($.trim((res[1] && res[1].ccRmk) || '')) + '</h3>';
        html += '  <div class="post-detail-meta"><span>'
            + cmEscapeHtml(formatPropMetaText($.trim((res[0] && res[0].ccTitle) || '')))
            + '</span></div>';
        html += '</div>';
        html += '<div class="prop-detail-wrap">';

        for (let i = 2; i < (res || []).length; i++) { // 3번째 row부터 출력
            let item = res[i] || {};
            let ccTitle = $.trim(item.ccTitle || '');
            let ccRmk = item.ccRmk == null ? '' : String(item.ccRmk);

            if (!ccTitle && !$.trim(ccRmk)) continue;

            html += '<div class="prop-detail-section">';
            if (ccTitle) html += '  <div class="prop-detail-subtitle">' + cmEscapeHtml(ccTitle) + '</div>';
            if ($.trim(ccRmk)) html += '  <div class="prop-detail-body">' + cmNl2br(ccRmk) + '</div>';
            html += '</div>';
        }

        html += '</div>';

        window.detailDrawerShow(html, true);

    }).fail(function (xhr) {
        console.log('propDetail fail:', xhr);
        window.detailDrawerShow('<div style="padding:16px;">상세 조회 실패</div>', true);
    });
}

// 이름, 부서, 제출일시 자르기
function formatPropMetaText(s) {
    const meta = $.trim(s || '');
    if (!meta) return '';

    const parts = meta.split(':');
    if (parts.length < 4) return meta.replace(/\s+/g, ' ').trim();

    const name = $.trim(parts[1] || '').replace(/\s*부서\s*$/g, '').replace(/\s+/g, ' ').trim();
    const dept = $.trim(parts[2] || '').replace(/\s*제출일시\s*$/g, '').replace(/\s+/g, ' ').trim();
    const dt = $.trim(parts[3] || '').replace(/\s+/g, ' ').trim();

    return (dt + ' · ' + name + ' · ' + dept).replace(/\s+/g, ' ').trim();
}

