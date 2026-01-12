(function (global) {

    const storageKeys = {
        searchOpen: 'SearchOpen',
        searchKeyword: 'SearchKeyword'
    };

    let searchEnabled = false;
    let searchOpen = false;

    function ssGet(key) {
        try { return sessionStorage.getItem(key); }
        catch (e) { return null; }
    }

    function ssSet(key, val) {
        try { sessionStorage.setItem(key, val); }
        catch (e) { /* ignore */ }
    }

    function setSearchBtnState(searchIcon, searchBtn, open) {
        if (open) {
            searchIcon.removeClass('bi-search').addClass('bi-x-lg');
            searchBtn.attr('aria-label', '검색 취소');
            return;
        }
        searchIcon.removeClass('bi-x-lg').addClass('bi-search');
        searchBtn.attr('aria-label', '검색');
    }

    function openSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, pushHistory) {
        if (!searchEnabled) return;
        if (searchOpen) return;

        searchOpen = true;
        topbar.addClass('search-mode');
        searchWrap.prop('hidden', false);
        setSearchBtnState(searchIcon, searchBtn, true);

        if (pushHistory === true && location.hash !== '#search') {
            history.pushState({topbarSearch: true}, document.title, location.pathname + location.search + '#search');
        }

        ssSet(storageKeys.searchOpen, 'Y');
        ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));

        searchInput.focus();
    }

    function closeSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, resetKeyword, triggerSearch) {
        if (!searchEnabled) return;

        searchOpen = false;
        topbar.removeClass('search-mode');
        searchWrap.prop('hidden', true);
        setSearchBtnState(searchIcon, searchBtn, false);

        if (resetKeyword === true) {
            searchInput.val('');
            ssSet(storageKeys.searchKeyword, '');
        }

        ssSet(storageKeys.searchOpen, 'N');

        if (triggerSearch === true) {
            $(document).trigger('topbar:search', [{keyword: '', source: 'reset'}]);
        }
    }

    function init() {
        const topbar = $('.topbar').first();
        if (!topbar.length) return;

        const titleEl = $('#topbarTitle');
        const searchWrap = $('#topbarSearch');
        const searchForm = $('#topbarSearchForm');
        const searchInput = $('#topbarSearchInput');
        const searchBtn = $('#btnTopbarSearch');
        const searchIcon = $('#topbarSearchIcon');

        //스크롤시 아래 보더에 선나오게
        $(window).off('scroll.topbar').on('scroll.topbar', function () {
            if ($(window).scrollTop() > 0) $('.topbar').addClass('scrolled');
            else $('.topbar').removeClass('scrolled');
        });
        $(window).trigger('scroll.topbar');

        const mainYn = $.trim(topbar.attr('data-main-yn') || '').toUpperCase();
        const searchYn = $.trim(topbar.attr('data-search-yn') || '').toUpperCase();
        const title = $.trim(topbar.attr('data-title') || '');

        if (mainYn === 'N') {
            if (title) titleEl.text(title).prop('hidden', false);
            else titleEl.text('').prop('hidden', true);
        } else {
            if (title) titleEl.text(title).prop('hidden', false);
            else titleEl.text('').prop('hidden', true);
        }

        searchEnabled = (searchYn === 'Y');
        if (!searchEnabled) {
            searchBtn.prop('hidden', true);
            topbar.removeClass('search-mode');
            searchWrap.prop('hidden', true);
            setSearchBtnState(searchIcon, searchBtn, false);
            return;
        }

        searchBtn.prop('hidden', false);

        const savedOpen = ssGet(storageKeys.searchOpen);
        const savedKeyword = ssGet(storageKeys.searchKeyword);

        if (savedKeyword !== null) searchInput.val(savedKeyword);

        if (location.hash === '#search' || savedOpen === 'Y') {
            openSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, false);
        } else {
            closeSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, false, false);
        }

        searchBtn.off('click.topbarSearch').on('click.topbarSearch', function () {
            if (!searchEnabled) return;

            if (!searchOpen) {
                openSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, true);
                return;
            }

            if (location.hash === '#search') {
                history.back();
                return;
            }

            closeSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, true, true);
        });

        searchForm.off('submit.topbarSearch').on('submit.topbarSearch', function (e) {
            e.preventDefault();

            const keyword = $.trim(searchInput.val() || '');
            ssSet(storageKeys.searchKeyword, keyword);
            ssSet(storageKeys.searchOpen, 'Y');

            $(document).trigger('topbar:search', [{keyword: keyword, source: 'submit'}]);
        });

        searchInput.off('search.topbarSearch').on('search.topbarSearch', function () {
            const keyword = $.trim(searchInput.val() || '');
            ssSet(storageKeys.searchKeyword, keyword);
            ssSet(storageKeys.searchOpen, 'Y');

            $(document).trigger('topbar:search', [{keyword: keyword, source: 'search'}]);
        });

        searchInput.off('input.topbarSearch').on('input.topbarSearch', function () {
            ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));
        });

        $(window).off('popstate.topbarSearch').on('popstate.topbarSearch', function () {
            if (!searchEnabled) return;

            if (location.hash === '#search') {
                if (!searchOpen) openSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, false);
                return;
            }

            if (searchOpen) {
                closeSearch(topbar, searchWrap, searchInput, searchBtn, searchIcon, true, true);
            }
        });

        global.cmHeader = {
            saveSearchState: function () {
                ssSet(storageKeys.searchOpen, searchOpen ? 'Y' : 'N');
                ssSet(storageKeys.searchKeyword, $.trim(searchInput.val() || ''));
            }
        };
    }

    $(function () { init(); });

})(window);
