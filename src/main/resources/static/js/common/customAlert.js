/** 사용법
 * customAlert("알림","진행하시겠습니까?","YN").then(function(ok){
 *      if(ok){ 확인 } else { 취소} });
 * customAlert("알림","저장 완료","CONFIRM");
 * customAlert("경고","권한이 없습니다","WARN");
 **/
(function (w, $) {
    let opened = false, queue = [], resolver = null;

    function ensureDom() {
        if ($('#uiAlert').length) return;
        let html = '';
        html += '<div id="uiAlertOverlay" class="ui-alert-overlay" hidden></div>';
        html += '<div id="uiAlert" class="ui-alert" hidden><div id="uiAlertCard" class="ui-alert-card" role="dialog" aria-modal="true"><div class="ui-alert-head"><div id="uiAlertTitle" class="ui-alert-title"></div><button type="button" id="uiAlertClose" class="ui-alert-x" aria-label="닫기"><i class="bi bi-x-lg"></i></button></div><div class="ui-alert-body"><div class="ui-alert-ico" aria-hidden="true"><i class="bi bi-exclamation-triangle-fill"></i></div><p id="uiAlertMsg" class="ui-alert-msg"></p></div><div id="uiAlertFoot" class="ui-alert-foot"></div></div></div>';
        $('body').append(html);
        $('#uiAlertOverlay').on('click', function () {
            close(false);
        });
        $('#uiAlertClose').on('click', function () {
            close(false);
        });
        $(document).on('keydown.uiAlert', function (e) {
            if (!opened) return;
            if (e.key === 'Escape') close(false);
        });
    }

    function buildButtons(type) {
        let alertFoot = $('#uiAlertFoot');
        alertFoot.empty();
        if (type === 'YN') {
            alertFoot.append('<button type="button" class="ui-alert-btn cancel" data-v="0">아니요</button>');
            alertFoot.append('<button type="button" class="ui-alert-btn ok" data-v="1">예</button>');
        } else {
            alertFoot.append('<button type="button" class="ui-alert-btn ok" data-v="1">확인</button>');
        }
        alertFoot.find('button').off('click').on('click', function () {
            close($(this).data('v') === 1);
        });
    }


    function openNow(item) {
        ensureDom();
        opened = true;
        let type = item.type || 'CONFIRM';
        $('#uiAlertTitle').text(item.title || '알림');
        $('#uiAlertMsg').text(item.msg || '');
        $('#uiAlertCard').removeClass('warn');
        if (type === 'WARN') $('#uiAlertCard').addClass('warn');
        buildButtons(type);
        $('#uiAlertOverlay').prop('hidden', false);
        $('#uiAlert').prop('hidden', false).addClass('open');
        resolver = item.resolve;
    }

    function close(result) {
        if (!opened) return;
        opened = false;
        $('#uiAlert').removeClass('open').prop('hidden', true);
        $('#uiAlertOverlay').prop('hidden', true);
        if (resolver) {
            let r = resolver;
            resolver = null;
            r(result);
        }
        if (queue.length) openNow(queue.shift());
    }

    w.customAlert = function (title, msg, type) {
        return new Promise(function (resolve) {
            let item = {title: title, msg: msg, type: type, resolve: resolve};
            if (opened) queue.push(item); else openNow(item);
        });
    };
})(window, jQuery);
