$(function () {
    adminCheck();
    loadItemRequestList();

    $(document).on('click', '#item-request-list .item-request-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        itemRequestDetail(this);
    });

    $(document).on('topbar:search', function () {
        loadItemRequestList();
    });

    $(document).on('change', '#allBuserYn', function () {
        loadItemRequestList();
    });

    $('#searchKeyword').on('input', function () {
        loadItemRequestList(true);
    });
});

let itemRequestListAll = [];
let itemRequestListView = [];

// 권한체크
function adminCheck() {
    const adminKey = $('#adminKey').val() || '';

    if (adminKey.slice(-1) !== 'Y') return;

    $('.topbar').append(`
        <div class="item-request-top">
            <label class="item-request-all-check">
                <input type="checkbox" id="allBuserYn">
                <span>전체</span>
            </label>
        </div>
    `);
}

// 목록조회 + 검색
function loadItemRequestList(isSearchOnly) {
    const keyword = ($('#searchKeyword').val() || '').toLowerCase();

    if (isSearchOnly) {
        itemRequestListView = itemRequestListAll.filter(function (row) {
            return [
                row.orFlagNm || '',
                row.orBuserNm || '',
                row.ccTitle || '',
                row.orChtNM || '',
                row.orNumber || '',
                Number(row.cnt || 0).toLocaleString() + '건',
                Number(row.amt || 0).toLocaleString() + '원'
            ].join(' ').toLowerCase().indexOf(keyword) > -1;
        });

        if (!itemRequestListView.length) {
            $('#item-request-list').html(`
                <div class="item-request-empty">
                    ${keyword ? '검색 결과가 없습니다.' : '목록이 없습니다.'}
                </div>
            `);
            return;
        }

        let html = '';

        for (let i = 0; i < itemRequestListView.length; i++) {
            const row = itemRequestListView[i] || {};
            const dateText = String(row.orDate || '').substring(0, 10);
            const isDone = row.orFlag == '1' && row.orReDt != null;
            const flagClass = row.orFlagNm === '수시' ? ' text-blue' : '';

            html += `
                <div class="item-request-row" data-index="${i}">
                    <div class="item-request-title">
                        <div class="item-request-title-left">
                            <span class="item-request-flag${flagClass}">${cmEscapeHtml(row.orFlagNm || '')}</span>
                            <span class="item-request-buser">${cmEscapeHtml(row.orBuserNm || '')}</span>
                            <span class="item-request-cnt">${Number(row.cnt || 0).toLocaleString()}건</span>
                        </div>
                        <span class="item-request-amt">${Number(row.amt || 0).toLocaleString()}원</span>
                    </div>
                    <div class="item-request-sub">
                        <span class="item-request-sub-text">${cmEscapeHtml(dateText)}</span>
                        ${isDone ? '<span class="item-request-status text-green">완료</span>' : ''}
                    </div>
                </div>
            `;
        }

        $('#item-request-list').html(html);
        return;
    }

    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val()
    };

    if (!$('#allBuserYn').is(':checked')) {
        data.searchBuserCd = $('#loginBuser').val();
    }

    cmAjax('/itemRequest/selectItemRequestList.do', 'GET', data, true).done(function (list) {
        itemRequestListAll = list || [];
        loadItemRequestList(true);
    });
}

// 상세
function itemRequestDetail(rowEl) {
    const row = itemRequestListView[Number($(rowEl).data('index'))] || {};
    const isDone = row.orFlag == '1' && row.orReDt != null;

    const title = [
        row.orFlagNm || '',
        row.orBuserNm || '',
        Number(row.cnt || 0).toLocaleString() + '건'
    ].filter(Boolean).join(' ');

    const subTitle = [
        String(row.orDate || '').substring(0, 10),
        Number(row.amt || 0).toLocaleString() + '원'
    ].filter(Boolean).join(' · ');

    const data = {
        orComCD: row.orComCD || '',
        orNumber: row.orNumber || '',
        orDate: String(row.orDate || '').substring(0, 10)
    };

    cmAjax('/itemRequest/selectItemRequestDetail.do', 'GET', data, true).done(function (list) {
        let itemHtml = '';

        if (!list || !list.length) {
            itemHtml = '<div class="item-request-empty">상세내역이 없습니다.</div>';
        } else {
            for (let i = 0; i < list.length; i++) {
                const detailRow = list[i] || {};
                const qty = Number(detailRow.orQty || 0);
                const price = Number(detailRow.orPrice || 0);

                itemHtml += `
                    <div class="item-request-detail-section">
                        <div class="item-request-detail-subtitle">신청물품 ${i + 1}</div>

                        <div class="item-request-or-card">
                            <table class="item-request-or-table">
                                <colgroup>
                                    <col style="width: 64px;" />
                                    <col />
                                    <col style="width: 64px;" />
                                    <col />
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <th class="item-request-or-th">물품명</th>
                                        <td class="item-request-or-td">${cmEscapeHtml(detailRow.ocName || '')}</td>
                                        <th class="item-request-or-th">물품코드</th>
                                        <td class="item-request-or-td">${cmEscapeHtml(detailRow.orOccode || '')}</td>
                                    </tr>
                                    <tr>
                                        <th class="item-request-or-th">규격</th>
                                        <td class="item-request-or-td">${cmEscapeHtml(detailRow.ocStanSize || '')}</td>
                                        <th class="item-request-or-th">단위</th>
                                        <td class="item-request-or-td">${cmEscapeHtml(detailRow.ocUnit || '')}</td>
                                    </tr>
                                    <tr>
                                        <th class="item-request-or-th">수량</th>
                                        <td class="item-request-or-td">${qty.toLocaleString()}</td>
                                        <th class="item-request-or-th">단가</th>
                                        <td class="item-request-or-td">${price.toLocaleString()}원</td>
                                    </tr>
                                    <tr>
                                        <th class="item-request-or-th">총금액</th>
                                        <td class="item-request-or-td" colspan="3">${(qty * price).toLocaleString()}원</td>
                                    </tr>
                                    <tr>
                                        <th class="item-request-or-th">비고</th>
                                        <td class="item-request-or-td" colspan="3">
                                            ${detailRow.orRemark ? cmNl2br(detailRow.orRemark) : '<div class="item-request-or-empty">-</div>'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        }

        detailDrawerShow(`
            <div class="post-detail-head">
                <h3 class="post-detail-title">${cmEscapeHtml(title)}</h3>
                <div class="item-request-detail-sub-line">
                    <span class="item-request-detail-sub-left">${cmEscapeHtml(subTitle)}</span>
                    ${isDone ? '<span class="item-request-detail-status text-green">완료</span>' : ''}
                </div>
            </div>
            <div class="item-request-detail-wrap">
                <div class="item-request-detail-list">
                    ${itemHtml}
                </div>
            </div>
        `, true);
    });
}