$(function () {
    loadPropertyLookList();

    $(document).on('click', '.property-area-title', function () {
        const $this = $(this);
        const $body = $this.next('.property-area-body');

        $('.property-area-title').not($this).removeClass('is-open');
        $('.property-area-body').not($body).stop(true, true).slideUp(160);

        $this.toggleClass('is-open');
        $body.stop(true, true).slideToggle(160);
    });

    $(document).on('click', '.property-item-title', function (e) {
        e.stopPropagation();

        const $this = $(this);
        const $body = $this.next('.property-item-body');
        const $areaBody = $this.closest('.property-area-body');

        $areaBody.find('.property-item-title').not($this).removeClass('is-open');
        $areaBody.find('.property-item-body').not($body).stop(true, true).slideUp(160);

        $this.toggleClass('is-open');
        $body.stop(true, true).slideToggle(160);
    });

    $(document).on('click', '.property-look-row', function (e) {
        if ($(e.target).closest('a,button,input,select,textarea,label').length > 0) return;
        e.preventDefault();
        propertyLookDetail(this);
    });

    $(document).on('click', '.property-detail-tab', function () {
        const $this = $(this);
        const tab = $this.data('tab');
        const $wrap = $this.closest('.property-detail-wrap');

        $wrap.find('.property-detail-tab').removeClass('active');
        $this.addClass('active');

        $wrap.find('.property-detail-tab-panel').hide();
        $wrap.find('.property-detail-tab-panel[data-tab="' + tab + '"]').show();

        togglePropertyDetailAttach(tab);
        loadPropertyDetailTab(tab, $wrap);
    });

    $(document).on('click', '#btnTopbarQr', function () {
        openPropertyQrScanner();
    });

    $(document).on('click', '#btnPropertyQrClose, #propertyQrLayer', function (e) {
        if ($(e.target).closest('.property-qr-box').length > 0 && e.target.id !== 'btnPropertyQrClose') return;
        closePropertyQrScanner();
    });

    $(document).on('topbar:search', function () {
        loadPropertyLookList();
    });

    $('#searchKeyword').on('input', function () {
        loadPropertyLookList(true);
    });
});

let propertyLookListAll = [];
let propertyLookListView = [];
let propertyQrStream = null;
let propertyQrTimer = null;

//목록조회 + 검색
function loadPropertyLookList(isSearchOnly) {
    const keyword = ($('#searchKeyword').val() || '').toLowerCase();

    if (isSearchOnly) {
        propertyLookListView = propertyLookListAll.filter(function (row) {
            return [
                row.ppCode || '',
                row.ppAreaNm || '',
                row.ocFlagNm || '',
                row.ppOccodeNm || '',
                row.ppOcName || '',
                row.ppSecode1 || '',
                row.ppSeName || '',
                row.ppModel || '',
                row.ppStanSize || '',
                row.ppSerial || '',
                row.ppProviderNm || '',
                row.ppPrName || '',
                row.ppBuser || '',
                row.ppBuserNm || '',
                row.ppSaCode || '',
                row.ppSaNm || '',
                row.ppRemark || '',
                row.ppDate1 || '',
                row.ppDate2 || '',
                row.ppQty || ''
            ].join(' ').toLowerCase().indexOf(keyword) > -1;
        });

        renderPropertyLookList();
        return;
    }

    const data = {
        searchDate: cmGetToday('-'),
        searchBuserCd: $('#loginBuser').val()
    };

    cmAjax('/property/selectPropertyLookList.do', 'GET', data, true).done(function (list) {
        propertyLookListAll = list || [];
        loadPropertyLookList(true);
    });
}

