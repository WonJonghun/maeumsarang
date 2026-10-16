$(function () {
    if ($('body').hasClass('pc-work-page')) {
        if (window.frameElement?.classList.contains('pc-work-frame')) {
            setTimeout(function () {
                window.parent.$(window.parent.document).trigger('pcWorkTab:ready', [window.frameElement]);
            }, 0);
        }
        return;
    }

    //초기화
    addPcWorkTab({key: 'main', name: '메인', url: '/pc/main.do', params: {}, state: null});
    let active = 'main';
    try {
        const saved = JSON.parse(sessionStorage.getItem(pcWorkStorage));
        if (saved) {
            saved.items.filter(item => item.key !== 'main').forEach(addPcWorkTab);
            pcWorkTabs.items[0].state = saved.items.find(item => item.key === 'main')?.state ?? null;
            active = saved.active;
        }
    } catch (error) {
        sessionStorage.removeItem(pcWorkStorage);
    }
    if ($('body').attr('data-start-tab') === 'board') {
        openPcWorkTab('board', '전자게시판', '/pc/notice/board.do', {
            ccWinCode: 'w_gongji_list',
            ccBaseKey: $('body').attr('data-base-key')
        });
        history.replaceState(null, '', $('.pc-brand').attr('href'));
    } else {
        selectPcWorkTab(pcWorkTabs.items.some(item => item.key === active) ? active : 'main');
    }

    //탭 선택·닫기
    $('#pcWorkTabs').on('click', '[data-tab-key]', function () {
        selectPcWorkTab($(this).attr('data-tab-key'));
    }).on('click', '[data-close-key]', function () {
        closePcWorkTab($(this).attr('data-close-key'));
    }).on('mousedown', '.pc-work-tab', function (event) {
        if (event.button === 1) event.preventDefault();
    }).on('auxclick', '.pc-work-tab', function (event) {
        if (event.button !== 1) return;
        event.preventDefault();
        closePcWorkTab($(this).find('[data-tab-key]').attr('data-tab-key'));
    }).on('keydown', '[role="tab"]', function (event) {
        const buttons = $('#pcWorkTabs [role="tab"]');
        const index = buttons.index(this);
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'Delete') {
            closePcWorkTab($(this).attr('data-tab-key'));
            return;
        } else return;
        event.preventDefault();
        selectPcWorkTab(buttons.eq(next).attr('data-tab-key'));
        $('#pcWorkTabs [aria-selected="true"]').trigger('focus');
    });

    //로고로 메인 이동·데이터 갱신
    $('.pc-brand').on('click', function (event) {
        event.preventDefault();
        const panel = $('#pcWorkPanel-main');
        const frame = panel.find('iframe')[0];
        selectPcWorkTab('main');
        if (frame && panel.attr('aria-busy') === 'false') {
            const child = frame.contentWindow;
            child.$(child.document).trigger('pcWorkTab:refresh');
        }
    });

    //탭 영역 크기 변경 시 선택 탭 표시
    new ResizeObserver(function () {
        $('#pcWorkTabs [aria-selected="true"]')[0]?.scrollIntoView({block: 'nearest', inline: 'nearest'});
    }).observe($('#pcWorkTabs')[0]);

    //업무 화면 로딩
    $('#pcWorkPanels')[0].addEventListener('load', function (event) {
        const frame = event.target;
        if (!frame.classList.contains('pc-work-frame')) return;
        $(frame).closest('.pc-work-panel').attr('aria-busy', 'false');
        const child = frame.contentWindow;
        if (child.location.pathname.startsWith('/login/')) {
            pcWorkTabs.leaving = true;
            sessionStorage.removeItem(pcWorkStorage);
            window.location.replace(child.location.href);
            return;
        }
    }, true);
    $(document).on('pcWorkTab:ready', function (event, frame) {
        const child = frame.contentWindow;
        const pending = $(frame).data('openParams');
        if (pending && child.$) {
            child.$(child.document).trigger('pcWorkTab:open', [pending]);
            $(frame).removeData('openParams');
        }
        $(frame).closest('.pc-work-panel').attr('aria-busy', 'false');
    });

    //공통 팝업 조회 결과 전달
    $(document).on('cmPopup:loaded cmPopup:closed', function (event, frame) {
        $('#pcWorkPanels .pc-work-frame').each(function () {
            const child = this.contentWindow;
            if (child.$) child.$(child.document).trigger(event.type, [frame]);
        });
    });

    //새로고침 시 열린 탭·화면 상태 저장
    $(window).on('beforeunload', function () {
        if (pcWorkTabs.leaving) return;
        $('#pcWorkPanels .pc-work-frame').each(function () {
            const child = this.contentWindow;
            if (child.$) child.$(child.document).trigger('pcWorkTab:save');
        });
        savePcWorkTabs();
    });

    //로그아웃 시 작업 탭 초기화
    $('.pc-profile-menu form').on('submit', function () {
        pcWorkTabs.leaving = true;
        sessionStorage.removeItem(pcWorkStorage);
    });
});

