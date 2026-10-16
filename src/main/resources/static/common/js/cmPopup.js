$(function () {
    if (window.frameElement?.classList.contains('pc-work-frame')) return;

    //팝업 초기화
    const popup = $(`
        <dialog id="cmPopup" class="cm-popup" aria-labelledby="cmPopupTitle">
            <div class="cm-popup-heading">
                <strong id="cmPopupTitle"></strong>
                <button type="button" id="cmPopupClose" aria-label="팝업 닫기">
                    <i class="bi bi-x-lg" aria-hidden="true"></i>
                </button>
            </div>
            <div class="cm-popup-body">
                <p id="cmPopupLoading" class="cm-popup-loading" role="status">불러오는 중입니다.</p>
                <iframe id="cmPopupFrame" title="상세정보"></iframe>
            </div>
        </dialog>`).appendTo('body');
    const viewer = $(`
        <dialog id="cmImageViewer" class="cm-image-viewer" aria-label="이미지 확대 보기">
            <button type="button" id="cmImageViewerClose" aria-label="이미지 확대 닫기">
                <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
            <img id="cmImageViewerImage" alt="">
        </dialog>`).appendTo('body');
    let resizeObserver;

    //확대 이미지 닫기
    $('#cmImageViewerClose').on('click', function () {
        viewer[0].close();
    });
    viewer.on('click', function (event) {
        if (event.target === this) this.close();
    }).on('close', function () {
        $('#cmImageViewerImage').removeAttr('src').attr('alt', '');
    });

    //팝업 닫기
    $('#cmPopupClose').on('click', cmClosePopup);
    popup.on('click', function (event) {
        if (event.target !== this) return;
        const rect = this.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right
                || event.clientY < rect.top || event.clientY > rect.bottom) {
            cmClosePopup();
        }
    }).on('close', function () {
        $(document).trigger('cmPopup:closed');
        if (!this.open) {
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            $('#cmPopupFrame').removeAttr('srcdoc').attr('src', 'about:blank');
        }
    });

    //팝업 화면 로딩
    $('#cmPopupFrame').on('load', function () {
        $('#cmPopupLoading').prop('hidden', true);
        $(document).trigger('cmPopup:loaded', [this]);
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (!popup[0].open || !popup.data('autoHeight')) return;

        const body = this.contentDocument.body;
        const border = popup.outerWidth() - popup.innerWidth();
        $(body).css({
            width: 'fit-content',
            minWidth: 'min(' + (popup.data('width') - border) + 'px, 100%)',
            height: 'auto',
            minHeight: 0
        });
        resizeObserver = new ResizeObserver(function () {
            const width = body.scrollWidth + border;
            popup.css('width', Math.max(popup.data('width'), Math.ceil(width)) + 'px');
            const heading = popup.find('.cm-popup-heading').outerHeight()
                + popup.outerHeight() - popup.innerHeight();
            $(body).css('--cm-popup-min-height', Math.max(0, popup.data('height') - heading) + 'px');
            const height = body.scrollHeight + heading;
            popup.css('height', Math.max(popup.data('height'), Math.ceil(height)) + 'px');
        });
        resizeObserver.observe(body);
    });

    //팝업 내부 Esc
    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && window.frameElement
                && window.frameElement.id === 'cmPopupFrame') {
            event.preventDefault();
            window.parent.cmClosePopup();
        }
    });
});

//공통 레이어 팝업
function cmOpenPopup(url, width, height, params, title = '상세정보', autoHeight = false, className = '') {
    if (window.frameElement?.classList.contains('pc-work-frame')) {
        window.parent.cmOpenPopup(url, width, height, params, title, autoHeight, className);
        return;
    }
    const popup = $('#cmPopup');
    const previous = popup.data('request');
    if (previous) previous.abort();
    popup.attr('class', 'cm-popup ' + className);
    popup.data({width: width, height: height, autoHeight: autoHeight});
    popup.css({
        width: width + 'px',
        height: height + 'px'
    });
    $('#cmPopupTitle').text(title);
    $('#cmPopupLoading').prop('hidden', false);
    const request = cmAjaxHtml(url, 'GET', params, true);
    popup.data('request', request);
    request.done(function (html) {
        $('#cmPopupFrame').attr({
            srcdoc: html,
            title: title
        });
        popup[0].showModal();
    }).fail(function (xhr, status) {
        if (status === 'abort') return;
        customAlert('알림', '팝업 내용을 불러오지 못했습니다.', 'WARN');
    }).always(function () {
        popup.removeData('request');
    });
}

//공통 팝업 닫기
function cmClosePopup() {
    $('#cmPopup')[0].close();
}

//공통 이미지 확대
function cmOpenImageViewer(src, alt) {
    if (window.frameElement?.classList.contains('pc-work-frame')) {
        window.parent.cmOpenImageViewer(src, alt);
        return;
    }
    $('#cmImageViewerImage').attr({src: src, alt: alt});
    $('#cmImageViewer')[0].showModal();
}