//목록렌더
function renderPropertyLookList() {
    if (!propertyLookListView.length) {
        $('#property-look-list').html(`
            <div class="property-look-empty">
                ${$('#searchKeyword').val() ? '검색 결과가 없습니다.' : '목록이 없습니다.'}
            </div>
        `);
        return;
    }

    const areaMap = {};
    let html = '';

    for (let i = 0; i < propertyLookListView.length; i++) {
        const row = propertyLookListView[i] || {};
        const areaKey = row.ppArea || '미정';
        const itemKey = row.ppOccode || '미정';

        if (!areaMap[areaKey]) {
            areaMap[areaKey] = {
                areaNm: row.ppAreaNm || '미정',
                itemMap: {}
            };
        }

        if (!areaMap[areaKey].itemMap[itemKey]) {
            areaMap[areaKey].itemMap[itemKey] = {
                itemNm: row.ppOccodeNm || row.ppOcName || row.ppOccode || '미정',
                list: []
            };
        }

        areaMap[areaKey].itemMap[itemKey].list.push({
            index: i,
            row: row
        });
    }

    for (const areaKey in areaMap) {
        const area = areaMap[areaKey];
        let areaCnt = 0;

        for (const itemKey in area.itemMap) {
            areaCnt += area.itemMap[itemKey].list.length;
        }

        html += `
            <div class="property-area-group">
                <div class="property-tree-node property-area-title">
                    <span class="property-tree-toggle">›</span>
                    <span class="property-tree-name">${cmEscapeHtml(area.areaNm)}</span>
                    <span class="property-tree-count">${areaCnt}개</span>
                </div>
                <div class="property-area-body" style="display:none;">
        `;

        for (const itemKey in area.itemMap) {
            const item = area.itemMap[itemKey];

            if (item.list.length > 1) {
                html += `
                    <div class="property-item-group">
                        <div class="property-tree-node property-item-title">
                            <span class="property-tree-branch"></span>
                            <span class="property-tree-toggle">›</span>
                            <span class="property-tree-name">${cmEscapeHtml(item.itemNm)}</span>
                            <span class="property-tree-count">${item.list.length}개</span>
                        </div>
                        <div class="property-item-body" style="display:none;">
                `;

                for (let i = 0; i < item.list.length; i++) {
                    html += getPropertyLookRowHtml(item.list[i]);
                }

                html += `
                        </div>
                    </div>
                `;
            } else {
                html += getPropertyLookRowHtml(item.list[0]);
            }
        }

        html += `
                </div>
            </div>
        `;
    }

    $('#property-look-list').html(html);
}

//조사상태
function getPropertyLookStatus(row) {
    if (row.ppDate2) {
        return {
            text: '폐기',
            className: 'text-red'
        };
    }

    if (Number(row.chk || 0) === 1) {
        return {
            text: '조사완료',
            className: 'text-green'
        };
    }

    return {
        text: '미조사',
        className: 'text-yellow'
    };
}

//목록 row
function getPropertyLookRowHtml(item) {
    const row = item.row || {};
    const status = getPropertyLookStatus(row);

    return `
        <div class="property-look-row" data-index="${item.index}">
            <span class="property-row-name">${cmEscapeHtml(row.ppOccodeNm || row.ppOcName || '-')}</span>
            <span class="property-row-model">${cmEscapeHtml(row.ppModel || row.ppSeName || '')}</span>
            <span class="property-row-status ${status.className}">${cmEscapeHtml(status.text)}</span>
        </div>
    `;
}

//상세
function propertyLookDetail(rowEl) {
    const row = propertyLookListView[Number($(rowEl).data('index'))] || {};
    openPropertyLookDetail(row);
}

//상세 열기
function openPropertyLookDetail(row) {
    const status = getPropertyLookStatus(row);

    detailDrawerShow(`
        <div class="post-detail-head">
            <h3 class="post-detail-title">${cmEscapeHtml(row.ppOccodeNm || row.ppOcName || '')}</h3>
            <div class="property-detail-sub-line">
                <span class="property-detail-sub-left">
                    ${cmEscapeHtml(row.ppAreaNm || '미정')} · ${cmEscapeHtml(row.ocFlagNm || '기타')}
                </span>
                <span class="property-detail-status-chip ${status.className}">
                    ${cmEscapeHtml(status.text)}
                </span>
            </div>
        </div>

        <div class="property-detail-wrap" data-pp-code="${cmEscapeHtml(row.ppCode || '')}">
            <div class="property-detail-tab-wrap">
                <button type="button" class="property-detail-tab active" data-tab="asset">자산내역</button>
                <button type="button" class="property-detail-tab" data-tab="change">변경내역</button>
                <button type="button" class="property-detail-tab" data-tab="repair">수리내역</button>
                <button type="button" class="property-detail-tab" data-tab="stock">재고조사</button>
<!--                <button type="button" class="property-detail-tab" data-tab="depreciation">감가상각</button>-->
            </div>

            <div class="property-detail-tab-panel" data-tab="asset" data-loaded="Y">
                ${getPropertyAssetDetailHtml(row)}
            </div>
            <div class="property-detail-tab-panel" data-tab="change" data-loaded="N" style="display:none;">
                ${getPropertyEmptyTabHtml('변경내역')}
            </div>
            <div class="property-detail-tab-panel" data-tab="repair" data-loaded="N" style="display:none;">
                ${getPropertyEmptyTabHtml('수리내역')}
            </div>
            <div class="property-detail-tab-panel" data-tab="stock" data-loaded="N" style="display:none;">
                ${getPropertyEmptyTabHtml('재고조사')}
            </div>
            <div class="property-detail-tab-panel" data-tab="depreciation" data-loaded="N" style="display:none;">
                ${getPropertyEmptyTabHtml('감가상각')}
            </div>
        </div>
    `, true, $.trim(row.ppImgNum || ''));

    movePropertyDetailAttachToAsset();
    togglePropertyDetailAttach('asset');
}