const pcWorkTabs = {items: [], active: '', leaving: false};
const pcWorkStorage = 'mhsPcWorkTabs:' + $('.pc-workspace-page').attr('data-user-id');

//업무 탭 추가
function addPcWorkTab(data) {
    if (pcWorkTabs.items.some(item => item.key === data.key)) return;
    if (data.url) {
        const url = new URL(data.url, window.location.href);
        if (url.origin !== window.location.origin || !url.pathname.startsWith('/pc/')) return;
    }
    const item = {
        key: data.key,
        name: data.name,
        url: data.url,
        params: data.params,
        state: data.state
    };
    pcWorkTabs.items.push(item);
    $('#pcWorkPanels').append(`
        <section id="pcWorkPanel-${cmEscapeHtml(encodeURIComponent(item.key))}" class="pc-work-panel"
                 role="${item.key === 'main' ? 'region' : 'tabpanel'}"
                 ${item.key === 'main' ? 'aria-label="메인"' : `aria-labelledby="pcWorkTab-${cmEscapeHtml(encodeURIComponent(item.key))}"`} hidden>
            ${item.url ? '' : `
                <div class="pc-work-placeholder">
                    <h1 class="pc-content-heading">${cmEscapeHtml(item.name)}</h1>
                    <p class="pc-content-description">준비 중인 화면입니다.</p>
                </div>`}
        </section>`);
}

//공통 업무 탭 열기
function openPcWorkTab(key, name, url = '', params = {}) {
    if (window.frameElement?.classList.contains('pc-work-frame')) {
        window.parent.openPcWorkTab(key, name, url, params);
        return;
    }
    const item = pcWorkTabs.items.find(item => item.key === key);
    if (!item) {
        addPcWorkTab({key, name, url, params, state: null});
    } else if (Object.keys(params).length) {
        if (JSON.stringify(item.params) !== JSON.stringify(params)) item.state = null;
        item.params = params;
        const frame = document.getElementById('pcWorkPanel-' + encodeURIComponent(key)).querySelector('iframe');
        if (frame) {
            const child = frame.contentWindow;
            if ($(frame).closest('.pc-work-panel').attr('aria-busy') === 'false' && child.$) {
                child.$(child.document).trigger('pcWorkTab:open', [params]);
            } else {
                $(frame).data('openParams', params);
            }
        }
    }
    selectPcWorkTab(key);
}

