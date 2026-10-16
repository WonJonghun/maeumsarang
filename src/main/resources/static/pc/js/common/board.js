$(function () {
    //초기화
    const state = JSON.parse(window.frameElement?.getAttribute('data-state') ?? 'null');
    pcBoard.flag = state?.flag ?? Number($('#pcBoard').attr('data-base-key'));
    pcBoard.seflag = state?.seflag ?? '';
    pcBoard.libraryAll = state?.libraryAll ?? (pcBoard.flag === 3);
    pcBoard.page = state?.page ?? 1;
    pcBoard.limit = state?.limit ?? 20;
    pcBoard.search = state?.search ?? {};
    pcBoard.scroll = state?.scroll ?? 0;
    $('#pcBoardFrom').val(state?.from ?? cmSubDays(cmGetToday('-'), 365, '-'));
    $('#pcBoardTo').val(state?.to ?? cmGetToday('-'));
    $('#pcBoardSearchType').val(state?.type ?? 'titleContent');
    $('#pcBoardKeyword').val(state?.keyword ?? '');
    $('#pcBoardLimit').val(pcBoard.limit);
    loadPcBoardMenus();

    //목록 스크롤 안내
    $('#pcBoardScroll').on('scroll', updatePcBoardScroll);
    const scrollObserver = new ResizeObserver(updatePcBoardScroll);
    scrollObserver.observe($('#pcBoardScroll')[0]);
    scrollObserver.observe($('.pc-board-table')[0]);

    //목록 맨 아래로 이동
    $('#pcBoardScrollHint').on('click', function () {
        const scroll = $('#pcBoardScroll')[0];
        scroll.scrollTo({top: scroll.scrollHeight, behavior: 'smooth'});
    }).on('wheel', function (event) {
        event.preventDefault();
        $('#pcBoardScroll')[0].scrollBy({top: event.originalEvent.deltaY, left: event.originalEvent.deltaX});
    });

    //업무 탭에서 게시판 선택·상태 저장
    $(document).on('pcWorkTab:open', function (event, params) {
        selectPcBoard(Number(params.ccBaseKey));
    }).on('pcWorkTab:hide', function () {
        if ($('#pcBoardDatePicker')[0].matches(':popover-open')) $('#pcBoardDatePicker')[0].hidePopover();
    }).on('pcWorkTab:save', function () {
        window.parent.savePcWorkTabState(window.frameElement.getAttribute('data-tab-key'), {
            flag: pcBoard.flag,
            seflag: pcBoard.seflag,
            libraryAll: pcBoard.libraryAll,
            page: pcBoard.page,
            limit: pcBoard.limit,
            search: pcBoard.search,
            from: $('#pcBoardFrom').val(),
            to: $('#pcBoardTo').val(),
            type: $('#pcBoardSearchType').val(),
            keyword: $('#pcBoardKeyword').val(),
            scroll: $('#pcBoardScroll').scrollTop()
        }, {
            ccWinCode: 'w_gongji_list',
            ccBaseKey: String(pcBoard.flag >= 3 && pcBoard.flag <= 5 ? 3 : pcBoard.flag)
        });
    });

    //기간 달력 열기
    $('#pcBoardFrom, #pcBoardTo').on('click', function (event) {
        event.preventDefault();
        openPcBoardPeriod(this.id);
    });
    $('#pcBoardFrom, #pcBoardTo').on('keydown', function (event) {
        if (event.key !== 'ArrowDown' || !event.altKey) return;
        event.preventDefault();
        openPcBoardPeriod(this.id);
    });

    //달력 월 이동
    $('#pcBoardDatePicker').on('click', '[data-month-step]', function () {
        const calendar = $(this).closest('[data-date-input]');
        const input = calendar.attr('data-date-input');
        const step = Number($(this).attr('data-month-step'));
        const date = new Date(calendar.attr('data-month') + '-01T00:00:00');
        date.setMonth(date.getMonth() + step);
        calendar.attr('data-month', cmFormatYmd(date, '-').substring(0, 7));
        renderPcBoardPeriod();
        $('#pcBoardDatePicker [data-date-input="' + input + '"] [data-month-step="' + step + '"]').trigger('focus');
    }).on('change', 'select', function () {
        const calendar = $(this).closest('[data-date-input]');
        const input = calendar.attr('data-date-input');
        const field = $(this).attr('data-month-field');
        const month = calendar.find('[data-month-field="year"]').val()
            + '-' + calendar.find('[data-month-field="month"]').val();
        calendar.attr('data-month', month);
        renderPcBoardPeriod();
        $('#pcBoardDatePicker [data-date-input="' + input + '"] [data-month-field="' + field + '"]').trigger('focus');
    });

    //시작일·종료일 선택
    $('#pcBoardDatePicker').on('click', '[data-date]', function () {
        const calendar = $(this).closest('[data-date-input]');
        const input = calendar.attr('data-date-input');
        const ymd = $(this).attr('data-date');
        $('#' + input).val(ymd);
        calendar.attr('data-month', ymd.substring(0, 7));
        if ($('#pcBoardFrom').val() > $('#pcBoardTo').val()) {
            const other = input === 'pcBoardFrom' ? 'pcBoardTo' : 'pcBoardFrom';
            $('#' + other).val(ymd);
            $('#pcBoardDatePicker [data-date-input="' + other + '"]').attr('data-month', ymd.substring(0, 7));
        }
        if (input === 'pcBoardTo') {
            $('#pcBoardDatePicker')[0].hidePopover();
            $('#pcBoardTo').trigger('focus');
            return;
        }
        renderPcBoardPeriod();
        $('#pcBoardDatePicker [data-date-input="' + input + '"] [data-date="' + ymd + '"]').first().trigger('focus');
    });

    //기간 달력 닫기
    $('#pcBoardDateClose').on('click', function () {
        $('#pcBoardDatePicker')[0].hidePopover();
        $('#' + $('#pcBoardDatePicker').attr('data-input')).trigger('focus');
    });
    $('#pcBoardDatePicker').on('toggle', function (event) {
        $('#pcBoardFrom, #pcBoardTo').attr('aria-expanded', String(event.originalEvent.newState === 'open'));
    }).on('keydown', function (event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        this.hidePopover();
        $('#' + $(this).attr('data-input')).trigger('focus');
    });
    $(window).on('resize', function () {
        if ($('#pcBoardDatePicker')[0].matches(':popover-open')) $('#pcBoardDatePicker')[0].hidePopover();
    });

    //게시판 선택
    $('#pcBoardMenus').on('click', '[data-board-flag]', function () {
        selectPcBoard(
            Number($(this).attr('data-board-flag')),
            $(this).attr('data-board-seflag'),
            $(this).attr('data-board-all') === 'true'
        );
        $(this).siblings('[data-board-group][aria-expanded="false"]').trigger('click');
    });

    //자료실 펼침·접힘
    $('#pcBoardMenus').on('click', '[data-board-group]', function () {
        const expanded = $(this).attr('aria-expanded') === 'true';
        const children = $('#' + $(this).attr('aria-controls')).stop(true, true);
        const ms = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
        $(this).attr('aria-expanded', String(!expanded));
        if (expanded) {
            children.slideUp(ms, function () {
                $(this).prop('hidden', true).css('display', '');
            });
        } else {
            $(this).closest('.pc-board-menu-group').siblings('.pc-board-menu-group')
                .children('.pc-board-menu-row').children('[data-board-group][aria-expanded="true"]')
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

    //검색
    $('#pcBoardSearch').on('submit', function (event) {
        event.preventDefault();
        loadPcBoard(true);
    });

    //페이지당 표시 수
    $('#pcBoardLimit').on('change', function () {
        pcBoard.limit = Number(this.value);
        loadPcBoard(true);
    });

    //새로고침·재시도
    $('#pcBoardRefresh').on('click', function () {
        loadPcBoard();
    });
    $('#pcBoardRows').on('click', '[data-board-retry]', function () {
        loadPcBoard();
    });
    $('#pcBoardMenuStatus').on('click', 'button', loadPcBoardMenus);

    //페이지 이동
    $('#pcBoardPagination').on('click', '[data-page]', function () {
        pcBoard.page = Number($(this).attr('data-page'));
        loadPcBoard();
    });

    //게시글 상세
    $('#pcBoardRows').on('click', '.pc-board-title', function () {
        detailPcBoard(Number($(this).attr('data-index')));
    });

    //본문 표시·읽음 처리
    $('#pcBoardDetailFrame').on('load', function () {
        const detail = $(this.contentDocument).find('.pc-board-detail');
        if (detail.attr('data-tv-uk') !== pcBoard.detailUk) return;
        $(this).prop('hidden', false);
        $('#pcBoardPreviewMessage').prop('hidden', true);
        $('#pcBoardPreview').attr('aria-busy', 'false');
        updatePcBoardRead(pcBoard.detailUk);
    });

    //상세 조회 성공 시 읽음 표시
    $(document).on('cmPopup:loaded', function (event, frame) {
        const detail = $(frame.contentDocument).find('.pc-board-detail');
        if (!detail.length) return;
        updatePcBoardRead(detail.attr('data-tv-uk'));
    });
});

const pcBoard = {
    flag: 1,
    seflag: '',
    libraryAll: false,
    page: 1,
    limit: 20,
    list: [],
    search: {},
    scroll: 0,
    request: null,
    detailUk: '',
    detailRequest: null
};

//게시판 메뉴 조회
function loadPcBoardMenus() {
    $('#pcBoardMenuStatus').text('게시판을 불러오는 중입니다.').prop('hidden', false);
    cmAjax('/pc/notice/menuList.do', 'GET', {}).done(function (menus) {
        $('#pcBoardMenus').html(renderPcBoardMenus(menus));
        $('#pcBoardMenuStatus').prop('hidden', menus.length > 0).text('조회할 수 있는 게시판이 없습니다.');
        selectPcBoard(pcBoard.flag, pcBoard.seflag, pcBoard.libraryAll);
    }).fail(function () {
        $('#pcBoardMenuStatus').html('게시판을 불러오지 못했습니다. <button type="button">다시 시도</button>');
    });
}

//게시판 메뉴 표시
function renderPcBoardMenus(menus, path = '') {
    return menus.map(function (menu, index) {
        const key = path + index;
        const icon = menu.ccBaseKey === '1' ? 'bi-megaphone' : menu.ccBaseKey === '2' ? 'bi-chat-square-text' : 'bi-folder2';
        const button = `
            <button type="button" class="pc-board-menu-item" data-board-flag="${cmEscapeHtml(menu.ccBaseKey)}"
                    data-board-seflag="${cmEscapeHtml(menu.tnSeflag)}" data-board-all="${menu.libraryAll}">
                ${path ? '' : `<i class="bi ${icon}" aria-hidden="true"></i>`}
                <span class="pc-board-link-text">${cmEscapeHtml(menu.ccMenuName)}</span>
            </button>`;
        if (!menu.children.length) return button;
        return `
            <div class="pc-board-menu-group">
                <div class="pc-board-menu-row">
                    ${button}
                    <button type="button" class="pc-board-group-toggle" data-board-group aria-expanded="${!path}"
                            aria-controls="pcBoardGroup${key}" aria-label="${cmEscapeHtml(menu.ccMenuName)} 하위 분류 접기·펼치기">
                        <i class="bi bi-chevron-down pc-board-group-arrow" aria-hidden="true"></i>
                    </button>
                </div>
                <div id="pcBoardGroup${key}" class="pc-board-submenus"${path ? ' hidden' : ''}>${renderPcBoardMenus(menu.children, key + '-')}</div>
            </div>`;
    }).join('');
}

//게시판 선택
function selectPcBoard(flag, seflag = '', libraryAll = flag === 3) {
    const changed = pcBoard.flag !== flag || pcBoard.seflag !== seflag || pcBoard.libraryAll !== libraryAll;
    pcBoard.flag = flag;
    pcBoard.seflag = seflag;
    pcBoard.libraryAll = libraryAll;
    if (changed) {
        $('#pcBoardKeyword').val('');
        pcBoard.search = {};
        pcBoard.scroll = 0;
    }
    if (!$('#pcBoardMenus').children().length) return;
    const current = $('#pcBoardMenus [data-board-flag="' + flag + '"][data-board-seflag="' + seflag + '"][data-board-all="' + libraryAll + '"]');
    if (!changed && current.hasClass('is-active')) return;
    $('#pcBoardMenus [data-board-flag]').removeClass('is-active').removeAttr('aria-current');
    current.addClass('is-active').attr('aria-current', 'page');
    current.parents('.pc-board-submenus').stop(true, true).prop('hidden', false).css('display', '')
        .prev('.pc-board-menu-row').find('[data-board-group]').attr('aria-expanded', 'true');
    $('#pcBoardTitle').text(current.find('.pc-board-link-text').text());
    document.title = $('#pcBoardTitle').text() + ' | 마음사랑병원 인트라넷';
    loadPcBoard(changed || !Object.keys(pcBoard.search).length);
}

//게시글 조회·검색·목록
function loadPcBoard(reset = false) {
    if (reset) {
        if ($('#pcBoardFrom').val() > $('#pcBoardTo').val()) {
            customAlert('조회 기간', '시작일은 종료일보다 늦을 수 없습니다.', 'WARN');
            return;
        }
        pcBoard.page = 1;
        pcBoard.search = {
            searchFromDate: $('#pcBoardFrom').val(),
            searchToDate: $('#pcBoardTo').val(),
            searchType: $('#pcBoardSearchType').val(),
            searchKeyword: $('#pcBoardKeyword').val()
        };
    }
    if (pcBoard.request) pcBoard.request.abort();
    if (pcBoard.detailRequest) pcBoard.detailRequest.abort();
    pcBoard.detailUk = '';
    $('#pcBoardDetailFrame').prop('hidden', true).removeAttr('srcdoc').attr('src', 'about:blank');
    $('#pcBoardPreview').attr('aria-busy', 'false');
    $('#pcBoardPreviewText').text('게시글을 선택하면 내용을 확인할 수 있습니다.');
    $('#pcBoardPreviewMessage').prop('hidden', false);
    $('#pcBoardRows').html('<tr><td colspan="6" class="pc-board-empty">게시글을 불러오는 중입니다.</td></tr>');
    $('#pcBoardCount').text('게시글을 불러오는 중입니다.');
    $('#pcBoardPagination').empty();
    $('#pcBoardScroll').attr('aria-busy', 'true').scrollTop(0);
    updatePcBoardScroll();
    const request = cmAjax('/pc/notice/list.do', 'GET', {
        ...pcBoard.search,
        tnFlag: pcBoard.flag,
        tnSeflag: pcBoard.seflag,
        libraryAll: pcBoard.libraryAll,
        offset: (pcBoard.page - 1) * pcBoard.limit,
        limit: pcBoard.limit
    });
    pcBoard.request = request;
    request.done(function (data) {
        pcBoard.list = data.list;
        const pages = Math.max(1, Math.ceil(data.total / pcBoard.limit));
        if (pcBoard.page > pages) {
            pcBoard.page = pages;
            loadPcBoard();
            return;
        }
        $('#pcBoardCount').html(`전체 <strong>${data.total.toLocaleString('ko-KR')}</strong>건 <span>${pcBoard.page} / ${pages} 페이지</span>`);
        const offset = (pcBoard.page - 1) * pcBoard.limit;
        const html = data.list.map(function (item, index) {
            return `
                <tr class="${item.ccView === 'N' ? 'is-unread' : ''}">
                    <td class="pc-board-number">${data.total - offset - index}</td>
                    <td class="pc-board-subject">
                        <button type="button" class="pc-board-title" data-index="${index}" title="${cmEscapeHtml(item.tnTitle)}">
                            <span class="pc-board-link-text">${cmEscapeHtml(item.tnTitle)}</span>
                        </button>
                    </td>
                    <td class="pc-board-writer" title="${cmEscapeHtml(item.tnUk)}">${cmEscapeHtml(item.tnUk)}</td>
                    <td class="pc-board-date">${cmEscapeHtml(item.tnDateStr)}</td>
                    <td class="pc-board-views">${cmEscapeHtml(item.viewCount)}</td>
                    <td>${item.tnImgNum ? '<i class="bi bi-paperclip" aria-label="첨부파일"></i>' : ''}</td>
                </tr>`;
        }).join('');
        $('#pcBoardRows').html(html || '<tr><td colspan="6" class="pc-board-empty">조회된 게시글이 없습니다.</td></tr>');
        let pagination = `
            <button type="button" data-page="1" aria-label="첫 페이지" ${pcBoard.page === 1 ? 'disabled' : ''}><i class="bi bi-chevron-double-left" aria-hidden="true"></i></button>
            <button type="button" data-page="${pcBoard.page - 1}" aria-label="이전 페이지" ${pcBoard.page === 1 ? 'disabled' : ''}><i class="bi bi-chevron-left" aria-hidden="true"></i></button>`;
        const start = Math.floor((pcBoard.page - 1) / 10) * 10 + 1;
        for (let page = start; page <= Math.min(start + 9, pages); page++) {
            pagination += `<button type="button" data-page="${page}" ${page === pcBoard.page ? 'class="is-active" aria-current="page"' : ''}>${page}</button>`;
        }
        pagination += `
            <button type="button" data-page="${pcBoard.page + 1}" aria-label="다음 페이지" ${pcBoard.page === pages ? 'disabled' : ''}><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
            <button type="button" data-page="${pages}" aria-label="마지막 페이지" ${pcBoard.page === pages ? 'disabled' : ''}><i class="bi bi-chevron-double-right" aria-hidden="true"></i></button>`;
        $('#pcBoardPagination').html(pagination);
        $('#pcBoardScroll').scrollTop(pcBoard.scroll);
        pcBoard.scroll = 0;
    }).fail(function (xhr, status) {
        if (status === 'abort') return;
        pcBoard.list = [];
        $('#pcBoardCount').text('조회 실패');
        $('#pcBoardRows').html('<tr><td colspan="6" class="pc-board-empty">게시글을 불러오지 못했습니다. <button type="button" data-board-retry>다시 시도</button></td></tr>');
    }).always(function () {
        if (pcBoard.request !== request) return;
        pcBoard.request = null;
        $('#pcBoardScroll').attr('aria-busy', 'false');
        updatePcBoardScroll();
    });
}

//게시글 상세
function detailPcBoard(index) {
    const item = pcBoard.list[index];
    if (pcBoard.detailUk === item.tvUk) return;
    if (pcBoard.detailRequest) pcBoard.detailRequest.abort();
    pcBoard.detailUk = item.tvUk;
    $('#pcBoardRows tr').removeClass('is-selected');
    $('#pcBoardRows .pc-board-title[data-index="' + index + '"]').closest('tr').addClass('is-selected');
    $('#pcBoardDetailFrame').prop('hidden', true).removeAttr('srcdoc').attr('src', 'about:blank');
    $('#pcBoardPreview').attr('aria-busy', 'true');
    $('#pcBoardPreviewText').text('게시글을 불러오는 중입니다.');
    $('#pcBoardPreviewMessage').prop('hidden', false);
    const request = cmAjaxHtml('/pc/notice/detailPopup.do', 'GET', {
        tnFlag: item.tnFlag,
        tvUk: item.tvUk
    });
    pcBoard.detailRequest = request;
    request.done(function (html) {
        $('#pcBoardDetailFrame').attr({srcdoc: html, title: item.tnTitle});
    }).fail(function (xhr, status) {
        if (status === 'abort') return;
        pcBoard.detailUk = '';
        $('#pcBoardRows tr').removeClass('is-selected');
        $('#pcBoardPreview').attr('aria-busy', 'false');
        $('#pcBoardPreviewText').text('게시글을 불러오지 못했습니다. 목록에서 다시 선택해 주세요.');
    }).always(function () {
        if (pcBoard.detailRequest === request) pcBoard.detailRequest = null;
    });
}

//게시글 읽음 표시
function updatePcBoardRead(tvUk) {
    const index = pcBoard.list.findIndex(function (item) {
        return item.tvUk === tvUk;
    });
    if (index < 0) return;
    pcBoard.list[index].ccView = 'Y';
    $('#pcBoardRows .pc-board-title[data-index="' + index + '"]').closest('tr').removeClass('is-unread');
}

//목록 스크롤 안내 갱신
function updatePcBoardScroll() {
    const scroll = $('#pcBoardScroll')[0];
    $('#pcBoardScrollHint').css({
        left: scroll.offsetLeft + scroll.clientLeft,
        bottom: scroll.parentElement.clientHeight - scroll.offsetTop - scroll.clientTop - scroll.clientHeight,
        width: scroll.clientWidth
    }).prop('hidden', scroll.getAttribute('aria-busy') === 'true' || scroll.clientHeight === 0
        || scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop <= 1);
}

//기간 달력 열기
function openPcBoardPeriod(input) {
    $('#pcBoardDateCalendars').html(['pcBoardFrom', 'pcBoardTo'].map(function (id) {
        const ymd = $('#' + id).val() || cmGetToday('-');
        return `<section class="pc-board-date-calendar" data-date-input="${id}" data-month="${cmEscapeHtml(ymd.substring(0, 7))}"></section>`;
    }).join(''));
    renderPcBoardPeriod();
    const popup = $('#pcBoardDatePicker');
    popup.attr('data-input', input);
    popup[0].showPopover();
    const anchor = $('.pc-board-period')[0].getBoundingClientRect();
    const rect = popup[0].getBoundingClientRect();
    const scale = Number($('.pc-page').css('--pc-ui-scale'));
    popup.css({
        left: Math.max(16, Math.min(anchor.left, window.innerWidth - rect.width - 16)) / scale,
        top: Math.max(16, Math.min(anchor.bottom + 8, window.innerHeight - rect.height - 16)) / scale
    });
    const id = input === 'pcBoardTo' ? 'pcBoardTo' : 'pcBoardFrom';
    popup.find('[data-date-input="' + id + '"] .is-selected').trigger('focus');
}

//기간 달력 표시
function renderPcBoardPeriod() {
    const from = $('#pcBoardFrom').val();
    const to = $('#pcBoardTo').val();
    const today = cmGetToday('-');
    $('#pcBoardDateCalendars [data-date-input]').each(function (index) {
        const calendar = $(this);
        const monthKey = calendar.attr('data-month');
        const date = new Date(monthKey + '-01T00:00:00');
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const selected = index === 0 ? from : to;
        const title = index === 0 ? '시작일' : '종료일';
        const years = Array.from({length: 41}, function (_, offset) {
            const value = year - 20 + offset;
            return `<option value="${value}"${value === year ? ' selected' : ''}>${value}년</option>`;
        }).join('');
        const months = Array.from({length: 12}, function (_, offset) {
            const value = String(offset + 1).padStart(2, '0');
            return `<option value="${value}"${offset === month ? ' selected' : ''}>${offset + 1}월</option>`;
        }).join('');
        const cells = Array.from({length: 42}, function (_, offset) {
            const day = offset - date.getDay() + 1;
            if (day < 1 || day > days) return '<span aria-hidden="true"></span>';
            const ymd = monthKey + '-' + String(day).padStart(2, '0');
            let cls = '';
            if (offset % 7 === 0) cls += ' is-sunday';
            if (offset % 7 === 6) cls += ' is-saturday';
            if (from && to && ymd >= from && ymd <= to) cls += ' is-in-range';
            if (ymd === today) cls += ' is-today';
            if (ymd === selected) cls += ' is-selected';
            return `<button type="button" class="${cls}" data-date="${ymd}" aria-label="${title} ${ymd}" aria-pressed="${ymd === selected}">${day}</button>`;
        }).join('');
        calendar.html(`
            <h3>${title}</h3>
            <div class="pc-board-date-heading">
                <button type="button" data-month-step="-1" aria-label="${title} 이전 달"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
                <select data-month-field="year" aria-label="${title} 연도">${years}</select>
                <select data-month-field="month" aria-label="${title} 월">${months}</select>
                <button type="button" data-month-step="1" aria-label="${title} 다음 달"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
            </div>
            <div class="pc-board-date-weekdays" aria-hidden="true"><span class="is-sunday">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="is-saturday">토</span></div>
            <div class="pc-board-date-days">${cells}</div>
            <button type="button" class="pc-board-date-today" data-date="${today}">오늘</button>`);
    });
}
