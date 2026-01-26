$(function () {
    const menu = $('#menu');
    const overlay = $('#menuOverlay');
    const searchInput = $('#menuSearch');
    const btnSearchClear = $('#btnMenuSearchClear');

    const winCode = $.trim($('#winCode').val() || '');
    const baseKey = $.trim($('#baseKey').val() || '');

    let menuLoaded = false;
    let menuTreeOrigin = [];
    let lastKeyword = '';
    let searchTimer = null;
    let menuHistoryPushed = false;
    let menuClosingByPop = false;

    let swipeStarted = false;
    let swipeLocked = false;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeLastX = 0;
    let swipeStartAt = 0;
    let menuW = 0;

    function resetSwipeStyles() {
        menu.removeClass('is-dragging').css({transform: '', transition: ''});
        overlay.css({opacity: ''});
    }

    function loadMenuAllIfNeeded() {
        if (menuLoaded) return $.Deferred().resolve().promise();

        menu.find('.menu-depth1').html('<li><button type="button" class="menu-depth1-btn is-active" disabled>로딩중</button></li>');
        menu.find('.menu-right').html('<div class="menu-panel is-active"><div class="menu-panel-title">로딩중</div><div class="menu-panel-line"></div></div>');

        return cmAjax('/menu/tree.do', 'GET', {keyword: 'Mobile'}, false).done(function (tree) {
            menuTreeOrigin = tree || [];
            menuLoaded = true;
            lastKeyword = '';
            renderMenuTree(menuTreeOrigin);
        });
    }

    function openMenu() {
        resetSwipeStyles();
        menu.addClass('open').attr('aria-hidden', 'false');
        overlay.prop('hidden', false);
        $('body').css('overflow', 'hidden');

        if (!menuHistoryPushed) {
            history.pushState({menuOpen: true}, document.title, location.href);
            menuHistoryPushed = true;
        }

        loadMenuAllIfNeeded().done(function () {
            const keyword = $.trim(searchInput.val() || '');
            toggleSearchClear(keyword);
            applyLocalSearch(keyword);
            applyCurrentActive();
        });
    }

    function closeMenu(useHistory) {
        if (useHistory === undefined) useHistory = true;

        resetSwipeStyles();

        if (useHistory && menuHistoryPushed && !menuClosingByPop) {
            history.back();
            return;
        }

        const activeEl = document.activeElement;
        if (activeEl && menu[0] && menu[0].contains(activeEl)) {
            const toggleBtn = $('#btnMenuToggle');
            if (toggleBtn.length) toggleBtn.focus();
            else activeEl.blur();
        }

        menu.removeClass('open').attr('aria-hidden', 'true');
        overlay.prop('hidden', true);
        $('body').css('overflow', '');
        menuHistoryPushed = false;
    }

    function bindSwipeToClose() {
        // pointer events first (covers touch/pen/mouse), fallback to touch events
        function getPoint(e) {
            const oe = e.originalEvent || e;
            if (oe.touches && oe.touches[0]) return oe.touches[0];
            if (oe.changedTouches && oe.changedTouches[0]) return oe.changedTouches[0];
            return oe;
        }

        function start(e) {
            if (!menu.hasClass('open')) return;

            if ($(e.target).is('input,textarea,select')) return;

            const oe = e.originalEvent || e;
            // mouse drag는 기본 비활성 (원하면 oe.pointerType === 'mouse'도 허용)
            if (oe.pointerType && oe.pointerType === 'mouse') return;

            const p = getPoint(e);
            swipeStarted = true;
            swipeLocked = false;
            swipeStartX = p.clientX;
            swipeStartY = p.clientY;
            swipeLastX = p.clientX;
            swipeStartAt = Date.now();
            menuW = menu.outerWidth() || 0;
        }

        function move(e) {
            if (!swipeStarted) return;

            const p = getPoint(e);
            const dx = p.clientX - swipeStartX;
            const dy = p.clientY - swipeStartY;

            // 수직 스크롤이면 스와이프 취소
            if (!swipeLocked) {
                if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;

                // 오른쪽 스와이프는 무시
                if (dx > 0) {
                    swipeStarted = false;
                    swipeLocked = false;
                    return;
                }

                if (Math.abs(dy) > Math.abs(dx) * 1.15) {
                    swipeStarted = false;
                    swipeLocked = false;
                    return;
                }
                swipeLocked = true;
                menu.addClass('is-dragging').css('transition', 'none');
            }

            swipeLastX = p.clientX;

            // 왼쪽(닫기) 방향만
            const tx = Math.max(-menuW, Math.min(0, dx));
            menu.css('transform', 'translateX(' + tx + 'px)');

            const ratio = menuW ? (1 - (Math.abs(tx) / menuW)) : 1;
            overlay.css('opacity', Math.max(0, Math.min(1, ratio)));

            // 가로 스와이프 중이면 화면 스크롤 방지
            e.preventDefault();
        }

        function end() {
            if (!swipeStarted) return;

            const dx = swipeLastX - swipeStartX;
            const dt = Math.max(1, Date.now() - swipeStartAt);
            const v = dx / dt; // px/ms

            const closeByDistance = dx < -(menuW * 0.35);
            const closeByVelocity = v < -0.5;

            swipeStarted = false;

            if (swipeLocked && (closeByDistance || closeByVelocity)) {
                resetSwipeStyles();
                closeMenu(true);
                return;
            }

            // 원위치
            menu.css('transition', 'transform .18s cubic-bezier(.2, .8, .2, 1)');
            menu.css('transform', 'translateX(0)');
            overlay.css('opacity', '1');

            setTimeout(function () {
                resetSwipeStyles();
            }, 200);
        }

        // pointer events
        menu.on('pointerdown', start);
        menu.on('pointermove', move);
        menu.on('pointerup pointercancel', end);

        // touch fallback (구형 브라우저)
        menu.on('touchstart', start);
        menu.on('touchmove', move);
        menu.on('touchend touchcancel', end);
    }

    $(window).on('popstate', function () {
        if (menu.hasClass('open')) {
            menuClosingByPop = true;
            closeMenu(false);
            menuClosingByPop = false;
        }
        menuHistoryPushed = false;
    });

    function renderMenuTree(tree) {
        const depth1 = menu.find('.menu-depth1');
        const right = menu.find('.menu-right');

        depth1.empty();
        right.empty();

        if (!tree || tree.length === 0) {
            depth1.html('<li><button type="button" class="menu-depth1-btn is-active" disabled>메뉴 없음</button></li>');
            right.html('<div class="menu-panel is-active"><div class="menu-panel-title">메뉴 없음</div><div class="menu-panel-line"></div></div>');
            return;
        }

        $.each(tree, function (i, root) {
            const panelId = 'menuPanel_' + (root.ccCode || i);

            depth1.append(
                '<li><button type="button" class="menu-depth1-btn' + (i === 0 ? ' is-active' : '') + '" data-target="#' + panelId + '">' +
                cmEscapeHtml(root.ccMenuName) +
                '</button></li>'
            );

            let panel = '<div id="' + panelId + '" class="menu-panel' + (i === 0 ? ' is-active' : '') + '">';
            panel += '<div class="menu-panel-title">' + cmEscapeHtml(root.ccMenuName) + '</div><div class="menu-panel-line"></div><ul class="menu-depth2">';

            $.each(root.children || [], function (_, d2) {
                const d2Name = cmEscapeHtml(d2.ccMenuName);
                const d2Code = cmEscapeHtml(d2.ccCode);
                const d2Url = cmEscapeHtml(d2.ccMenu2);
                const d2BaseKey = cmEscapeHtml(d2.ccBaseKey);
                const d2WinCode = cmEscapeHtml(d2.ccWinCode);
                const d2WinName = cmEscapeHtml(d2.ccWinName);
                const d3 = d2.children || [];

                if (d3.length > 0) {
                    panel += '<li class="menu-depth2-item">';
                    panel += '<button type="button" class="menu-depth2-btn" aria-expanded="false" data-code="' + d2Code + '" data-url="' + d2Url + '" data-base-key="' + d2BaseKey + '" data-win-code="' + d2WinCode + '" data-win-name="' + d2WinName + '">';
                    panel += '<span class="menu-txt">' + d2Name + '</span><span class="menu-depth2-right"><i class="bi bi-chevron-down menu-depth2-chevron"></i></span></button>';
                    panel += '<ul class="menu-depth3" style="display:none">';

                    $.each(d3, function (_, d3m) {
                        const d3Name = cmEscapeHtml(d3m.ccMenuName);
                        const d3Code = cmEscapeHtml(d3m.ccCode);
                        const d3Url = cmEscapeHtml(d3m.ccMenu2);
                        const d3BaseKey = cmEscapeHtml(d3m.ccBaseKey);
                        const d3WinCode = cmEscapeHtml(d3m.ccWinCode);
                        const d3WinName = cmEscapeHtml(d3m.ccWinName);

                        const d4 = d3m.children || [];
                        if (d4.length > 0) {
                            panel += '<li class="menu-depth3-item">';
                            panel += '  <div class="menu-depth3-row">';
                            panel += '    <a href="#" class="menu-depth3-link" data-code="' + d3Code + '" data-url="' + d3Url + '" data-base-key="' + d3BaseKey + '" data-win-code="' + d3WinCode + '" data-win-name="' + d3WinName + '">' + d3Name + '</a>';
                            panel += '    <button type="button" class="menu-depth3-toggle" aria-expanded="false"><i class="bi bi-chevron-down menu-depth3-chevron"></i></button>';
                            panel += '  </div>';
                            panel += '  <ul class="menu-depth4" style="display:none">';

                            $.each(d4, function (_, d4m) {
                                const d4Name = cmEscapeHtml(d4m.ccMenuName);
                                const d4Code = cmEscapeHtml(d4m.ccCode);
                                const d4Url = cmEscapeHtml(d4m.ccMenu2);
                                const d4BaseKey = cmEscapeHtml(d4m.ccBaseKey);
                                const d4WinCode = cmEscapeHtml(d4m.ccWinCode);
                                const d4WinName = cmEscapeHtml(d4m.ccWinName);
                                panel += '<li><a href="#" data-code="' + d4Code + '" data-url="' + d4Url + '" data-base-key="' + d4BaseKey + '" data-win-code="' + d4WinCode + '" data-win-name="' + d4WinName + '">' + d4Name + '</a></li>';
                            });

                            panel += '  </ul>';
                            panel += '</li>';
                        } else {
                            panel += '<li><a href="#" data-code="' + d3Code + '" data-url="' + d3Url + '" data-base-key="' + d3BaseKey + '" data-win-code="' + d3WinCode + '" data-win-name="' + d3WinName + '">' + d3Name + '</a></li>';
                        }
                    });

                    panel += '</ul></li>';
                } else {
                    panel += '<li class="menu-depth2-item"><a class="menu-depth2-link" href="#" data-code="' + d2Code + '" data-url="' + d2Url + '" data-base-key="' + d2BaseKey + '" data-win-code="' + d2WinCode + '" data-win-name="' + d2WinName + '"><span class="menu-txt">' + d2Name + '</span></a></li>';
                }
            });

            panel += '</ul></div>';
            right.append(panel);
        });

        const firstBtn = menu.find('.menu-depth1-btn').first();
        const firstTarget = firstBtn.data('target');

        menu.find('.menu-panel').hide().removeClass('is-active');
        $(firstTarget).show().addClass('is-active');
    }

    function applyLocalSearch(keyword) {
        if (!menuLoaded) return;

        const kw = $.trim(keyword || '');
        if (kw === lastKeyword) return;

        lastKeyword = kw;

        if (!kw) {
            renderMenuTree(menuTreeOrigin);
            return;
        }

        const kwLower = String(kw).toLowerCase();

        function filterNodes(nodes) {
            const res = [];

            $.each(nodes || [], function (_, n) {
                const nameLower = String(n.ccMenuName == null ? '' : n.ccMenuName).toLowerCase();
                const hit = nameLower.indexOf(kwLower) > -1;

                if (hit) {
                    res.push({
                        ccCode: n.ccCode,
                        ccMenuName: n.ccMenuName,
                        ccLevel: n.ccLevel,
                        ccWinName: n.ccWinName,
                        ccWinCode: n.ccWinCode,
                        ccMenu2: n.ccMenu2,
                        ccBaseKey: n.ccBaseKey,
                        children: (n.children || [])
                    });
                    return;
                }

                const children = filterNodes(n.children || []);
                if (children.length > 0) {
                    res.push({
                        ccCode: n.ccCode,
                        ccMenuName: n.ccMenuName,
                        ccLevel: n.ccLevel,
                        ccWinName: n.ccWinName,
                        ccWinCode: n.ccWinCode,
                        ccMenu2: n.ccMenu2,
                        ccBaseKey: n.ccBaseKey,
                        children: children
                    });
                }
            });

            return res;
        }

        renderMenuTree(filterNodes(menuTreeOrigin));
    }

    function resetDepth4(panel, speed) {
        panel.find('.menu-depth3-row').removeClass('is-active');
        panel.find('.menu-depth3-item').removeClass('is-open');
        panel.find('.menu-depth3-toggle').attr('aria-expanded', 'false');
        panel.find('.menu-depth3-link,.menu-depth4 a').removeClass('is-active');
        panel.find('.menu-depth4').stop(true, true).slideUp(speed);
    }

    function resetSelection(panel, speed) {
        panel.find('.menu-depth2-link,.menu-depth2-btn,.menu-depth3 > li > a,.menu-depth3-link,.menu-depth4 a').removeClass('is-active');
        resetDepth4(panel, speed);
    }

    function resetDepth2(panel, speed) {
        panel.find('.menu-depth2-btn')
            .removeClass('is-open')
            .attr('aria-expanded', 'false')
            .next('.menu-depth3')
            .stop(true, true)
            .slideUp(speed);
    }

    function movePage(el) {
        const target = $(el);

        const url = $.trim(target.data('url') || target.attr('data-url') || '');
        const baseKey = $.trim(target.data('baseKey') || target.attr('data-base-key') || '');
        const winCode = $.trim(target.data('winCode') || target.attr('data-win-code') || '');

        if (!url) {
            if (typeof customAlert === 'function') customAlert('경고', '이동할 메뉴 URL이 없습니다.', 'WARN');
            return;
        }

        if (typeof cmShowLdg === 'function') cmShowLdg();

        closeMenu();

        cmMovePage(url, {
            ccBaseKey: baseKey,
            ccWinCode: winCode
        });
    }

    $('#btnMenuToggle').on('click', function () {
        menu.hasClass('open') ? closeMenu(true) : openMenu();
    });

    $('#btnMenuTopClose').on('click', function () {
        closeMenu(true);
    });

    overlay.on('click', function () {
        closeMenu(true);
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') closeMenu(true);
    });

    searchInput.on('input', function () {
        const keyword = $.trim(searchInput.val() || '');
        toggleSearchClear(keyword);

        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            loadMenuAllIfNeeded().done(function () {
                applyLocalSearch($.trim(searchInput.val() || ''));
                applyCurrentActive();
            });
        }, 120);
    });

    searchInput.on('keydown', function (e) {
        if (e.key !== 'Enter') return;

        e.preventDefault();
        clearTimeout(searchTimer);

        loadMenuAllIfNeeded().done(function () {
            applyLocalSearch($.trim(searchInput.val() || ''));
            applyCurrentActive();
        });
    });

    menu.on('click', '.menu-depth1-btn', function () {
        const btn = $(this);
        const target = btn.data('target');

        btn.addClass('is-active');
        btn.closest('.menu-depth1').find('.menu-depth1-btn').not(btn).removeClass('is-active');

        menu.find('.menu-panel').removeClass('is-active').hide();
        $(target).addClass('is-active').show();

        const panel = $(target);
        resetSelection(panel, 0);
        resetDepth2(panel, 0);
    });

    menu.on('click', '.menu-depth2-link,.menu-depth2-btn', function (e) {
        e.preventDefault();

        const a = $(this);
        const panel = a.closest('.menu-panel');
        const depth3 = a.next('.menu-depth3');
        const hasChild = depth3.length > 0 && depth3.find('a').length > 0;

        if (hasChild) {
            const isOpen = a.hasClass('is-open') || a.attr('aria-expanded') === 'true';

            resetSelection(panel, 0);
            resetDepth2(panel, 180);

            a.addClass('is-active');

            if (!isOpen) {
                a.addClass('is-open').attr('aria-expanded', 'true');
                depth3.stop(true, true).slideDown(180);
            }
            return;
        }

        resetSelection(panel, 0);
        a.addClass('is-active');

        movePage(a);
    });

    menu.on('click', '.menu-depth3 > li > a', function (e) {
        e.preventDefault();

        const a = $(this);
        const panel = a.closest('.menu-panel');

        resetSelection(panel, 0);
        a.addClass('is-active');

        movePage(a);
    });

    menu.on('click', '.menu-depth3-toggle', function (e) {
        e.preventDefault();

        const btn = $(this);
        const panel = btn.closest('.menu-panel');
        const item = btn.closest('.menu-depth3-item');
        const row = item.find('> .menu-depth3-row');
        const link = row.find('.menu-depth3-link');
        const depth4 = item.find('> .menu-depth4');

        const isOpen = btn.attr('aria-expanded') === 'true';

        resetDepth4(panel, 180);
        if (isOpen) return;

        item.addClass('is-open');
        row.addClass('is-active');
        link.addClass('is-active');
        btn.attr('aria-expanded', 'true');
        depth4.stop(true, true).slideDown(180);
    });

    menu.on('click', '.menu-depth3-link', function (e) {
        e.preventDefault();
        $(this).closest('.menu-depth3-row').find('.menu-depth3-toggle').trigger('click');
    });

    menu.on('click', '.menu-depth4 a', function (e) {
        e.preventDefault();

        const a = $(this);
        const panel = a.closest('.menu-panel');
        const item = a.closest('.menu-depth3-item');
        const row = item.find('> .menu-depth3-row');
        const link = row.find('.menu-depth3-link');
        const toggle = row.find('.menu-depth3-toggle');
        const depth4 = item.find('> .menu-depth4');

        resetSelection(panel, 0);
        a.addClass('is-active');

        item.addClass('is-open');
        row.addClass('is-active');
        link.addClass('is-active');
        toggle.attr('aria-expanded', 'true');
        depth4.stop(true, true).slideDown(0);

        movePage(a);
    });

    function applyCurrentActive() {
        if (!menuLoaded) return;
        if (!winCode) return;

        const ctx = $.trim($('#appCtx').val() || '');
        const path = String(location.pathname || '');
        const relPath = (ctx && path.indexOf(ctx) === 0) ? path.substring(ctx.length) : path;
        if (relPath === '' || relPath === '/' || relPath === '/main.do' || relPath === '/main') return;

        function getWinCode(el) {
            return $.trim($(el).data('winCode') || $(el).attr('data-win-code') || '');
        }

        function getBaseKey(el) {
            return $.trim($(el).data('baseKey') || $(el).attr('data-base-key') || '');
        }

        function isMatch(el) {
            if (getWinCode(el) !== winCode) return false;
            if (!baseKey) return true;
            return getBaseKey(el) === baseKey;
        }

        function findFirstMatched(selector) {
            let found = null;
            menu.find(selector).each(function () {
                if (isMatch(this)) {
                    found = $(this);
                    return false;
                }
            });
            return found;
        }

        const target =
            findFirstMatched('.menu-depth4 a[data-win-code]') ||
            findFirstMatched('.menu-depth3 > li > a[data-win-code]') ||
            findFirstMatched('.menu-depth3-link[data-win-code]') ||
            findFirstMatched('.menu-depth2-link[data-win-code]') ||
            findFirstMatched('.menu-depth2-btn[data-win-code]');

        if (!target || target.length === 0) return;

        const panel = target.closest('.menu-panel');
        if (panel.length === 0) return;

        const panelId = panel.attr('id');
        if (panelId) {
            menu.find('.menu-panel').hide().removeClass('is-active');
            panel.show().addClass('is-active');

            const depth1Btn = menu.find('.menu-depth1-btn[data-target="#' + panelId + '"]');
            if (depth1Btn.length > 0) {
                menu.find('.menu-depth1-btn').removeClass('is-active');
                depth1Btn.addClass('is-active');
            }
        }

        resetSelection(panel, 0);
        resetDepth2(panel, 0);

        const depth2Item = target.closest('.menu-depth2-item');
        if (depth2Item.length > 0) {
            const depth2Btn = depth2Item.find('> .menu-depth2-btn');
            const depth3List = depth2Btn.next('.menu-depth3');

            if (depth2Btn.length > 0 && depth3List.length > 0) {
                depth2Btn.addClass('is-active is-open').attr('aria-expanded', 'true');
                depth3List.stop(true, true).slideDown(0);
            }
        }

        const depth3Item = target.closest('.menu-depth3-item');
        if (depth3Item.length > 0) {
            const row = depth3Item.find('> .menu-depth3-row');
            const link = row.find('.menu-depth3-link');
            const toggle = row.find('.menu-depth3-toggle');
            const depth4 = depth3Item.find('> .menu-depth4');

            depth3Item.addClass('is-open');
            row.addClass('is-active');
            link.addClass('is-active');
            toggle.attr('aria-expanded', 'true');
            depth4.stop(true, true).slideDown(0);
        }

        target.addClass('is-active');
    }

    function toggleSearchClear(keyword) {
        ($.trim(keyword || '') !== '') ? btnSearchClear.show() : btnSearchClear.hide();
    }

    btnSearchClear.on('click', function () {
        searchInput.val('');
        toggleSearchClear('');
        applyLocalSearch('');
        applyCurrentActive();
        searchInput.focus();
    });

    bindSwipeToClose();
});
