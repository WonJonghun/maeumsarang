function cmShowLdg() {
    $('#cmLoadingLayer').css('display', 'flex');
}

function cmCloseLdg() {
    $('#cmLoadingLayer').css('display', 'none');
}

function cmGetToday(param) {
    let d = new Date();
    let y = d.getFullYear();
    let m = ('0' + (d.getMonth() + 1)).slice(-2);
    let day = ('0' + d.getDate()).slice(-2);
    return y + param + m + param + day;
}

// YYYYMMDD 또는 YYYY-MM-DD 받고 subDays만큼 빼서 리턴
function cmSubDays(dateStr, subDays, param) {
    if (!dateStr) return '';
    subDays = parseInt(subDays, 10) || 0;
    param = (param == null) ? '' : String(param);

    const digits = String(dateStr).replace(/\D/g, '');
    if (digits.length !== 8) return '';

    const y = parseInt(digits.slice(0, 4), 10);
    const m = parseInt(digits.slice(4, 6), 10);
    const d = parseInt(digits.slice(6, 8), 10);

    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - subDays);

    const yy = dt.getFullYear();
    const mm = ('0' + (dt.getMonth() + 1)).slice(-2);
    const dd = ('0' + dt.getDate()).slice(-2);

    return '' + yy + param + mm + param + dd;
}

function cmFormatYmd(d, param) {
    if (!d) return '';
    let dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';

    let y = dt.getFullYear();
    let m = ('0' + (dt.getMonth() + 1)).slice(-2);
    let day = ('0' + dt.getDate()).slice(-2);

    let sep = (param === undefined || param === null) ? '-' : param;
    return y + sep + m + sep + day;
}

// 2025-04-30 00:00:00.0 -> 2025-04-30
function cmDateOnly(v) {
    const s = $.trim(v || '');
    if (!s) return '';
    return s.split('T')[0].split(' ')[0];
}

$(document).on('click', '.alert-class', function () {
    alert('준비중입니다.');
});

// adminKey 마지막 2자리(6,7번째)가 Y 하나라도 있으면 Y 반환(=부서조건 없이 검색)
function cmGetSearchBuserCd(adminKey) {
    const k = $.trim(adminKey || '');
    const ignore = (k.length >= 7 && (k.charAt(5) === 'Y' || k.charAt(6) === 'Y'));
    return ignore ? 'Y' : $.trim($('#loginBuser').val() || '');
}

// 페이지 이동
function cmMovePage(url, data) {
    let targetUrl = String(url || '');

    if (data && typeof data === 'object') {
        const qs = $.param(data);
        if (qs) targetUrl += (targetUrl.indexOf('?') > -1 ? '&' : '?') + qs;
    }

    location.href = targetUrl;
}

// XSS 방지용 HTML escape
function cmEscapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function (ch) {
        switch (ch) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '\'':
                return '&#39;';
            default:
                return ch;
        }
    });
}

// 줄바꿈을 <br/>로 변환
function cmNl2br(str) {
    return cmEscapeHtml(str).replace(/\r\n|\n|\r/g, '<br/>');
}

// 이미지 확장자 여부
function cmIsImageFileName(fileName) {
    if (!fileName) return false;
    let n = String(fileName).toLowerCase();
    return (n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png') || n.endsWith('.gif') || n.endsWith('.bmp') || n.endsWith('.webp'));
}

// 파일사이즈(단위 KB)
function cmFormatKb(kb) {
    let sizeKb = parseInt(kb || 0, 10);
    if (sizeKb <= 0) return '0 KB';

    let units = ['KB', 'MB', 'GB', 'TB'];
    let idx = Math.floor(Math.log(sizeKb) / Math.log(1024));
    idx = Math.min(idx, units.length - 1);

    let val = sizeKb / Math.pow(1024, idx);
    if (idx === 0) return sizeKb + ' KB';

    let s = val.toFixed(1).replace(/\.0$/, '');
    return s + ' ' + units[idx];
}

// 셀렉트박스 옵션넣기 (id, 제목, {키:네임,키:네임})
function cmSetSelectOptions(selectBox, title, optionMap) {
    const selectId = selectBox.attr('id');
    const titleBox = $('#selectBoxTitle' + selectId.replace('selectBox', ''));

    titleBox.text(title);
    selectBox.empty();

    selectBox.append($('<option/>', {
        value: '',
        text: '전체'
    }));

    $.each(optionMap, function (key, name) {
        selectBox.append($('<option/>', {
            value: key,
            text: name
        }));
    });
}

//숫자변환
function cmToNumber(value) {
    return Number(String(value == null ? '' : value).replace(/,/g, '')) || 0;
}

//금액포맷
function cmFormatAmount(value) {
    return cmToNumber(value).toLocaleString('ko-KR');
}

//이번달 시작일/마지막일
function cmGetThisMonthRange(param) {
    const sep = (param === undefined || param === null) ? '-' : param;
    const d = new Date();

    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    return {
        from: cmFormatYmd(first, sep),
        to: cmFormatYmd(last, sep)
    };
}