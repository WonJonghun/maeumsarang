$(function () {
    //초기화
    const saved = Number(localStorage.getItem('mhsPcZoom'));
    updatePcZoom(saved >= 80 && saved <= 150 && saved % 10 === 0 ? saved : 100);
    loadPcMenu();

    //화면 확대·축소
    $('#pcZoomOut, #pcZoomIn').on('click', function () {
        const zoom = Number($('#pcZoomValue').attr('data-zoom')) + (this.id === 'pcZoomIn' ? 10 : -10);
        updatePcZoom(zoom);
        localStorage.setItem('mhsPcZoom', String(zoom));
    });

    //메뉴 재조회
    $('#pcMenuRetry').on('click', loadPcMenu);

    //메뉴 고정·해제
    $('#pcMenuPin').on('click', function () {
        const pinned = $(this).attr('aria-pressed') !== 'true';
        $('.pc-page').toggleClass('is-sidebar-pinned', pinned);
        $(this)
            .attr('aria-pressed', String(pinned))
            .attr('aria-label', pinned ? '메뉴 고정 해제' : '메뉴 펼침 상태 고정')
            .attr('title', pinned ? '메뉴 고정 해제' : '메뉴 고정');
        $(this).find('i').toggleClass('bi-pin-angle', !pinned).toggleClass('bi-pin-angle-fill', pinned);
        setPcMenuOpen(true);
    });

    //메뉴·즐겨찾기 전환
    $('#pcMenuTab, #pcFavoritesTab').on('click', function () {
        const isMenu = this.id === 'pcMenuTab';
        $('#pcMenuTab').attr('aria-pressed', String(isMenu));
        $('#pcFavoritesTab').attr('aria-pressed', String(!isMenu));
        $('#pcMenuContents').prop('hidden', !isMenu);
        $('#pcFavoritesPanel').prop('hidden', isMenu);
        $('#pcMenuTitle').text(isMenu ? $('#pcMenuRoots .is-active span').text() : '즐겨찾기');
        if (isMenu) {
            detailPcMenuRoot($('#pcMenuRoots .is-active')[0]);
        }
        setPcMenuOpen(true);
    });

    //메뉴 펼침·접힘
    $('#pcSidebar')
        .on('mouseenter focusin', function () {
            setPcMenuOpen(true);
        })
        .on('mouseleave', function () {
            if ($('#pcMenuTab').attr('aria-pressed') === 'true') {
                detailPcMenuRoot($('#pcMenuRoots .is-active')[0]);
            }
            if (!$('.pc-page').hasClass('is-sidebar-pinned') && !$(this).find(':focus-visible').length) {
                setPcMenuOpen(false);
            }
        })
        .on('focusout', function (e) {
            if (!this.contains(e.relatedTarget)) {
                if ($('#pcMenuTab').attr('aria-pressed') === 'true') {
                    detailPcMenuRoot($('#pcMenuRoots .is-active')[0]);
                }
                setPcMenuOpen($(this).is(':hover'));
            }
        });

    //프로필 메뉴 전환
    $('#pcProfileToggle').on('click', function () {
        const expanded = $(this).attr('aria-expanded') !== 'true';
        $(this).attr('aria-expanded', String(expanded));
        $('#pcProfileMenu').prop('hidden', !expanded);
    });

    //바깥 클릭 시 프로필 닫기
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.pc-user').length) {
            $('#pcProfileToggle').attr('aria-expanded', 'false');
            $('#pcProfileMenu').prop('hidden', true);
        }
    });

    //포커스 이동 시 프로필 닫기
    $('.pc-user').on('focusout', function (e) {
        if (!this.contains(e.relatedTarget)) {
            $('#pcProfileToggle').attr('aria-expanded', 'false');
            $('#pcProfileMenu').prop('hidden', true);
        }
    });

    //프로필 기본 이미지
    $('#pcProfileImage, #pcProfileMenuImage').on('error', function () {
        $(this).off('error').attr('src', $(this).attr('data-fallback-src'));
    });
    $('#pcProfileImage, #pcProfileMenuImage').each(function () {
        if (this.complete && this.naturalWidth === 0) {
            $(this).trigger('error');
        }
    });

    //대메뉴 미리보기·선택
    $('#pcMenuRoots').on('mouseenter focusin click', '.pc-menu-root', function (e) {
        if (e.type === 'click') {
            $('#pcMenuRoots .pc-menu-root').removeClass('is-active').attr('aria-pressed', 'false');
            $(this).addClass('is-active').attr('aria-pressed', 'true');
        }
        detailPcMenuRoot(this);
        $('#pcMenuTab').attr('aria-pressed', 'true');
        $('#pcFavoritesTab').attr('aria-pressed', 'false');
        $('#pcMenuContents').prop('hidden', false);
        $('#pcFavoritesPanel').prop('hidden', true);
        setPcMenuOpen(true);
    });

    //하위 메뉴 클릭 시 대메뉴 선택
    $('#pcMenuTree').on('click', '.pc-tree-toggle, .pc-menu-leaf', function () {
        const panel = $(this).closest('.pc-tree-panel').attr('id');
        $('#pcMenuRoots .pc-menu-root[aria-controls="' + panel + '"]').trigger('click');
    });

    //하위 메뉴 펼침·접힘
    $('#pcMenuTree').on('click', '.pc-tree-toggle', function () {
        const expanded = $(this).attr('aria-expanded') === 'true';
        const children = $('#' + $(this).attr('aria-controls')).stop(true, true);
        const ms = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
        $(this).attr('aria-expanded', String(!expanded));
        if (expanded) {
            children.slideUp(ms, function () {
                $(this).prop('hidden', true).css('display', '');
            });
        } else {
            $(this).parent().siblings()
                .children('.pc-tree-toggle[aria-expanded="true"]')
                .filter(function () {
                    return !$(this).next('.pc-tree-children').find('.pc-menu-leaf.is-active').length;
                })
                .each(function () {
                    $(this).attr('aria-expanded', 'false');
                    $('#' + $(this).attr('aria-controls')).stop(true, true).slideUp(ms, function () {
                        $(this).prop('hidden', true).css('display', '');
                    });
                });
            children.prop('hidden', false).hide().slideDown(ms, function () {
                $(this).css('display', '');
            });
        }
    });

    //소메뉴 선택
    $('#pcMenuTree').on('click', '.pc-menu-leaf', function () {
        detailPcMenu(this);
    });

    //키보드 메뉴 이동
    $('#pcSidebar').on('keydown', '.pc-menu-root, .pc-tree-toggle, .pc-menu-leaf', function (e) {
        const button = $(this);
        const buttons = button.hasClass('pc-menu-root')
            ? $('#pcMenuRoots .pc-menu-root')
            : $('#pcMenuTree .pc-tree-toggle, #pcMenuTree .pc-menu-leaf').filter(':visible');
        const index = buttons.index(this);

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const next = index + (e.key === 'ArrowDown' ? 1 : -1);
            buttons.eq(Math.max(0, Math.min(buttons.length - 1, next))).trigger('focus');
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            buttons.eq(e.key === 'Home' ? 0 : buttons.length - 1).trigger('focus');
        } else if (e.key === 'ArrowRight' && button.hasClass('pc-tree-toggle')) {
            e.preventDefault();
            if (button.attr('aria-expanded') === 'false') {
                button.trigger('click');
            } else {
                button.next().find('button').first().trigger('focus');
            }
        } else if (e.key === 'ArrowLeft' && !button.hasClass('pc-menu-root')) {
            e.preventDefault();
            if (button.attr('aria-expanded') === 'true') {
                button.trigger('click');
            } else {
                button.closest('.pc-tree-children').prev('.pc-tree-toggle').trigger('focus');
            }
        }
    });

    //ESC로 메뉴 닫기
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            if (!$('#pcProfileMenu').prop('hidden')) {
                $('#pcProfileToggle').attr('aria-expanded', 'false').trigger('focus');
                $('#pcProfileMenu').prop('hidden', true);
                return;
            }
            $('#pcContent').trigger('focus');
            setPcMenuOpen(false);
        }
    });
});

