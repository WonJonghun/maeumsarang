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
function cmMoveWindow(winCode, winName) {
    const code = $.trim(winCode || '');
    const name = $.trim(winName || '');

    if (!code || code === 'undefined' || code === 'null') {
        if (typeof customAlert === 'function') customAlert('경고', '이동할 메뉴 코드가 없습니다.', 'WARN');
        return $.Deferred().reject('PARAM_MISSING').promise();
    }

    return cmAjax('/window/window.do', 'POST', { winCode: code, winName: name }, true).done(function (res) {
        let ok = false;
        let url = '';
        let msg = '';

        if (typeof res === 'string') {
            ok = true;
            url = res;
        } else if (res) {
            ok = (res.success === true || res.success === 'Y' || res.success === 1 || res.result === true || res.result === 'SUCCESS' || res.code === 'SUCCESS');
            url = res.url || (typeof res.data === 'string' ? res.data : (res.data && (res.data.url || res.data.redirectUrl)));
            msg = res.message || res.msg || res.errorMessage || '';
        }

        if (ok) {
            if (url) location.href = url; else location.reload();
        } else {
            if (typeof customAlert === 'function') customAlert('경고', msg || '권한이 없습니다.', 'WARN');
        }
    }).fail(function (xhr) {
        let msg = '처리 중 오류 발생';
        try {
            if (xhr && xhr.responseJSON) msg = xhr.responseJSON.message || xhr.responseJSON.msg || xhr.responseJSON.detail || msg;
        } catch (e) {}
        if (typeof customAlert === 'function') customAlert('경고', msg, 'WARN');
    });
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