//업무 탭 전환
function selectPcWorkTab(key) {
    const item = pcWorkTabs.items.find(item => item.key === key);
    if (!item) return;
    const previous = document.getElementById('pcWorkPanel-' + encodeURIComponent(pcWorkTabs.active));
    const child = previous?.querySelector('iframe')?.contentWindow;
    if (child?.$ && pcWorkTabs.active !== key) {
        child.$(child.document).trigger('pcWorkTab:hide').trigger('pcWorkTab:save');
    }
    pcWorkTabs.active = key;
    $('#pcWorkPanels .pc-work-panel').prop('hidden', true);
    const panel = $(document.getElementById('pcWorkPanel-' + encodeURIComponent(key))).prop('hidden', false);
    if (item.url && !panel.find('iframe').length) {
        const url = new URL(item.url, window.location.href);
        Object.entries(item.params).forEach(([name, value]) => url.searchParams.set(name, value));
        url.searchParams.set('pcFrame', 'true');
        panel.attr('aria-busy', 'true').append(`
            <iframe class="pc-work-frame" title="${cmEscapeHtml(item.name)}" data-tab-key="${cmEscapeHtml(key)}"
                    data-state="${cmEscapeHtml(JSON.stringify(item.state))}" src="${cmEscapeHtml(url.href)}"></iframe>
            <div class="cm-loading-layer pc-work-loading" role="status" aria-label="화면을 불러오는 중입니다.">
                <div class="cm-loading-spinner"></div>
            </div>`);
    }
    $('#pcWorkTabs').html(pcWorkTabs.items.filter(tab => tab.key !== 'main').map(tab => {
        const selected = tab.key === key;
        return `
            <div class="pc-work-tab${selected ? ' is-active' : ''}" role="presentation">
                <button type="button" id="pcWorkTab-${cmEscapeHtml(encodeURIComponent(tab.key))}" class="pc-work-tab-select" role="tab"
                        data-tab-key="${cmEscapeHtml(tab.key)}" aria-selected="${selected}" tabindex="${selected ? 0 : -1}"
                        aria-controls="pcWorkPanel-${cmEscapeHtml(encodeURIComponent(tab.key))}" title="${cmEscapeHtml(tab.name)}">
                    <i class="bi bi-window" aria-hidden="true"></i><span>${cmEscapeHtml(tab.name)}</span>
                </button>
                <button type="button" class="pc-work-tab-close" data-close-key="${cmEscapeHtml(tab.key)}"
                        tabindex="${selected ? 0 : -1}" aria-label="${cmEscapeHtml(tab.name)} 닫기">
                    <i class="bi bi-x-lg" aria-hidden="true"></i>
                </button>
            </div>`;
    }).join(''));
    $('#pcWorkTabs [aria-selected="true"]')[0]?.scrollIntoView({block: 'nearest', inline: 'nearest'});
    document.title = item.name + ' | 마음사랑병원 인트라넷';
    syncPcWorkMenu();
    savePcWorkTabs();
}

//업무 탭 닫기
function closePcWorkTab(key) {
    if (key === 'main') return;
    const index = pcWorkTabs.items.findIndex(item => item.key === key);
    document.getElementById('pcWorkPanel-' + encodeURIComponent(key)).remove();
    pcWorkTabs.items.splice(index, 1);
    selectPcWorkTab(pcWorkTabs.active === key ? pcWorkTabs.items[Math.max(0, index - 1)].key : pcWorkTabs.active);
    const selected = $('#pcWorkTabs [aria-selected="true"]');
    (selected.length ? selected : $('.pc-brand')).trigger('focus');
}

//업무 탭 저장
function savePcWorkTabs() {
    sessionStorage.setItem(pcWorkStorage, JSON.stringify({items: pcWorkTabs.items, active: pcWorkTabs.active}));
}

//업무 화면 상태 저장
function savePcWorkTabState(key, state, params) {
    const item = pcWorkTabs.items.find(item => item.key === key);
    item.state = state;
    if (params) item.params = params;
}

//현재 탭과 업무 메뉴 연결
function syncPcWorkMenu() {
    const item = pcWorkTabs.items.find(item => item.key === pcWorkTabs.active);
    const menus = $('#pcMenuTree .pc-menu-leaf, #pcFavoritesTree .pc-menu-leaf');
    menus.removeClass('is-active').removeAttr('aria-current');
    let current;
    if (item.key === 'board') {
        const flag = Number(item.state?.flag ?? item.params.ccBaseKey);
        const base = flag >= 3 && flag <= 5 ? 3 : flag;
        current = menus.filter(function () {
            return $(this).attr('data-win-code') === 'w_gongji_list' && Number($(this).attr('data-base-key')) === base;
        });
    } else {
        current = menus.filter(function () {
            return item.key === 'menu-' + $(this).attr('data-code');
        });
    }
    if (!current.length) return;
    const expanded = $('#pcSidebar').hasClass('is-sidebar-open');
    current.addClass('is-active').attr('aria-current', 'page');
    current.parents('.pc-tree-children').prop('hidden', false).prev('.pc-tree-toggle').attr('aria-expanded', 'true');
    current.closest('.pc-tree-panel').each(function () {
        const root = $('#pcSidebar .pc-menu-root[aria-controls="' + this.id + '"]');
        root.closest('.pc-menu-roots').find('.pc-menu-root').removeClass('is-active').attr('aria-pressed', 'false');
        root.addClass('is-active').attr('aria-pressed', 'true');
        if (root.is(':visible')) detailPcMenuRoot(root[0]);
    });
    setPcMenuOpen(expanded);
}