//메뉴 조회
function loadPcMenu() {
    $('#pcMenuRoots').empty();
    $('#pcMenuTree').empty().attr('aria-busy', 'true');
    $('#pcMenuStatus').text('메뉴를 불러오는 중입니다.').prop('hidden', false);
    $('#pcMenuRetry').prop('hidden', true);

    cmAjax($('#pcSidebar').attr('data-menu-url'), 'GET', {}, false).done(function (tree) {
        if (tree.length === 0) {
            $('#pcMenuStatus').text('사용할 수 있는 메뉴가 없습니다.');
            return;
        }

        const icons = [
            [/^사내업무$/, 'bi-briefcase-fill'],
            [/^공통정보$/, 'bi-info-square-fill'],
            [/^개인정보$/, 'bi-person-circle'],
            [/^회계관리$/, 'bi-calculator-fill'],
            [/^예산관리$/, 'bi-pie-chart-fill'],
            [/^인사급여$/, 'bi-person-badge-fill'],
            [/^구매관리$/, 'bi-cart-fill'],
            [/^급식관리$/, 'bi-cup-hot-fill'],
            [/^자산관리$/, 'bi-box-seam-fill'],
            [/^매점관리$/, 'bi-shop'],
            [/^업무관리규정$/, 'bi-journal-text'],
            [/^도서관리$/, 'bi-book-fill'],
            [/^후원회관리$/, 'bi-heart-fill'],
            [/^EMR관리$/, 'bi-file-earmark-medical-fill'],
            [/^경영분석$/, 'bi-bar-chart-fill'],
            [/^편집$/, 'bi-pencil-square'],
            [/결재/, 'bi-pen-fill'],
            [/메일|쪽지/, 'bi-envelope-fill'],
            [/일정|당직/, 'bi-calendar-week-fill'],
            [/시설|비품|자산|자원/, 'bi-tools'],
            [/인사|직원|연락처/, 'bi-person-badge-fill'],
            [/게시|공지|자료/, 'bi-clipboard-fill'],
            [/설정|관리자|시스템/, 'bi-gear-fill'],
            [/업무|행정/, 'bi-briefcase-fill']
        ];
        let roots = '';
        let panels = '';

        tree.forEach(function (root, index) {
            const name = root.ccMenuName;
            const icon = icons.find(function (item) {
                return item[0].test(name);
            });
            const cls = name.length > 5 ? ' is-extra-long' : name.length > 4 ? ' is-long' : '';

            roots += `
                <li>
                    <button type="button" class="pc-menu-root${cls}"
                            aria-pressed="false" aria-controls="pcMenuPanel${index}">
                        <i class="bi ${icon ? icon[1] : 'bi-grid-fill'}" aria-hidden="true"></i>
                        <span>${cmEscapeHtml(name)}</span>
                    </button>
                </li>`;
            panels += `
                <div id="pcMenuPanel${index}" class="pc-tree-panel" hidden>
                    <ul class="pc-tree-list">
                        ${buildPcMenuItems(root.children.length ? root.children : [root], String(index))}
                    </ul>
                </div>`;
        });

        //메뉴 수에 맞춰 간격 조정
        $('#pcMenuRoots')
            .html(roots)
            .toggleClass('is-compact', tree.length >= 13)
            .css('--pc-menu-count', tree.length);
        $('#pcMenuTree').html(panels);
        $('#pcMenuStatus').prop('hidden', true);
        $('#pcMenuRoots .pc-menu-root').first().trigger('click');
        setPcMenuOpen($('#pcSidebar').is(':hover'));
    }).fail(function () {
        $('#pcMenuStatus').text('메뉴를 불러오지 못했습니다. 다시 시도해 주세요.');
        $('#pcMenuRetry').prop('hidden', false);
    }).always(function () {
        $('#pcMenuTree').attr('aria-busy', 'false');
    });
}

