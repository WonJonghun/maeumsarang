//공용 상세 화면
//<%@ include file="../common/detailDrawer.jspf" %> 를 jsp 추가하여 사용
//모바일 앱 환경인척하기위한 화면임
//스와이프 뒤로가기
//미리보기, 첨부파일
//파라미터 1.그려줄html 2.페이지위에그려주기YN 3.이미지번호
//detailDrawerShow(html, false);
//detailDrawerShow(html, false, afNum);
$(function () {
    if (!hasDrawerDom()) return;
    ensureImageViewerDom();
    bindDetailDrawerEvents();
});

let drawerHistoryPushed = false;
let imageViewerHistoryPushed = false;
let closingByPop = false;
let pendingDrawerClose = false;
let pendingDrawerClearBody = true;
let currentAfNum = null;

//DOM 체크
function hasDrawerDom() {
    return ($('#detailDrawer').length > 0 && $('#detailDrawerBackdrop').length > 0 && $('#detailDrawerBody').length > 0);
}

//레이아웃 생성
function ensureDrawerLayout() {
    if (!hasDrawerDom()) return false;

    if ($('#detailDrawerContent').length === 0) {
        $('#detailDrawerBody').empty().append($('<div/>', { id: 'detailDrawerContent' }));
    }
    if ($('#detailDrawerAttachRoot').length === 0) {
        $('#detailDrawerBody').append($('<div/>', { id: 'detailDrawerAttachRoot' }));
    }
    return true;
}

//첨부 DOM 생성
function ensureAttachDom() {
    if (!ensureDrawerLayout()) return false;

    if ($('#detailAttachArea').length > 0 && $('#detailAttachList').length > 0 && $('#detailImagePreview').length > 0) {
        return true;
    }

    const root = $('#detailDrawerAttachRoot').empty();

    $('<div/>', { id: 'detailImagePreview', class: 'detail-image-preview', style: 'display:none;' }).appendTo(root);

    $('<div/>', { id: 'detailAttachArea', class: 'detail-attach-area', style: 'display:none;' }).append(
        $('<div/>', { class: 'detail-attach-title' }).text('첨부파일'),
        $('<ul/>', { id: 'detailAttachList', class: 'detail-attach-list' })
    ).appendTo(root);

    return true;
}

//이미지 전체화면 DOM 생성
function ensureImageViewerDom() {
    if ($('#detailImageViewer').length > 0) return;

    $('body').append(
        $('<div/>', { id: 'detailImageViewer', class: 'detail-image-viewer', style: 'display:none;' }).append(
            $('<button/>', {
                type: 'button',
                class: 'detail-image-viewer-close',
                'aria-label': '닫기'
            }).html('&times;'),
            $('<img/>', {
                id: 'detailImageViewerImg',
                class: 'detail-image-viewer-img',
                alt: ''
            })
        )
    );
}

//첨부 초기화
function detailDrawerClearAttach() {
    currentAfNum = null;
    $('#detailAttachArea').hide();
    $('#detailAttachList').empty();
    $('#detailImagePreview').hide().empty();
}

//첨부 로드
function detailDrawerLoadAttach(afNum) {
    if (!ensureAttachDom()) return;

    if (!afNum || typeof cmAjax !== 'function') {
        detailDrawerClearAttach();
        return;
    }

    const reqAfNum = String(afNum);
    currentAfNum = reqAfNum;

    $('#detailAttachArea').hide();
    $('#detailAttachList').empty();
    $('#detailImagePreview').hide().empty();

    cmAjax('/attach/list.do', 'GET', { afNum: afNum }, false)
        .done(function (list) {
            if (String(currentAfNum || '') !== reqAfNum) return;
            if (!detailDrawerIsOpen()) return;

            if (!list || list.length === 0) {
                detailDrawerClearAttach();
                return;
            }

            const attachList = $('#detailAttachList');
            const imagePreview = $('#detailImagePreview');

            let hasImage = false;

            for (let i = 0; i < list.length; i++) {
                const item = list[i];

                const fileName = (item.afFileName && item.afFileName.length > 0)
                    ? item.afFileName
                    : (item.afNum + '.' + ('0' + item.afSeq).slice(-2));

                const downUrl = '/attach/download.do?afNum=' + encodeURIComponent(item.afNum)
                    + '&afSeq=' + encodeURIComponent(item.afSeq);

                $('<li/>', { class: 'detail-attach-item' })
                    .append(
                        $('<a/>', { class: 'detail-attach-link', href: downUrl, download: fileName }).text(fileName)
                    )
                    .append(
                        $('<span/>', { class: 'detail-attach-size' }).text(cmFormatKb(item.afFileSize))
                    )
                    .appendTo(attachList);

                if (cmIsImageFileName(fileName)) {
                    hasImage = true;

                    const viewUrl = '/attach/view.do?afNum=' + encodeURIComponent(item.afNum)
                        + '&afSeq=' + encodeURIComponent(item.afSeq);

                    $('<div/>', { class: 'detail-image-item' })
                        .append(
                            $('<img/>', { class: 'detail-image', src: viewUrl, alt: fileName, loading: 'lazy' })
                                .on('error', function () { $(this).closest('.detail-image-item').hide(); })
                        )
                        .appendTo(imagePreview);
                }
            }

            $('#detailAttachArea').show();
            if (hasImage) imagePreview.show();
        })
        .fail(function () {
            if (String(currentAfNum || '') !== reqAfNum) return;
            detailDrawerClearAttach();
        });
}

