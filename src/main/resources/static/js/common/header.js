$(function () {
    initHeader();
    headerEvents();
});

const storageKeys = {
    searchOpen: 'SearchOpen',
    searchKeyword: 'SearchKeyword',
    searchFromDate: 'SearchFromDate',
    searchToDate: 'SearchToDate'
};

let searchEnabled = false;
let dateEnabled = false;
let searchOpen = false;

//초기화
function initHeader() {
    const topbar = $('.topbar').first();
    if (!topbar.length) return;

    const titleEl = $('#topbarTitle');
    const searchWrap = $('#topbarSearch');
    const searchInput = $('#searchKeyword');
    const openBtn = $('#btnTopbarSearch');

    const filterBtn = $('#topbarFilterBtn');
    const filterPanel = $('#topbarFilterPanel');
    const dateFrom = $('#searchFromDate');
    const dateTo = $('#searchToDate');

    const isMain = ($.trim(topbar.attr('data-main-yn') || '').toUpperCase() === 'Y');
    const title = $.trim(topbar.attr('data-title') || '');
    const searchYn = $.trim(topbar.attr('data-search-yn') || '').toUpperCase();
    const dateYn = $.trim(topbar.attr('data-date-yn') || '').toUpperCase();

    searchEnabled = (searchYn === 'Y');
    dateEnabled = (dateYn === 'Y');

    //스크롤 효과
    $(window).off('scroll.topbar').on('scroll.topbar', function () {
        if (!isMain) {
            topbar.addClass('scrolled');
            return;
        }
        topbar.toggleClass('scrolled', $(window).scrollTop() > 0);
    });
    $(window).trigger('scroll.topbar');

    //타이틀 표시(메인은 숨김)
    if (isMain) {
        titleEl.text('').prop('hidden', true);
    } else {
        if (title) titleEl.text(title).prop('hidden', false);
        else titleEl.text('').prop('hidden', true);
    }

    //검색 비활성
    if (!searchEnabled) {
        openBtn.prop('hidden', true);
        topbar.removeClass('search-mode');
        searchWrap.prop('hidden', true);
        return;
    }

    openBtn.prop('hidden', false);

    //저장값 복원
    const savedOpen = ssGet(storageKeys.searchOpen);
    const savedKeyword = ssGet(storageKeys.searchKeyword);
    const savedFrom = ssGet(storageKeys.searchFromDate);
    const savedTo = ssGet(storageKeys.searchToDate);

    if (savedKeyword !== null) searchInput.val(savedKeyword);

    if (dateEnabled && dateFrom.length && dateTo.length) {
        if (savedFrom) dateFrom.val(savedFrom);
        if (savedTo) dateTo.val(savedTo);

        if (!$.trim(dateFrom.val() || '') || !$.trim(dateTo.val() || '')) {
            applyDefaultDates(dateFrom, dateTo);
        }

        if (filterPanel.length) filterPanel.removeClass('is-open');
        if (filterBtn.length) filterBtn.removeClass('is-active');
    }

    if (location.hash === '#search' || savedOpen === 'Y') {
        openSearch(topbar, searchWrap, searchInput, filterPanel, filterBtn, false);
    } else {
        closeSearch(topbar, searchWrap, filterPanel, filterBtn);
    }
}

