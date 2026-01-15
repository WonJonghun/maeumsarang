$(function () {
    // 초기 목록 조회
    loadPropList();

    // 검색 이벤트
    $(document).on('topbar:search', function () {
        loadPropList();
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
function loadPropList() {
    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val(),
        searchKeyword: $('#searchKeyword').val(),
    };

    cmAjax('/imprvProp/list.do', 'GET', data, true).done(function (list) {
        const propListEl = $('#propList');
        propListEl.empty();

        if (!list || list.length === 0) {
            propListEl.html('<div class="prop-empty">게시글이 없습니다.</div>');
            return;
        }

        for (let i = 0; i < list.length; i++) {
            const item = list[i];

            let partText = '';
            let partClass = '';
            switch (Number(item.plPartflag)) {
                case 1: partText = '제안'; partClass = 'text-green'; break;
                case 2: partText = '개선'; partClass = 'text-deep-blue'; break;
                default: partText = ''; partClass = ''; break;
            }

            const row = $('<div/>', { class: 'prop-row', role: 'button', tabindex: 0 })
                .data('pl-date', cmDateOnly(item.plDate))
                .data('pl-number', $.trim(item.plNumber))
                .data('pl-partflag', item.plPartflag)
                .data('pl-img-num', item.plImgNum);

            const subLine = $('<p/>', { class: 'prop-sub-title' })
                .append($('<span/>', { class: 'prop-sub-left', text: cmFormatYmd(item.plDate, '.') }));

            if (partText) {
                subLine.append($('<span/>', { class: 'prop-status ' + partClass, text: partText }));
            }

            row.append(
                $('<div/>', { class: 'prop-text' })
                    .append($('<p/>', { class: 'prop-title', text: $.trim(item.plTitle) }))
                    .append(subLine)
            );

            propListEl.append(row);
        }

    });
}

// 상세 조회
function propDetail(rowEl) {
    const selRow = $(rowEl);

    window.detailDrawerShow('<div style="padding:16px;">상세 조회중...</div>', true);

    const partFlag = Number(selRow.data('pl-partflag'));
    let partText = '';
    let partChipClass = '';
    switch (partFlag) {
        case 1: partText = '제안'; partChipClass = 'is-prop'; break;
        case 2: partText = '개선'; partChipClass = 'is-imprv'; break;
        default: partText = ''; partChipClass = ''; break;
    }

    const data = {
        icCode: 'Int000001',
        searchDate: $.trim(selRow.data('pl-date')),
        plNumber: $.trim(selRow.data('pl-number'))
    };

    cmAjax('/imprvProp/propDetail.do', 'GET', data, true).done(function (res) {
        if (!res || res.length === 0) {
            window.detailDrawerShow('<div style="padding:16px;">상세 데이터가 없습니다.</div>', true);
            return;
        }

        res.sort(function (a, b) {
            return (parseInt(a.ccSeq || '0', 10) || 0) - (parseInt(b.ccSeq || '0', 10) || 0);
        });

        let html = '';
        html += '<div class="post-detail-head">';
        html += '  <h3 class="post-detail-title">' + cmEscapeHtml($.trim(res[1] && res[1].ccRmk)) + '</h3>';
        html += '  <div class="prop-detail-sub-line">';
        html += '    <span class="prop-detail-sub-left">' + cmEscapeHtml(formatPropMetaText($.trim(res[0] && res[0].ccTitle))) + '</span>';
        if (partText) {
            html += '    <span class="prop-type-chip ' + cmEscapeHtml(partChipClass) + '">' + cmEscapeHtml(partText) + '</span>';
        }
        html += '  </div>';
        html += '</div>';

        html += '<div class="prop-detail-wrap">';
        for (let i = 2; i < res.length; i++) {
            const item = res[i];
            const ccTitle = $.trim(item.ccTitle);
            const ccRmk = item.ccRmk == null ? '' : String(item.ccRmk);

            if (!ccTitle && !$.trim(ccRmk)) continue;

            html += '<div class="prop-detail-section">';
            if (ccTitle) html += '  <div class="prop-detail-subtitle">' + cmEscapeHtml(ccTitle) + '</div>';
            if ($.trim(ccRmk)) html += '  <div class="prop-detail-body">' + cmNl2br(ccRmk) + '</div>';
            html += '</div>';
        }
        html += '</div>';

        window.detailDrawerShow(html, true, $.trim(selRow.data('pl-img-num')));

    }).fail(function (xhr) {
        console.log('propDetail fail:', xhr);
        window.detailDrawerShow('<div style="padding:16px;">상세 조회 실패</div>', true);
    });
}

// 이름, 부서, 제출일시 자르기
function formatPropMetaText(s) {
    const meta = $.trim(s);
    if (!meta) return '';

    const parts = meta.split(':');
    if (parts.length < 4) return meta.replace(/\s+/g, ' ').trim();

    const name = $.trim(parts[1] || '').replace(/\s*부서\s*$/g, '').replace(/\s+/g, ' ').trim();
    const dept = $.trim(parts[2] || '').replace(/\s*제출일시\s*$/g, '').replace(/\s+/g, ' ').trim();
    const dt = $.trim(parts[3] || '').replace(/\s+/g, ' ').trim();

    return (dt + ' · ' + name + ' · ' + dept).replace(/\s+/g, ' ').trim();
}