//자산내역 상세 html
function getPropertyAssetDetailHtml(row) {
    return `
        <table class="property-detail-table">
            <colgroup>
                <col class="property-detail-th-col">
                <col>
                <col class="property-detail-qty-th-col">
                <col class="property-detail-qty-col">
            </colgroup>
            <tbody>
                <tr>
                    <th>품목명</th>
                    <td colspan="3">${cmEscapeHtml((row.ppOccodeNm || row.ppOcName || '') + (row.ppCode ? ' (' + row.ppCode + ')' : ''))}</td>
                </tr>
                <tr>
                    <th>상세명칭</th>
                    <td colspan="3">${cmEscapeHtml(row.ppSeName || '')}</td>
                </tr>
                <tr>
                    <th>모델명</th>
                    <td colspan="3">${cmEscapeHtml(row.ppModel || '')}</td>
                </tr>
                <tr>
                    <th>구입가격</th>
                    <td class="property-detail-money">${cmFormatAmount(row.ppAmount)}</td>
                    <th class="property-detail-sub-th">수량</th>
                    <td class="property-detail-qty">${cmFormatAmount(row.ppQty)}</td>
                </tr>
                <tr>
                    <th>규격/시리얼</th>
                    <td colspan="3">${cmEscapeHtml(getPropertyStanSerialText(row))}</td>
                </tr>
                <tr>
                    <th>구입처</th>
                    <td colspan="3">${cmEscapeHtml(row.ppProviderNm || '')}</td>
                </tr>
                <tr>
                    <th>제조사</th>
                    <td colspan="3">${cmEscapeHtml(row.ppPrName || '')}</td>
                </tr>
                <tr>
                    <th>관리부서</th>
                    <td colspan="3">${cmEscapeHtml(row.ppBuserNm || '')}</td>
                </tr>
                <tr>
                    <th>사용장소</th>
                    <td colspan="3">${cmEscapeHtml(row.ppAreaNm || '')}</td>
                </tr>
                <tr>
                    <th>관리사원</th>
                    <td colspan="3">${cmEscapeHtml(row.ppSaNm || '')}</td>
                </tr>
                <tr>
                    <th>취득구분</th>
                    <td colspan="3">${cmEscapeHtml(getPropertyGuFlagName(row.ppGuFlag))}</td>
                </tr>
                <tr>
                    <th>취득일자</th>
                    <td colspan="3">${cmEscapeHtml(formatDate(row.ppDate1))}</td>
                </tr>
                <tr>
                    <th>내용년수</th>
                    <td colspan="3">${cmEscapeHtml(row.ppYear || '')}</td>
                </tr>
                <tr>
                    <th>사용상태</th>
                    <td colspan="3">${cmEscapeHtml(getPropertyUseFlagName(row.ppUseFlag))}</td>
                </tr>
                <tr>
                    <th>시작일</th>
                    <td colspan="3">${cmEscapeHtml(formatDate(row.ccDate0 || row.ppDate1))}</td>
                </tr>
                <tr>
                    <th>종료일</th>
                    <td colspan="3">${cmEscapeHtml(formatDate(row.ppDate2))}</td>
                </tr>
                <tr>
                    <th>Code</th>
                    <td colspan="3">${cmEscapeHtml(row.ppCode ? '*' + row.ppCode + '*' : '')}</td>
                </tr>
                <tr>
                    <th>처분금액</th>
                    <td colspan="3" class="property-detail-money">${cmEscapeHtml(row.ppAmt1 || '')}</td>
                </tr>
                <tr>
                    <th>비고</th>
                    <td colspan="3">${cmNl2br(row.ppRemark || '')}</td>
                </tr>
            </tbody>
        </table>

        <div id="propertyAssetAttachArea" class="property-asset-attach-area"></div>
    `;
}

//자산내역 첨부 위치 이동
function movePropertyDetailAttachToAsset() {
    const $attachRoot = $('#detailDrawerAttachRoot');
    const $assetAttachArea = $('#propertyAssetAttachArea');

    if (!$attachRoot.length || !$assetAttachArea.length) return;

    $assetAttachArea.append($attachRoot);
}

