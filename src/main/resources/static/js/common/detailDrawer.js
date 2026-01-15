//공용 상세 화면
//<%@ include file="../common/detailDrawer.jspf" %> 를 jsp 추가하여 사용
//모바일 앱 환경인척하기위한 화면임
//스와이프 뒤로가기
//미리보기, 첨부파일
//사용법 1.그려줄html 2.페이지위에그려주기YN 3.이미지번호
//detailDrawerShow(html, false);
//detailDrawerShow(html, false, afNum);
(function ($) {
    'use strict';
    let detailDrawerHistoryPushed = false;
    let detailDrawerClosingByPop = false;

    let detailDrawerAttachAfNum = null;

    let swipe = {
        active: false,
        decided: false,
        dragging: false,
        startX: 0,
        startY: 0,
        lastDx: 0,
        startTime: 0,
        drawerW: 0,
        rafId: 0,
        rafPending: false
    };

    let swipeBound = false;
    let swipeHandlers = {
        touchMove: null,
        touchEnd: null,
        touchCancel: null,
        mouseMove: null,
        mouseUp: null
    };

    function ensureDetailDrawerDom() {
        return ($('#detailDrawer').length > 0 && $('#detailDrawerBackdrop').length > 0 && $('#detailDrawerBody').length > 0);
    }

    function ensureDetailDrawerLayout() {
        if (!ensureDetailDrawerDom()) return false;

        if ($('#detailDrawerContent').length > 0 && $('#detailDrawerAttachRoot').length > 0) return true;

        $('#detailDrawerBody')
            .empty()
            .append($('<div/>', {id: 'detailDrawerContent'}))
            .append($('<div/>', {id: 'detailDrawerAttachRoot'}));

        return true;
    }

    /* ================== 첨부파일(이미지 미리보기 포함) ↓================== */
    function ensureAttachDom() {
        if (!ensureDetailDrawerLayout()) return false;

        if ($('#detailAttachArea').length > 0 && $('#detailAttachList').length > 0 && $('#detailImagePreview').length > 0) {
            return true;
        }

        let attachRoot = $('#detailDrawerAttachRoot').empty();

        $('<div/>', {id: 'detailImagePreview', class: 'detail-image-preview', style: 'display:none;'}).appendTo(attachRoot);

        $('<div/>', {id: 'detailAttachArea', class: 'detail-attach-area', style: 'display:none;'}).append(
            $('<div/>', {class: 'detail-attach-title'}).text('첨부파일'),
            $('<ul/>', {id: 'detailAttachList', class: 'detail-attach-list'})
        ).appendTo(attachRoot);

        return true;
    }

    function clearAttachArea() {
        detailDrawerAttachAfNum = null;
        $('#detailAttachArea').hide();
        $('#detailAttachList').empty();
        $('#detailImagePreview').hide().empty();
    }

    window.detailDrawerClearAttach = function () {
        clearAttachArea();
    };

    window.detailDrawerLoadAttach = function (afNum) {
        if (!ensureAttachDom()) return;

        if (!afNum) {
            clearAttachArea();
            return;
        }

        if (typeof cmAjax !== 'function') {
            clearAttachArea();
            return;
        }

        let reqAfNum = String(afNum);
        detailDrawerAttachAfNum = reqAfNum;

        $('#detailAttachArea').hide();
        $('#detailAttachList').empty();
        $('#detailImagePreview').hide().empty();

        cmAjax('/attach/list.do', 'GET', {afNum: afNum}, false)
            .done(function (list) {
                if (String(detailDrawerAttachAfNum || '') !== reqAfNum) return;
                if (window.detailDrawerIsOpen && !window.detailDrawerIsOpen()) return;

                if (!list || list.length === 0) {
                    clearAttachArea();
                    return;
                }

                let attachList = $('#detailAttachList');
                let imagePreview = $('#detailImagePreview');

                attachList.empty();
                imagePreview.hide().empty();

                let hasImage = false;

                for (let i = 0; i < list.length; i++) {
                    let item = list[i];

                    let fileName = (item.afFileName && item.afFileName.length > 0)
                        ? item.afFileName
                        : (item.afNum + '.' + ('0' + item.afSeq).slice(-2));

                    let downUrl = '/attach/download.do?afNum=' + encodeURIComponent(item.afNum)
                        + '&afSeq=' + encodeURIComponent(item.afSeq);

                    $('<li/>', {class: 'detail-attach-item'})
                        .append(
                            $('<a/>', {
                                class: 'detail-attach-link',
                                href: downUrl,
                                download: fileName
                            }).text(fileName)
                        )
                        .append(
                            $('<span/>', {class: 'detail-attach-size'}).text(cmFormatKb(item.afFileSize))
                        )
                        .appendTo(attachList);

                    if (cmIsImageFileName(fileName)) {
                        hasImage = true;

                        let viewUrl = '/attach/view.do?afNum=' + encodeURIComponent(item.afNum)
                            + '&afSeq=' + encodeURIComponent(item.afSeq);

                        $('<div/>', {class: 'detail-image-item'})
                            .append(
                                $('<img/>', {
                                    class: 'detail-image',
                                    src: viewUrl,
                                    alt: fileName,
                                    loading: 'lazy'
                                }).on('error', function () {
                                    $(this).closest('.detail-image-item').hide();
                                })
                            )
                            .appendTo(imagePreview);
                    }
                }

                $('#detailAttachArea').show();
                if (hasImage) imagePreview.show();
            })
            .fail(function () {
                if (String(detailDrawerAttachAfNum || '') !== reqAfNum) return;
                clearAttachArea();
            });
    };

    window.detailDrawerShowWithAttach = function (html, useHistory, afNum) {
        window.detailDrawerShow(html, useHistory, afNum);
    };
    /* ================== 첨부파일(이미지 미리보기 포함) ↑================== */

    function getPointFromNativeEvent(e) {
        if (e && e.touches && e.touches.length > 0) return {x: e.touches[0].clientX, y: e.touches[0].clientY};
        if (e && e.changedTouches && e.changedTouches.length > 0) return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
        return {x: e.clientX, y: e.clientY};
    }

    function clearSwipeState() {
        swipe.active = false;
        swipe.decided = false;
        swipe.dragging = false;
        swipe.lastDx = 0;
        swipe.rafPending = false;
        if (swipe.rafId) {
            cancelAnimationFrame(swipe.rafId);
            swipe.rafId = 0;
        }
        $('#detailDrawer').removeClass('is-dragging');
    }

    function applyTransformRaf() {
        swipe.rafPending = false;
        let drawerEl = document.getElementById('detailDrawer');
        if (!drawerEl || !drawerEl.classList.contains('is-open')) return;

        let dx = swipe.lastDx;
        if (dx < 0) dx = 0;
        if (dx > swipe.drawerW) dx = swipe.drawerW;

        drawerEl.style.transform = 'translate3d(' + dx + 'px,0,0)';
    }

    function unbindSwipeMoveEnd() {
        if (!swipeBound) return;

        document.removeEventListener('touchmove', swipeHandlers.touchMove, {passive: false});
        document.removeEventListener('touchend', swipeHandlers.touchEnd, {passive: true});
        document.removeEventListener('touchcancel', swipeHandlers.touchCancel, {passive: true});
        document.removeEventListener('mousemove', swipeHandlers.mouseMove);
        document.removeEventListener('mouseup', swipeHandlers.mouseUp);

        swipeBound = false;
        swipeHandlers.touchMove = null;
        swipeHandlers.touchEnd = null;
        swipeHandlers.touchCancel = null;
        swipeHandlers.mouseMove = null;
        swipeHandlers.mouseUp = null;
    }

    function bindSwipeMoveEnd() {
        if (swipeBound) return;

        swipeHandlers.touchMove = function (e) { onSwipeMove(e); };
        swipeHandlers.touchEnd = function () { onSwipeEnd(); };
        swipeHandlers.touchCancel = function () { onSwipeEnd(); };
        swipeHandlers.mouseMove = function (e) { onSwipeMove(e); };
        swipeHandlers.mouseUp = function () { onSwipeEnd(); };

        document.addEventListener('touchmove', swipeHandlers.touchMove, {passive: false});
        document.addEventListener('touchend', swipeHandlers.touchEnd, {passive: true});
        document.addEventListener('touchcancel', swipeHandlers.touchCancel, {passive: true});
        document.addEventListener('mousemove', swipeHandlers.mouseMove);
        document.addEventListener('mouseup', swipeHandlers.mouseUp);

        swipeBound = true;
    }

    function onSwipeStartNative(e) {
        let drawerEl = document.getElementById('detailDrawer');
        if (!drawerEl || !drawerEl.classList.contains('is-open')) return;

        if (e && e.touches && e.touches.length > 1) return;
        if (e && e.type === 'mousedown' && e.button !== 0) return;

        let pt = getPointFromNativeEvent(e);

        swipe.active = true;
        swipe.decided = false;
        swipe.dragging = false;
        swipe.startX = pt.x;
        swipe.startY = pt.y;
        swipe.lastDx = 0;
        swipe.startTime = Date.now();
        swipe.drawerW = drawerEl.getBoundingClientRect().width || window.innerWidth || 360;

        bindSwipeMoveEnd();
    }

    function onSwipeMove(e) {
        if (!swipe.active) return;

        let drawerEl = document.getElementById('detailDrawer');
        if (!drawerEl || !drawerEl.classList.contains('is-open')) {
            clearSwipeState();
            unbindSwipeMoveEnd();
            return;
        }

        let pt = getPointFromNativeEvent(e);
        let dx = pt.x - swipe.startX;
        let dy = pt.y - swipe.startY;

        if (!swipe.decided) {
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

            swipe.decided = true;

            if (Math.abs(dy) > Math.abs(dx)) {
                clearSwipeState();
                unbindSwipeMoveEnd();
                return;
            }

            swipe.dragging = true;
            $('#detailDrawer').addClass('is-dragging');
        }

        if (!swipe.dragging) return;

        if (dx < 0) dx = 0;
        swipe.lastDx = dx;

        if (!swipe.rafPending) {
            swipe.rafPending = true;
            swipe.rafId = requestAnimationFrame(applyTransformRaf);
        }

        if (e && e.cancelable) e.preventDefault();
    }

    function onSwipeEnd() {
        if (!swipe.active) return;

        let drawerEl = document.getElementById('detailDrawer');
        if (!drawerEl || !drawerEl.classList.contains('is-open')) {
            clearSwipeState();
            unbindSwipeMoveEnd();
            return;
        }

        if (swipe.rafId) cancelAnimationFrame(swipe.rafId);
        swipe.rafId = 0;
        swipe.rafPending = false;

        let dt = Math.max(1, Date.now() - swipe.startTime);
        let velocity = swipe.lastDx / dt;

        let closeThreshold = swipe.drawerW * 0.25;
        let shouldClose = swipe.dragging && (swipe.lastDx >= closeThreshold || velocity >= 0.8);

        $('#detailDrawer').removeClass('is-dragging');

        if (shouldClose) {
            drawerEl.style.transform = 'translate3d(' + swipe.drawerW + 'px,0,0)';
            setTimeout(function () {
                drawerEl.style.transform = '';
                window.detailDrawerClose(true);
            }, 260);

            clearSwipeState();
            unbindSwipeMoveEnd();
            return;
        }

        drawerEl.style.transform = 'translate3d(0,0,0)';
        setTimeout(function () { drawerEl.style.transform = ''; }, 260);

        clearSwipeState();
        unbindSwipeMoveEnd();
    }

    function openDrawerDom() {
        clearSwipeState();
        let drawerEl = document.getElementById('detailDrawer');
        if (drawerEl) drawerEl.style.transform = '';

        $('#detailDrawerBackdrop').addClass('is-open');
        $('#detailDrawer').addClass('is-open').attr('aria-hidden', 'false');
        $('body').addClass('drawer-open');
    }

    function closeDrawerDom(clearBody) {
        clearSwipeState();
        let drawerEl = document.getElementById('detailDrawer');
        if (drawerEl) drawerEl.style.transform = '';

        $('#detailDrawerBackdrop').removeClass('is-open');
        $('#detailDrawer').removeClass('is-open').attr('aria-hidden', 'true');
        $('body').removeClass('drawer-open');

        if (clearBody !== false) $('#detailDrawerBody').empty();
        clearAttachArea();
    }

    window.detailDrawerSetHtml = function (html) {
        if (!ensureDetailDrawerLayout()) return;
        $('#detailDrawerContent').html(html || '');
    };

    window.detailDrawerSetElement = function (element) {
        if (!ensureDetailDrawerLayout()) return;
        $('#detailDrawerContent').empty().append(element);
    };

    //호출부
    window.detailDrawerShow = function (html, useHistory, afNum) {
        if (!ensureDetailDrawerLayout()) return;

        window.detailDrawerSetHtml(html || '');

        if (afNum) {
            window.detailDrawerLoadAttach(afNum);
        } else {
            clearAttachArea();
        }

        window.detailDrawerOpen(useHistory !== false);
    };

    window.detailDrawerOpen = function (useHistory) {
        if (!ensureDetailDrawerDom()) return;

        if (useHistory === undefined) useHistory = true;

        if (useHistory && !detailDrawerHistoryPushed) {
            history.pushState({detailDrawerOpen: true}, document.title, location.href);
            detailDrawerHistoryPushed = true;
        }

        openDrawerDom();
    };

    window.detailDrawerClose = function (useHistory, clearBody) {
        if (useHistory === undefined) useHistory = true;

        if (useHistory && detailDrawerHistoryPushed && !detailDrawerClosingByPop) {
            history.back();
            return;
        }

        closeDrawerDom(clearBody);
        detailDrawerHistoryPushed = false;
    };

    window.detailDrawerIsOpen = function () {
        return $('#detailDrawer').hasClass('is-open');
    };

    $(function () {
        if (!ensureDetailDrawerDom()) return;

        $(document).on('click', '#detailDrawerBackdrop,#detailDrawer .detail-drawer-close', function () {
            window.detailDrawerClose(true);
        });

        let drawerEl = document.getElementById('detailDrawer');
        if (drawerEl) {
            drawerEl.addEventListener('touchstart', onSwipeStartNative, {passive: true});
            drawerEl.addEventListener('mousedown', onSwipeStartNative);
        }

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && window.detailDrawerIsOpen && window.detailDrawerIsOpen()) {
                window.detailDrawerClose(true);
            }
        });

        window.addEventListener('popstate', function () {
            if ($('#detailDrawer').hasClass('is-open')) {
                detailDrawerClosingByPop = true;
                window.detailDrawerClose(false);
                detailDrawerClosingByPop = false;
            }
            detailDrawerHistoryPushed = false;
        });
    });
})(jQuery);