//드로워 표시, useHistory 있으면 뒤로가기하면 닫힘, afNum 첨부파일기능
function detailDrawerShow(html, useHistory, afNum) {
    if (!ensureDrawerLayout()) return;

    $('#detailDrawerContent').html(html || '');

    if (afNum) detailDrawerLoadAttach(afNum);
    else detailDrawerClearAttach();

    detailDrawerOpen(useHistory !== false);
}

//드로워 열기
function detailDrawerOpen(useHistory) {
    if (!hasDrawerDom()) return;

    if (useHistory && !drawerHistoryPushed) {
        history.pushState({ detailDrawerOpen: true }, document.title, location.href);
        drawerHistoryPushed = true;
    }

    $('#detailDrawerBackdrop').addClass('is-open');
    $('#detailDrawer').addClass('is-open').attr('aria-hidden', 'false').css('transform', '');
    $('body').addClass('drawer-open');
}

//드로워 닫기
function detailDrawerClose(useHistory, clearBody) {
    if (useHistory === undefined) useHistory = true;

    if (useHistory && detailImageViewerIsOpen() && imageViewerHistoryPushed && !closingByPop) {
        pendingDrawerClose = true;
        pendingDrawerClearBody = clearBody;
        history.back();
        return;
    }

    if (useHistory && drawerHistoryPushed && !closingByPop) {
        history.back();
        return;
    }

    closeDetailImageViewerUi();

    $('#detailDrawerBackdrop').removeClass('is-open');
    $('#detailDrawer').removeClass('is-open').attr('aria-hidden', 'true').css('transform', '');
    $('body').removeClass('drawer-open');

    if (clearBody !== false) $('#detailDrawerBody').empty();
    detailDrawerClearAttach();

    drawerHistoryPushed = false;
    imageViewerHistoryPushed = false;
    pendingDrawerClose = false;
    pendingDrawerClearBody = true;
}

//열림 여부
function detailDrawerIsOpen() {
    return $('#detailDrawer').hasClass('is-open');
}

//이미지 전체화면 상태 확인
function detailImageViewerIsOpen() {
    return $('#detailImageViewer').is(':visible');
}

//이미지 전체화면 열기
function openDetailImageViewer(src, alt) {
    if (!src) return;
    if (detailImageViewerIsOpen()) return;

    ensureImageViewerDom();

    $('#detailImageViewerImg')
        .attr('src', src)
        .attr('alt', alt || '');

    $('#detailImageViewer').fadeIn(120);
    $('body').addClass('image-viewer-open');

    history.pushState({ detailImageViewerOpen: true }, document.title, location.href);
    imageViewerHistoryPushed = true;
}

//이미지 전체화면 UI 닫기
function closeDetailImageViewerUi() {
    $('#detailImageViewer').hide();
    $('#detailImageViewerImg').attr('src', '').attr('alt', '');
    $('body').removeClass('image-viewer-open');
}

//이미지 전체화면 닫기
function closeDetailImageViewer() {
    if (!detailImageViewerIsOpen()) return;

    if (imageViewerHistoryPushed && !closingByPop) {
        history.back();
        return;
    }

    closeDetailImageViewerUi();
    imageViewerHistoryPushed = false;
}