//자산내역 첨부 표시
function togglePropertyDetailAttach(tab) {
    if (tab === 'asset') {
        $('#detailDrawerAttachRoot').show();
        return;
    }

    $('#detailDrawerAttachRoot').hide();
}

//상세 탭 조회
function loadPropertyDetailTab(tab, $wrap) {
    const ppCode = $wrap.data('pp-code');
    const $panel = $wrap.find('.property-detail-tab-panel[data-tab="' + tab + '"]');

    if ($panel.data('loaded') === 'Y') return;

    if (tab === 'change') {
        loadPropertyChangeList(ppCode, $panel, '1', '변경내역');
        return;
    }

    if (tab === 'repair') {
        loadPropertyChangeList(ppCode, $panel, '2', '수리내역');
        return;
    }

    if (tab === 'stock') {
        loadPropertyChangeList(ppCode, $panel, '3', '재고조사');
        return;
    }

    if (tab === 'depreciation') {
        $panel.data('loaded', 'Y');
    }
}

//변경/수리/재고조사 조회
function loadPropertyChangeList(ppCode, $panel, pcFlag, title) {
    if (!ppCode) {
        $panel.html(getPropertyEmptyTabHtml(title));
        $panel.data('loaded', 'Y');
        return;
    }

    cmAjax('/property/selectPropertyChangeList.do', 'GET', {
        ppCode: ppCode,
        pcFlag: pcFlag
    }, false).done(function (list) {
        if (pcFlag === '2') {
            $panel.html(getPropertyRepairListHtml(list || []));
        } else if (pcFlag === '3') {
            $panel.html(getPropertyStockListHtml(list || []));
        } else {
            $panel.html(getPropertyChangeListHtml(list || []));
        }

        $panel.data('loaded', 'Y');
    });
}

//변경내역 html
function getPropertyChangeListHtml(list) {
    if (!list.length) {
        return getPropertyEmptyTabHtml('변경내역');
    }

    let html = `
        <table class="property-detail-table property-history-table">
            <colgroup>
                <col class="property-history-date-col">
                <col>
                <col>
                <col>
            </colgroup>
            <thead>
                <tr>
                    <th>변경일자</th>
                    <th>변경전(장소)</th>
                    <th>변경후(장소)</th>
                    <th>변경사항</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < list.length; i++) {
        const row = list[i] || {};

        html += `
            <tr>
                <td>${cmEscapeHtml(formatDate(row.pcDate))}</td>
                <td>${cmEscapeHtml(row.pcArea1Nm || row.pcArea1 || '')}</td>
                <td>${cmEscapeHtml(row.pcArea2Nm || row.pcArea2 || '')}</td>
                <td>${cmNl2br(row.pcRemark || '')}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

//수리내역 html
function getPropertyRepairListHtml(list) {
    if (!list.length) {
        return getPropertyEmptyTabHtml('수리내역');
    }

    let html = `
        <table class="property-detail-table property-history-table">
            <colgroup>
                <col class="property-history-date-col">
                <col class="property-history-provider-col">
                <col class="property-history-item-col">
                <col class="property-history-amount-col">
                <col class="property-history-remark-col">
            </colgroup>
            <thead>
                <tr>
                    <th>수리일자</th>
                    <th>수리업체</th>
                    <th>수리품목</th>
                    <th>수리금액</th>
                    <th>수리내역</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < list.length; i++) {
        const row = list[i] || {};

        html += `
            <tr>
                <td>${cmEscapeHtml(formatDate(row.pcDate))}</td>
                <td>${cmEscapeHtml(row.pcRepairPrNm || row.pcRepairPrCD || '')}</td>
                <td>${cmEscapeHtml(row.pcRepairItem || '')}</td>
                <td class="property-detail-money">${cmFormatAmount(row.pcRepairAmt)}</td>
                <td>${cmNl2br(row.pcRemark || '')}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

//재고조사 html
function getPropertyStockListHtml(list) {
    if (!list.length) {
        return getPropertyEmptyTabHtml('재고조사');
    }

    let html = `
        <table class="property-detail-table property-history-table">
            <colgroup>
                <col class="property-history-date-col">
                <col class="property-history-type-col">
                <col class="property-history-user-col">
                <col class="property-history-place-col">
            </colgroup>
            <thead>
                <tr>
                    <th>조사일자</th>
                    <th>구분</th>
                    <th>조사자</th>
                    <th>장소</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < list.length; i++) {
        const row = list[i] || {};

        html += `
            <tr>
                <td>${cmEscapeHtml(formatDate(row.pcDate))}</td>
                <td>${cmEscapeHtml(getPropertyJumFlagName(row.pcJumFg))}</td>
                <td>${cmEscapeHtml(row.pcUserNm || '')}</td>
                <td>${cmEscapeHtml(row.pcArea2Nm || row.pcArea2 || row.pcArea1Nm || row.pcArea1 || '')}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

//빈 탭 html
function getPropertyEmptyTabHtml(title) {
    return `
        <div class="property-detail-empty-tab">
            ${cmEscapeHtml(title)} 데이터가 없습니다.
        </div>
    `;
}

//QR 스캔 열기
function openPropertyQrScanner() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        customAlert('알림', '카메라를 사용할 수 없습니다.', 'WARN');
        return;
    }

    if (!window.BarcodeDetector) {
        customAlert('알림', '현재 브라우저는 QR 스캔을 지원하지 않습니다.', 'WARN');
        return;
    }

    $('#propertyQrLayer').fadeIn(120);

    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: { ideal: 'environment' }
        },
        audio: false
    }).then(function (stream) {
        const video = document.getElementById('propertyQrVideo');

        propertyQrStream = stream;
        video.srcObject = stream;
        video.play();

        startPropertyQrScan(video);
    }).catch(function () {
        closePropertyQrScanner();
        customAlert('알림', '카메라 권한을 허용해 주세요.', 'WARN');
    });
}