//이벤트 바인딩
function headerEvents() {
    const topbar = $('.topbar').first();
    if (!topbar.length) return;

    const searchWrap = $('#topbarSearch');
    const searchForm = $('#topbarSearchForm');
    const searchInput = $('#searchKeyword');

    const openBtn = $('#btnTopbarSearch');
    const closeBtn = $('#topbarSearchClose');

    const filterBtn = $('#topbarFilterBtn');
    const filterPanel = $('#topbarFilterPanel');
    const dateFrom = $('#searchFromDate');
    const dateTo = $('#searchToDate');
    const resetBtn = $('#topbarFilterReset');

    if (!searchEnabled) return;

    //검색 열기
    openBtn.off('click.topbarOpen').on('click.topbarOpen', function (e) {
        e.preventDefault();
        openSearch(topbar, searchWrap, searchInput, filterPanel, filterBtn, true);
        return false;
    });

    //검색 닫기
    closeBtn.off('click.topbarClose').on('click.topbarClose', function (e) {
        e.preventDefault();

        searchInput.val('');
        ssSet(storageKeys.searchKeyword, '');

        if (dateEnabled && dateFrom.length && dateTo.length) {
            applyDefaultDates(dateFrom, dateTo);
        }

        fireSearch(searchInput, dateFrom, dateTo, 'close');

        if (location.hash === '#search') {
            const hist = history.state || {};
            if (hist.topbarFilter === true) history.go(-2);
            else history.back();
        } else {
            closeSearch(topbar, searchWrap, filterPanel, filterBtn);
        }

        return false;
    });

    //상세조건(톱니)
    if (dateEnabled && filterBtn.length && filterPanel.length) {
        filterBtn.off('click.topbarFilter').on('click.topbarFilter', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!filterPanel.hasClass('is-open')) {
                openFilter(filterPanel, filterBtn);
                return false;
            }

            const hist = history.state || {};
            if (hist.topbarFilter === true) history.back();
            else closeFilter(filterPanel, filterBtn);

            return false;
        });
    }

    //기간 저장(From > To 방지)
    if (dateEnabled && dateFrom.length) {
        dateFrom.off('change.topbarDate').on('change.topbarDate', function () {
            const vFrom = $.trim(dateFrom.val() || '');
            const vTo = $.trim(dateTo.val() || '');

            if (vFrom && vTo && isFromAfterTo(vFrom, vTo)) {
                showDateRangeAlert(dateFrom);
                dateFrom.val(ssGet(storageKeys.searchFromDate) || '');
                return;
            }

            ssSet(storageKeys.searchFromDate, vFrom);
        });
    }
    if (dateEnabled && dateTo.length) {
        dateTo.off('change.topbarDate').on('change.topbarDate', function () {
            const vFrom = $.trim(dateFrom.val() || '');
            const vTo = $.trim(dateTo.val() || '');

            if (vFrom && vTo && isFromAfterTo(vFrom, vTo)) {
                showDateRangeAlert(dateTo);
                dateTo.val(ssGet(storageKeys.searchToDate) || '');
                return;
            }

            ssSet(storageKeys.searchToDate, vTo);
        });
    }

    //초기화
    if (resetBtn.length) {
        resetBtn.off('click.topbarReset').on('click.topbarReset', function (e) {
            e.preventDefault();

            searchInput.val('');
            ssSet(storageKeys.searchKeyword, '');

            if (dateEnabled && dateFrom.length && dateTo.length) {
                applyDefaultDates(dateFrom, dateTo);
            }

            return false;
        });
    }

    //검색 실행
    searchForm.off('submit.topbarSubmit').on('submit.topbarSubmit', function (e) {
        e.preventDefault();

        if (dateEnabled && dateFrom.length && dateTo.length) {
            const vFrom = $.trim(dateFrom.val() || '');
            const vTo = $.trim(dateTo.val() || '');

            if ((vFrom && !vTo) || (!vFrom && vTo)) {
                const focusEl = vFrom ? dateTo : dateFrom;

                if (typeof customAlert === 'function') {
                    customAlert('알림', '기간설정을 완료해 주세요.', 'WARN').then(function () {
                        focusEl.focus();
                    });
                } else {
                    alert('기간설정을 완료해 주세요.');
                    focusEl.focus();
                }
                return false;
            }

            if (vFrom && vTo && isFromAfterTo(vFrom, vTo)) {
                showDateRangeAlert(dateFrom);
                return false;
            }
        }

        ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));
        ssSet(storageKeys.searchOpen, 'Y');

        if (dateEnabled && dateFrom.length && dateTo.length) {
            ssSet(storageKeys.searchFromDate, $.trim(dateFrom.val() || ''));
            ssSet(storageKeys.searchToDate, $.trim(dateTo.val() || ''));
        }

        fireSearch(searchInput, dateFrom, dateTo, 'submit');
        return false;
    });

    //키워드 저장
    searchInput.off('input.topbarInput').on('input.topbarInput', function () {
        ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));
    });

    //뒤로가기
    $(window).off('popstate.topbarPop').on('popstate.topbarPop', function () {
        if (!searchEnabled) return;

        if (dateEnabled && filterPanel.length && filterPanel.hasClass('is-open')) {
            const hist = history.state || {};
            if (hist.topbarFilter !== true) closeFilter(filterPanel, filterBtn);
        }

        if (location.hash === '#search') {
            if (!searchOpen) openSearch(topbar, searchWrap, searchInput, filterPanel, filterBtn, false);
            return;
        }

        if (searchOpen) {
            closeSearch(topbar, searchWrap, filterPanel, filterBtn);
        }
    });

    //외부에서 상태 저장 필요할 때만(최소 전역)
    window.cmHeader = {
        saveSearchState: function () {
            ssSet(storageKeys.searchOpen, searchOpen ? 'Y' : 'N');
            ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));
            if (dateEnabled && dateFrom.length && dateTo.length) {
                ssSet(storageKeys.searchFromDate, $.trim(dateFrom.val() || ''));
                ssSet(storageKeys.searchToDate, $.trim(dateTo.val() || ''));
            }
        }
    };
}