//이벤트 바인딩
function bindDetailDrawerEvents() {
    //닫기 버튼/백드랍
    $(document).on('click', '#detailDrawerBackdrop,#detailDrawer .detail-drawer-close', function () {
        detailDrawerClose(true);
    });

    //미리보기 이미지 클릭 -> 전체화면
    $(document).on('click', '#detailImagePreview .detail-image', function () {
        openDetailImageViewer($(this).attr('src'), $(this).attr('alt'));
    });

    //전체화면 배경 클릭 닫기
    $(document).on('click', '#detailImageViewer', function () {
        closeDetailImageViewer();
    });

    //전체화면 닫기 버튼 클릭
    $(document).on('click', '#detailImageViewer .detail-image-viewer-close', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeDetailImageViewer();
    });

    //이미지 자체 클릭 시 닫힘 방지
    $(document).on('click', '#detailImageViewer .detail-image-viewer-img', function (e) {
        e.stopPropagation();
    });

    //ESC 닫기
    $(document).on('keydown', function (e) {
        if (e.key !== 'Escape') return;

        if (detailImageViewerIsOpen()) {
            closeDetailImageViewer();
            return;
        }

        if (detailDrawerIsOpen()) detailDrawerClose(true);
    });

    //뒤로가기(popstate) 연동
    window.addEventListener('popstate', function () {
        if (detailImageViewerIsOpen()) {
            closingByPop = true;
            closeDetailImageViewerUi();
            closingByPop = false;
            imageViewerHistoryPushed = false;

            if (pendingDrawerClose && detailDrawerIsOpen()) {
                closingByPop = true;
                detailDrawerClose(false, pendingDrawerClearBody);
                closingByPop = false;
            }

            pendingDrawerClose = false;
            pendingDrawerClearBody = true;
            return;
        }

        if (detailDrawerIsOpen()) {
            closingByPop = true;
            detailDrawerClose(false);
            closingByPop = false;
            drawerHistoryPushed = false;
        }

        imageViewerHistoryPushed = false;
        pendingDrawerClose = false;
        pendingDrawerClearBody = true;
    });

    //스와이프 닫기
    const drawerEl = document.getElementById('detailDrawer');
    if (!drawerEl) return;

    let active = false;
    let decided = false;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let lastDx = 0;
    let startTime = 0;
    let drawerW = 0;

    function getPt(e) {
        if (e && e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (e && e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    function resetSwipe() {
        active = false;
        decided = false;
        dragging = false;
        lastDx = 0;
        $('#detailDrawer').removeClass('is-dragging');
    }

    function onMove(e) {
        if (!active) return;
        if (!detailDrawerIsOpen()) {
            resetSwipe();
            offMoveEnd();
            return;
        }

        const pt = getPt(e);
        let dx = pt.x - startX;
        const dy = pt.y - startY;

        if (!decided) {
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

            decided = true;
            if (Math.abs(dy) > Math.abs(dx)) {
                resetSwipe();
                offMoveEnd();
                return;
            }
            dragging = true;
            $('#detailDrawer').addClass('is-dragging');
        }

        if (!dragging) return;

        if (dx < 0) dx = 0;
        lastDx = dx;

        drawerEl.style.transform = 'translate3d(' + dx + 'px,0,0)';

        if (e && e.cancelable) e.preventDefault();
    }

    function onEnd() {
        if (!active) return;

        const dt = Math.max(1, Date.now() - startTime);
        const velocity = lastDx / dt;

        const shouldClose = dragging && (lastDx >= (drawerW * 0.25) || velocity >= 0.8);

        $('#detailDrawer').removeClass('is-dragging');

        if (shouldClose) {
            drawerEl.style.transform = 'translate3d(' + drawerW + 'px,0,0)';
            setTimeout(function () {
                drawerEl.style.transform = '';
                detailDrawerClose(true);
            }, 260);

            resetSwipe();
            offMoveEnd();
            return;
        }

        drawerEl.style.transform = '';
        resetSwipe();
        offMoveEnd();
    }

    let bound = false;

    function onMoveBind(e) {
        onMove(e);
    }

    function onEndBind() {
        onEnd();
    }

    function onMoveEnd() {
        if (bound) return;
        document.addEventListener('touchmove', onMoveBind, { passive: false });
        document.addEventListener('touchend', onEndBind, { passive: true });
        document.addEventListener('touchcancel', onEndBind, { passive: true });
        document.addEventListener('mousemove', onMoveBind);
        document.addEventListener('mouseup', onEndBind);
        bound = true;
    }

    function offMoveEnd() {
        if (!bound) return;
        document.removeEventListener('touchmove', onMoveBind, { passive: false });
        document.removeEventListener('touchend', onEndBind, { passive: true });
        document.removeEventListener('touchcancel', onEndBind, { passive: true });
        document.removeEventListener('mousemove', onMoveBind);
        document.removeEventListener('mouseup', onEndBind);
        bound = false;
    }

    function onStart(e) {
        if (!detailDrawerIsOpen()) return;
        if (detailImageViewerIsOpen()) return;
        if (e && e.touches && e.touches.length > 1) return;
        if (e && e.type === 'mousedown' && e.button !== 0) return;

        const pt = getPt(e);

        active = true;
        decided = false;
        dragging = false;
        startX = pt.x;
        startY = pt.y;
        lastDx = 0;
        startTime = Date.now();
        drawerW = drawerEl.getBoundingClientRect().width || window.innerWidth || 360;

        onMoveEnd();
    }

    drawerEl.addEventListener('touchstart', onStart, { passive: true });
    drawerEl.addEventListener('mousedown', onStart);
}