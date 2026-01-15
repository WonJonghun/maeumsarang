(function (global) {

    const storageKeys = {
        searchOpen: 'SearchOpen',
        searchKeyword: 'SearchKeyword',
        searchFromDate: 'SearchFromDate',
        searchToDate: 'SearchToDate'
    };

    let searchEnabled = false;
    let dateEnabled = false;
    let searchOpen = false;

    function ssGet(key) {
        try { return sessionStorage.getItem(key); }
        catch (e) { return null; }
    }

    function ssSet(key, val) {
        try { sessionStorage.setItem(key, val); }
        catch (e) { /* ignore */ }
    }

    function getDefaultDates() {
        const today = new Date();
        const start = new Date(today);
        start.setFullYear(start.getFullYear() - 1);

        return {
            from: cmFormatYmd(start),
            to: cmFormatYmd(today)
        };
    }

    function applyDefaultDates(fromEl, toEl) {
        const d = getDefaultDates();
        fromEl.val(d.from);
        toEl.val(d.to);
        ssSet(storageKeys.searchFromDate, d.from);
        ssSet(storageKeys.searchToDate, d.to);
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

    // 상세조건 history
    function openFilter(filterPanel, filterBtn) {
        if (!dateEnabled || !filterPanel || !filterPanel.length) return;

        if (!filterPanel.hasClass('is-open')) {
            filterPanel.addClass('is-open');
            if (filterBtn && filterBtn.length) filterBtn.addClass('is-active');
        }

        const state = history.state || {};
        if (state.topbarFilter === true) return;

        const baseUrl = location.pathname + location.search + (location.hash || '');
        history.pushState({ topbarSearch: true, topbarFilter: true }, document.title, baseUrl);
    }

    function closeFilter(filterPanel, filterBtn) {
        if (!dateEnabled || !filterPanel || !filterPanel.length) return;

        filterPanel.removeClass('is-open');
        if (filterBtn && filterBtn.length) filterBtn.removeClass('is-active');
    }

    function init() {
        const topbar = $('.topbar').first();
        if (!topbar.length) return;

        const titleEl = $('#topbarTitle');
        const searchWrap = $('#topbarSearch');
        const searchForm = $('#topbarSearchForm');
        const searchInput = $('#searchKeyword');

        const filterBtn = $('#topbarFilterBtn');
        const filterPanel = $('#topbarFilterPanel');
        const dateFrom = $('#searchFromDate');
        const dateTo = $('#searchToDate');

        const openBtn = $('#btnTopbarSearch');
        const closeBtn = $('#topbarSearchClose');
        const resetBtn = $('#topbarFilterReset');

        const mainYn = $.trim(topbar.attr('data-main-yn') || '').toUpperCase();
        const isMain = (mainYn === 'Y');

        $(window).off('scroll.topbar').on('scroll.topbar', function () {
            if (!isMain) {
                topbar.addClass('scrolled');
                return;
            }
            topbar.toggleClass('scrolled', $(window).scrollTop() > 0);
        });
        $(window).trigger('scroll.topbar');

        const searchYn = $.trim(topbar.attr('data-search-yn') || '').toUpperCase();
        const dateYn = $.trim(topbar.attr('data-date-yn') || '').toUpperCase();
        const title = $.trim(topbar.attr('data-title') || '');

        if (title) titleEl.text(title).prop('hidden', false);
        else titleEl.text('').prop('hidden', true);

        searchEnabled = (searchYn === 'Y');
        dateEnabled = (dateYn === 'Y');

        if (!searchEnabled) {
            openBtn.prop('hidden', true);
            topbar.removeClass('search-mode');
            searchWrap.prop('hidden', true);
            return;
        }

        openBtn.prop('hidden', false);

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

        // 검색 열기
        openBtn.off('click.topbarOpen').on('click.topbarOpen', function (e) {
            e.preventDefault();
            openSearch(topbar, searchWrap, searchInput, filterPanel, filterBtn, true);
            return false;
        });

        // 검색 닫기
        closeBtn.off('click.topbarClose').on('click.topbarClose', function (e) {
            e.preventDefault();
            searchInput.val('');
            ssSet(storageKeys.searchKeyword, '');

            if (dateEnabled && dateFrom.length && dateTo.length) {
                applyDefaultDates(dateFrom, dateTo);
            }

            fireSearch(searchInput, dateFrom, dateTo, 'close');

            if (location.hash === '#search') {
                const state = history.state || {};
                if (state.topbarFilter === true) history.go(-2);
                else history.back();
            } else {
                closeSearch(topbar, searchWrap, filterPanel, filterBtn);
            }

            return false;
        });


        // 상세조건(톱니)
        if (dateEnabled && filterBtn.length && filterPanel.length) {
            filterBtn.off('click.topbarFilter').on('click.topbarFilter', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const willOpen = !filterPanel.hasClass('is-open');
                if (willOpen) {
                    openFilter(filterPanel, filterBtn);
                } else {
                    const state = history.state || {};
                    if (state.topbarFilter === true) history.back();
                    else closeFilter(filterPanel, filterBtn);
                }

                return false;
            });
        }

        if (dateEnabled && dateFrom.length) {
            dateFrom.off('change.topbarDate').on('change.topbarDate', function () {
                ssSet(storageKeys.searchFromDate, $.trim(dateFrom.val() || ''));
            });
        }
        if (dateEnabled && dateTo.length) {
            dateTo.off('change.topbarDate').on('change.topbarDate', function () {
                ssSet(storageKeys.searchToDate, $.trim(dateTo.val() || ''));
            });
        }

        // 초기화
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

        // 검색 실행
        searchForm.off('submit.topbarSubmit').on('submit.topbarSubmit', function (e) {
            e.preventDefault();

            if (dateEnabled && dateFrom.length && dateTo.length) {
                const vFrom = $.trim(dateFrom.val() || '');
                const vTo = $.trim(dateTo.val() || '');

                if ((vFrom && !vTo) || (!vFrom && vTo)) {
                    const focusEl = vFrom ? dateTo : dateFrom;

                    if (typeof global.customAlert === 'function') {
                        customAlert('알림', '기간설정을 완료해 주세요.', 'WARN').then(function () {
                            focusEl.focus();
                        });
                    } else {
                        alert('기간설정을 완료해 주세요.');
                        focusEl.focus();
                    }
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

        searchInput.off('input.topbarInput').on('input.topbarInput', function () {
            ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));
        });

        // 뒤로가기
        $(window).off('popstate.topbarPop').on('popstate.topbarPop', function () {
            if (!searchEnabled) return;

            if (dateEnabled && filterPanel && filterPanel.length && filterPanel.hasClass('is-open')) {
                const state = history.state || {};
                if (state.topbarFilter !== true) {
                    closeFilter(filterPanel, filterBtn);
                }
            }

            if (location.hash === '#search') {
                if (!searchOpen) openSearch(topbar, searchWrap, searchInput, filterPanel, filterBtn, false);
                return;
            }

            if (searchOpen) {
                closeSearch(topbar, searchWrap, filterPanel, filterBtn);
            }
        });

        global.cmHeader = {
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

    $(function () { init(); });

})(window);
