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
                row.ppSeName || '',
                row.ppModel || '',
                row.ppStanSize || '',
                row.ppDate1 || '',
                row.ppDate2 || '',
                row.ppQty || ''
            ].join(' ').toLowerCase().indexOf(keyword) > -1;
        });

        renderPropertyLookList();
        return;
    }

    const data = {
        searchDate: $('#searchToDate').val(),
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
                itemNm: row.ppOccodeNm || row.ppOccode || '미정',
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

//목록 row
function getPropertyLookRowHtml(item) {
    const row = item.row || {};
    const chkText = row.ppDate2 ? '폐기' : (Number(row.chk || 0) === 1 ? '조사완료' : '미조사');
    const chkClass = row.ppDate2 ? ' is-disuse' : (Number(row.chk || 0) === 1 ? ' is-done' : '');

    return `
        <div class="property-look-row" data-index="${item.index}">
            <span class="property-row-name">${cmEscapeHtml(row.ppOccodeNm || '-')}</span>
            <span class="property-row-model">${cmEscapeHtml(row.ppModel)}</span>
            <span class="property-row-status${chkClass}">${cmEscapeHtml(chkText)}</span>
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
    const chkText = row.ppDate2 ? '폐기' : (Number(row.chk || 0) === 1 ? '조사완료' : '미조사');

    detailDrawerShow(`
        <div class="post-detail-head">
            <h3 class="post-detail-title">${cmEscapeHtml(row.ppOccodeNm || '')}</h3>
            <div>
                ${cmEscapeHtml(row.ppAreaNm || '미정')} · ${cmEscapeHtml(row.ocFlagNm || '기타')} · ${cmEscapeHtml(chkText)}
            </div>
        </div>

        <div>
            <table>
                <tbody>
                    <tr>
                        <th>조사여부</th>
                        <td>${cmEscapeHtml(chkText)}</td>
                    </tr>
                    <tr>
                        <th>관리장소</th>
                        <td>${cmEscapeHtml(row.ppAreaNm || '미정')}</td>
                    </tr>
                    <tr>
                        <th>구분</th>
                        <td>${cmEscapeHtml(row.ocFlagNm || '기타')}</td>
                    </tr>
                    <tr>
                        <th>품목</th>
                        <td>${cmEscapeHtml(row.ppOccodeNm || '')}</td>
                    </tr>
                    <tr>
                        <th>상세명칭</th>
                        <td>${cmEscapeHtml(row.ppSeName || '')}</td>
                    </tr>
                    <tr>
                        <th>모델</th>
                        <td>${cmEscapeHtml(row.ppModel || '')}</td>
                    </tr>
                    <tr>
                        <th>규격</th>
                        <td>${cmEscapeHtml(row.ppStanSize || '')}</td>
                    </tr>
                    <tr>
                        <th>구입일</th>
                        <td>${cmEscapeHtml(formatDate(row.ppDate1))}</td>
                    </tr>
                    <tr>
                        <th>폐기일</th>
                        <td>${cmEscapeHtml(formatDate(row.ppDate2))}</td>
                    </tr>
                    <tr>
                        <th>수량</th>
                        <td>${Number(row.ppQty || 0).toLocaleString()}개</td>
                    </tr>
                    <tr>
                        <th>자산코드</th>
                        <td>${cmEscapeHtml(row.ppCode || '')}</td>
                    </tr>
                    <tr>
                        <th>관리장소코드</th>
                        <td>${cmEscapeHtml(row.ppArea || '')}</td>
                    </tr>
                    <tr>
                        <th>구분코드</th>
                        <td>${cmEscapeHtml(row.ocFlag || '')}</td>
                    </tr>
                    <tr>
                        <th>품목코드</th>
                        <td>${cmEscapeHtml(row.ppOccode || '')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `, true);
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
    return $.trim(String(qrValue || ''));
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

//날짜표시
function formatDate(value) {
    return value ? String(value).substring(0, 10) : '';
}