function ssGet(key) {
    try { return sessionStorage.getItem(key); }
    catch (e) { return null; }
}

function ssSet(key, val) {
    try { sessionStorage.setItem(key, val); }
    catch (e) { /* ignore */ }
}

function applyDefaultDates(fromEl, toEl) {
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);

    const from = cmFormatYmd(start);
    const to = cmFormatYmd(today);

    fromEl.val(from);
    toEl.val(to);

    ssSet(storageKeys.searchFromDate, from);
    ssSet(storageKeys.searchToDate, to);
}

function fireSearch(searchInput, fromEl, toEl, source) {
    $(document).trigger('topbar:search', [{
        searchKeyword: $.trim(searchInput.val() || ''),
        searchFromDate: (dateEnabled && fromEl && fromEl.length) ? $.trim(fromEl.val() || '') : '',
        searchToDate: (dateEnabled && toEl && toEl.length) ? $.trim(toEl.val() || '') : '',
        source: source || 'submit'
    }]);
}

function openSearch(topbar, searchWrap, searchInput, filterPanel, filterBtn, pushHistory) {
    if (!searchEnabled || searchOpen) return;

    searchOpen = true;
    topbar.addClass('search-mode');
    searchWrap.prop('hidden', false);

    if (filterPanel && filterPanel.length) filterPanel.removeClass('is-open');
    if (filterBtn && filterBtn.length) filterBtn.removeClass('is-active');

    if (pushHistory === true && location.hash !== '#search') {
        history.pushState({ topbarSearch: true }, document.title, location.pathname + location.search + '#search');
    }

    ssSet(storageKeys.searchOpen, 'Y');
    ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));

    searchInput.focus();
}

function closeSearch(topbar, searchWrap, filterPanel, filterBtn) {
    if (!searchEnabled) return;

    searchOpen = false;
    topbar.removeClass('search-mode');
    searchWrap.prop('hidden', true);

    if (filterPanel && filterPanel.length) filterPanel.removeClass('is-open');
    if (filterBtn && filterBtn.length) filterBtn.removeClass('is-active');

    ssSet(storageKeys.searchOpen, 'N');
}

function openFilter(filterPanel, filterBtn) {
    if (!dateEnabled || !filterPanel || !filterPanel.length) return;

    if (!filterPanel.hasClass('is-open')) {
        filterPanel.addClass('is-open');
        if (filterBtn && filterBtn.length) filterBtn.addClass('is-active');
    }

    const hist = history.state || {};
    if (hist.topbarFilter === true) return;

    history.pushState(
        { topbarSearch: true, topbarFilter: true },
        document.title,
        location.pathname + location.search + (location.hash || '')
    );
}

function closeFilter(filterPanel, filterBtn) {
    if (!dateEnabled || !filterPanel || !filterPanel.length) return;

    filterPanel.removeClass('is-open');
    if (filterBtn && filterBtn.length) filterBtn.removeClass('is-active');
}

function normalizeYmd(val) {
    return String(val || '').replace(/[^0-9]/g, '');
}

function isFromAfterTo(fromVal, toVal) {
    const f = normalizeYmd(fromVal);
    const t = normalizeYmd(toVal);
    if (f.length !== 8 || t.length !== 8) return false;
    return f > t;
}

function showDateRangeAlert(focusEl) {
    if (typeof customAlert === 'function') {
        customAlert('알림', '시작일이 종료일보다 늦습니다.', 'WARN').then(function () {
            if (focusEl && focusEl.length) focusEl.focus();
        });
        return;
    }

    alert('시작일이 종료일보다 늦습니다.');
    if (focusEl && focusEl.length) focusEl.focus();
}