//대메뉴 표시
function detailPcMenuRoot(button) {
    $('#pcMenuTitle').text($(button).find('span').text());
    $('#pcMenuTree .pc-tree-panel').prop('hidden', true);
    $('#' + $(button).attr('aria-controls')).prop('hidden', false);
}

//메뉴 선택
function detailPcMenu(button) {
    $('#pcMenuTree .pc-menu-leaf').removeClass('is-active').removeAttr('aria-current');
    $(button).addClass('is-active').attr('aria-current', 'page');
    const ms = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
    $(button).closest('.pc-tree-panel')
        .find('.pc-tree-toggle[aria-expanded="true"]')
        .filter(function () {
            return !$(this).next('.pc-tree-children').find('.pc-menu-leaf.is-active').length;
        })
        .each(function () {
            $(this).attr('aria-expanded', 'false');
            $('#' + $(this).attr('aria-controls')).stop(true, true).slideUp(ms, function () {
                $(this).prop('hidden', true).css('display', '');
            });
        });

    const name = $(button).find('span').text();
    $('#pcContent').html(`
        <h1 class="pc-content-heading">${cmEscapeHtml(name)}</h1>
        <p class="pc-content-description">준비 중인 화면입니다.</p>`);
    document.title = name + ' | 마음사랑병원 인트라넷';
    $('#pcContent').trigger('focus');
}

//화면 배율 변경
function updatePcZoom(zoom) {
    $('.pc-page').css('--pc-ui-scale', zoom / 100);
    $('#pcZoomValue').attr('data-zoom', zoom).text(zoom + '%');
    $('#pcZoomOut').prop('disabled', zoom === 80);
    $('#pcZoomIn').prop('disabled', zoom === 150);
}

//메뉴 영역 전환
function setPcMenuOpen(open) {
    const expanded = open || $('.pc-page').hasClass('is-sidebar-pinned');
    $('#pcSidebar').toggleClass('is-sidebar-open', expanded);
    $('#pcMenuPanelContainer')
        .prop('inert', !expanded)
        .attr('aria-hidden', String(!expanded));
}

//메뉴 항목 생성
function buildPcMenuItems(items, parent) {
    return items.map(function (item, index) {
        const id = parent + '_' + index;

        if (item.children.length > 0) {
            return `
                <li>
                    <button type="button" class="pc-tree-toggle"
                            aria-expanded="false" aria-controls="pcMenuGroup${id}">
                        <span>${cmEscapeHtml(item.ccMenuName)}</span>
                        <i class="bi bi-chevron-right" aria-hidden="true"></i>
                    </button>
                    <ul id="pcMenuGroup${id}" class="pc-tree-children" hidden>
                        ${buildPcMenuItems(item.children, id)}
                    </ul>
                </li>`;
        }
        return `
            <li>
                <button type="button" class="pc-menu-leaf" data-code="${cmEscapeHtml(item.ccCode)}">
                    <span>${cmEscapeHtml(item.ccMenuName)}</span>
                </button>
            </li>`;
    }).join('');
}
