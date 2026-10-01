$(function () {
    loadPcMenu();

    $('#pcMenuRetry').on('click', loadPcMenu);

    $('#pcProfileImage').on('error', function () {
        $(this).prop('hidden', true);
    });
    const profileImage = $('#pcProfileImage')[0];
    if (profileImage.complete && profileImage.naturalWidth === 0) {
        $(profileImage).prop('hidden', true);
    }

    $('#pcMenuRoots').on('click', '.pc-menu-root', function () {
        $('#pcMenuRoots .pc-menu-root').removeClass('is-active').attr('aria-pressed', 'false');
        $(this).addClass('is-active').attr('aria-pressed', 'true');
        $('#pcMenuTitle').text($(this).find('span').text());
        $('#pcMenuTree .pc-tree-panel').prop('hidden', true);
        $('#' + $(this).attr('aria-controls')).prop('hidden', false);
    });

    $('#pcMenuTree').on('click', '.pc-tree-toggle', function () {
        const expanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', String(!expanded));
        $('#' + $(this).attr('aria-controls')).prop('hidden', expanded);
    });

    $('#pcMenuTree').on('click', '.pc-menu-leaf', function () {
        detailPcMenu(this);
    });

    $('#pcSidebar').on('keydown', '.pc-menu-root, .pc-tree-toggle, .pc-menu-leaf', function (e) {
        const button = $(this);
        const buttons = button.hasClass('pc-menu-root')
            ? $('#pcMenuRoots .pc-menu-root')
            : $('#pcMenuTree .pc-tree-toggle, #pcMenuTree .pc-menu-leaf').filter(':visible');
        const index = buttons.index(this);

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            buttons.eq(Math.max(0, Math.min(buttons.length - 1, index + (e.key === 'ArrowDown' ? 1 : -1)))).trigger('focus');
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            buttons.eq(e.key === 'Home' ? 0 : buttons.length - 1).trigger('focus');
        } else if (e.key === 'ArrowRight' && button.hasClass('pc-tree-toggle')) {
            e.preventDefault();
            if (button.attr('aria-expanded') === 'false') button.trigger('click');
            else button.next().find('button').first().trigger('focus');
        } else if (e.key === 'ArrowLeft' && !button.hasClass('pc-menu-root')) {
            e.preventDefault();
            if (button.attr('aria-expanded') === 'true') button.trigger('click');
            else button.closest('.pc-tree-children').prev('.pc-tree-toggle').trigger('focus');
        }
    });

    $('#pcMenuToggle').on('click', function () {
        setPcSidebar($(this).attr('aria-expanded') !== 'true');
    });

    $('#pcMenuClose, #pcMenuBackdrop').on('click', function () {
        setPcSidebar(false);
        $('#pcMenuToggle').trigger('focus');
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('.pc-page').hasClass('is-menu-open')) {
            setPcSidebar(false);
            $('#pcMenuToggle').trigger('focus');
        }
    });

    const narrowScreen = window.matchMedia('(max-width: 900px)');
    $(narrowScreen).on('change', function () {
        const sidebarFocused = $('#pcSidebar')[0].contains(document.activeElement);
        const toggleFocused = document.activeElement === $('#pcMenuToggle')[0];
        setPcSidebar(false);
        if (narrowScreen.matches && sidebarFocused) $('#pcMenuToggle').trigger('focus');
        if (!narrowScreen.matches && toggleFocused) $('.pc-brand').trigger('focus');
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

        const icons = ['bi-building', 'bi-briefcase', 'bi-people', 'bi-clipboard-check', 'bi-folder2', 'bi-gear'];
        let rootsHtml = '';
        let panelsHtml = '';

        tree.forEach(function (root, index) {
            rootsHtml += `
                <li>
                    <button type="button" class="pc-menu-root" aria-pressed="false" aria-controls="pcMenuPanel${index}">
                        <i class="bi ${icons[index % icons.length]}" aria-hidden="true"></i>
                        <span>${cmEscapeHtml(root.ccMenuName)}</span>
                    </button>
                </li>`;
            panelsHtml += `
                <div id="pcMenuPanel${index}" class="pc-tree-panel" hidden>
                    <ul class="pc-tree-list">${buildPcMenuItems(root.children.length ? root.children : [root], String(index))}</ul>
                </div>`;
        });

        $('#pcMenuRoots').html(rootsHtml);
        $('#pcMenuTree').html(panelsHtml);
        $('#pcMenuStatus').prop('hidden', true);
        $('#pcMenuRoots .pc-menu-root').first().trigger('click');
    }).fail(function () {
        $('#pcMenuStatus').text('메뉴를 불러오지 못했습니다. 다시 시도해 주세요.');
        $('#pcMenuRetry').prop('hidden', false);
    }).always(function () {
        $('#pcMenuTree').attr('aria-busy', 'false');
    });
}

//메뉴 선택
function detailPcMenu(button) {
    $('#pcMenuTree .pc-menu-leaf').removeClass('is-active').removeAttr('aria-current');
    $(button).addClass('is-active').attr('aria-current', 'page');
    const menuName = $(button).find('span').text();
    $('#pcContent').html(`
        <h1 class="pc-content-heading">${cmEscapeHtml(menuName)}</h1>
        <p class="pc-content-description">준비 중인 화면입니다.</p>`);
    document.title = menuName + ' | 마음사랑병원 인트라넷';
    setPcSidebar(false);
    $('#pcContent').trigger('focus');
}

//메뉴 항목 생성
function buildPcMenuItems(items, parentId) {
    return items.map(function (item, index) {
        const id = parentId + '_' + index;
        if (item.children.length > 0) {
            return `
                <li>
                    <button type="button" class="pc-tree-toggle" aria-expanded="false" aria-controls="pcMenuGroup${id}">
                        <i class="bi bi-chevron-right" aria-hidden="true"></i>
                        <span>${cmEscapeHtml(item.ccMenuName)}</span>
                    </button>
                    <ul id="pcMenuGroup${id}" class="pc-tree-children" hidden>${buildPcMenuItems(item.children, id)}</ul>
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

//좁은 화면 메뉴 전환
function setPcSidebar(open) {
    $('.pc-page').toggleClass('is-menu-open', open);
    $('#pcMenuToggle').attr('aria-expanded', String(open)).attr('aria-label', open ? '업무 메뉴 닫기' : '업무 메뉴 열기');
    $('#pcContent').prop('inert', open);
}