//QR 스캔 시작
function startPropertyQrScan(video) {
    const detector = new BarcodeDetector({ formats: ['qr_code'] });

    if (propertyQrTimer) {
        clearInterval(propertyQrTimer);
    }

    propertyQrTimer = setInterval(function () {
        if (!video.videoWidth) return;

        detector.detect(video).then(function (codes) {
            if (!codes || !codes.length) return;

            const qrValue = $.trim(codes[0].rawValue || '');

            if (!qrValue) return;

            closePropertyQrScanner();
            openPropertyDetailByQr(qrValue);
        }).catch(function () {
            //스캔 실패는 무시
        });
    }, 350);
}

//QR 자산 상세 열기
function openPropertyDetailByQr(qrValue) {
    const ppCode = getPropertyQrCode(qrValue);

    if (!ppCode) {
        customAlert('알림', 'QR 코드 값이 없습니다.', 'WARN');
        return;
    }

    const matched = propertyLookListAll.find(function (row) {
        return String(row.ppCode || '').toUpperCase() === ppCode.toUpperCase();
    });

    if (!matched) {
        customAlert('알림', '해당 자산코드를 찾을 수 없습니다.', 'WARN');
        return;
    }

    openPropertyLookDetail(matched);

    //TODO 조사여부 업데이트 처리
    //예: updatePropertyLookCheck(matched.ppCode);
}

//QR 값 정리
function getPropertyQrCode(qrValue) {
    return $.trim(String(qrValue || '').replace(/\*/g, ''));
}

//QR 닫기
function closePropertyQrScanner() {
    if (propertyQrTimer) {
        clearInterval(propertyQrTimer);
        propertyQrTimer = null;
    }

    if (propertyQrStream) {
        propertyQrStream.getTracks().forEach(function (track) {
            track.stop();
        });
        propertyQrStream = null;
    }

    const video = document.getElementById('propertyQrVideo');

    if (video) {
        video.pause();
        video.srcObject = null;
    }

    $('#propertyQrLayer').fadeOut(120);
}

//규격/시리얼
function getPropertyStanSerialText(row) {
    if (row.ppStanSize && row.ppSerial) return row.ppStanSize + ' / ' + row.ppSerial;
    if (row.ppStanSize) return row.ppStanSize;
    if (row.ppSerial) return row.ppSerial;
    return '';
}

//취득구분명
function getPropertyGuFlagName(value) {
    if (String(value || '') === '1') return '신품';
    if (String(value || '') === '2') return '중고';
    return value || '';
}

//사용상태명
function getPropertyUseFlagName(value) {
    if (String(value || '') === '1') return '사용중';
    if (String(value || '') === '0') return '미사용';
    return value || '';
}

//재고조사 구분명
function getPropertyJumFlagName(value) {
    if (String(value || '') === '1') return '정기';
    if (String(value || '') === '2') return '수시';
    return value || '';
}

//날짜표시
function formatDate(value) {
    return value ? cmDateOnly(value).replaceAll('-', '/') : '';
}