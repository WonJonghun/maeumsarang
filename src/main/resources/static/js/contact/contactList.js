$(function () {
    // 초기 리스트 호출
    loadContactList();
    bindEvents();
    initDeptSuggest();
});

let contactListAll = [];
let currentView = 'all';
let contactRendered = false;
let compactRendered = false;

// 직원연락처 리스트 호출
function loadContactList() {
    cmAjax('/contact/list.do', 'GET', { baseDt: cmGetToday('-') }, true).done(function (list) {
        contactListAll = list || [];
        setView(currentView);
        setDeptSuggest();
    });
}

//이벤트
function bindEvents() {
    //카테고리 클릭
    $('.contact-tab').on('click', function () {
        let view = $(this).data('view');
        currentView = view;

        $('.contact-tab').removeClass('is-active').attr('aria-selected', 'false');
        $(this).addClass('is-active').attr('aria-selected', 'true');

        const keyword = $.trim($('#searchKeyword').val() || '');

        setView(view);

        if (currentView === 'myDept') {
            contactFiltered(keyword, myDeptList(contactListAll));
            return;
        }
        if (keyword) {
            if (currentView === 'compact') compactFiltered(keyword);
            else contactFiltered(keyword);
            return;
        }
        if (currentView === 'compact') compactContactList(contactListAll, '');
        else contactList(contactListAll, '');
    });

    // 상단바 검색이벤트
    $(document).off('topbar:search.contactList').on('topbar:search.contactList', function (e, p) {
        const kw = p && p.searchKeyword;
        if (currentView === 'compact') {
            compactFiltered(kw);
            return;
        }
        if (currentView === 'myDept') {
            contactFiltered(kw, myDeptList(contactListAll));
            return;
        }

        contactFiltered(kw);
    });

    // 타이핑 즉시 필터링
    $('#searchKeyword').off('input.contactList').on('input.contactList', function () {
        const kw = $(this).val();
        if (currentView === 'compact') {
            compactFiltered(kw);
            return;
        }
        if (currentView === 'myDept') {
            contactFiltered(kw, myDeptList(contactListAll));
            return;
        }

        contactFiltered(kw);
    });

    // 리스트 클릭
    $(document).on('click', '.contact-card-item', function () {
        const item = $(this).closest('.contact-card-item');
        const expand = item.find('.contact-expand');

        $('.contact-card-item').not(item).removeClass('is-open').find('.contact-expand').slideUp(120);
        $('.contact-card-item').not(item).find('.contact-profile-img').each(function () {
            const thumb = $(this).data('thumb');
            if (thumb) $(this).attr('src', thumb);
        });

        if (item.hasClass('is-open')) {
            item.removeClass('is-open');
            expand.slideUp(120);

            const img = item.find('.contact-profile-img');
            const thumb = img.data('thumb');
            if (thumb) img.attr('src', thumb);
        } else {
            item.addClass('is-open');
            expand.slideDown(120);

            const img = item.find('.contact-profile-img');
            const origin = img.data('origin');
            if (origin) img.attr('src', origin);
        }
    });

    // 직통 클릭
    $(document).on('click', '.contact-ext-call', function (e) {
        e.stopPropagation();

        const ext = String($(this).data('ext') || '').replace(/[^0-9]/g, '');
        if (!ext) return;

        const prefix = '0632402';
        window.location.href = 'tel:' + prefix + ext;
    });

    // 전화 아이콘
    $(document).on('click', '.contact-action-call', function (e) {
        e.stopPropagation();
        const phone = $(this).closest('.contact-actions').data('phone');
        if (!phone) return;
        window.location.href = 'tel:' + String(phone).replace(/[^0-9+]/g, '');
    });

    // 문자 아이콘
    $(document).on('click', '.contact-action-sms', function (e) {
        e.stopPropagation();
        const phone = $(this).closest('.contact-actions').data('phone');
        if (!phone) return;
        window.location.href = 'sms:' + String(phone).replace(/[^0-9+]/g, '');
    });
}

//부서명 연관검색어 초기화
function initDeptSuggest() {
    const searchField = $('.contact-page .topbar-search-field');
    if (!searchField.length) return;

    if (!$('#contactDeptSuggestToggle').length) {
        searchField.append('<button type="button" id="contactDeptSuggestToggle" class="contact-dept-suggest-toggle" aria-label="부서명 목록"></button>');
    }

    if (!$('#contactDeptSuggest').length) {
        searchField.append('<div id="contactDeptSuggest" class="contact-dept-suggest" style="display:none;"></div>');
    }

    $('#searchKeyword').off('focus.contactDeptSuggest').on('focus.contactDeptSuggest', function () {
        showDeptSuggest();
    });

    $('#contactDeptSuggestToggle').off('mousedown.contactDeptSuggest').on('mousedown.contactDeptSuggest', function (e) {
        e.preventDefault();
    });

    $('#contactDeptSuggestToggle').off('click.contactDeptSuggest').on('click.contactDeptSuggest', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if ($('#contactDeptSuggest').is(':visible')) {
            hideDeptSuggest();
            return false;
        }

        $('#searchKeyword').focus();
        showDeptSuggest();
        return false;
    });

    searchField.off('mousedown.contactDeptSuggest').on('mousedown.contactDeptSuggest', '.contact-dept-suggest-item', function (e) {
        e.preventDefault();

        $('#searchKeyword').val($(this).text()).trigger('input');
        hideDeptSuggest();
    });

    $('#searchKeyword').off('blur.contactDeptSuggest').on('blur.contactDeptSuggest', function () {
        setTimeout(function () {
            hideDeptSuggest();
        }, 120);
    });
}

//부서명 연관검색어 세팅
function setDeptSuggest() {
    const deptMap = {};
    let html = '';

    (contactListAll || []).forEach(function (row) {
        const dept = $.trim((row && row.icBuserNm) || '');
        if (!dept || deptMap[dept]) return;

        deptMap[dept] = true;
        html += '<button type="button" class="contact-dept-suggest-item">' + cmEscapeHtml(dept) + '</button>';
    });

    $('#contactDeptSuggest').html(html);

    if ($('#searchKeyword').is(':focus')) {
        showDeptSuggest();
    }
}

//부서명 연관검색어 열기
function showDeptSuggest() {
    const suggest = $('#contactDeptSuggest');
    if (!suggest.length || !$.trim(suggest.html() || '')) return;

    suggest.show();
    $('#contactDeptSuggestToggle').addClass('is-open');
}

//부서명 연관검색어 닫기
function hideDeptSuggest() {
    $('#contactDeptSuggest').hide();
    $('#contactDeptSuggestToggle').removeClass('is-open');
}

//간편조회 검색필터
function compactFiltered(keyword) {
    const k = $.trim(keyword || '');
    if (!k) {
        compactContactList(contactListAll, '');
        return;
    }

    const lk = k.toLowerCase();
    const lkNum = lk.replace(/[^0-9]/g, '');

    const filtered = (contactListAll || []).filter(function (row) {
        row = row || {};
        const dept = row.icBuserNm || '';
        const rank = row.icJik3 || row.icJikgub || '';
        const name = row.icName || '';
        const hp = row.icHPphone || '';
        const sa = row.icSaphone || '';

        const text = (dept + ' ' + rank + ' ' + name + ' ' + hp + ' ' + sa).toLowerCase();
        if (text.indexOf(lk) > -1) return true;

        if (lkNum) {
            const hpNum = (hp || '').replace(/[^0-9]/g, '');
            const saNum = (sa || '').replace(/[^0-9]/g, '');
            return (hpNum.indexOf(lkNum) > -1) || (saNum.indexOf(lkNum) > -1);
        }
        return false;
    });

    filtered.sort(function (a, b) {
        a = a || {};
        b = b || {};

        const aBuser = a.icBuser || '';
        const bBuser = b.icBuser || '';
        if (aBuser !== bBuser) return aBuser.localeCompare(bBuser);

        const aJik = a.icJikgub1 || a.icJikgub || '';
        const bJik = b.icJikgub1 || b.icJikgub || '';
        if (aJik !== bJik) return aJik.localeCompare(bJik);

        const aIn = a.icIndate || '';
        const bIn = b.icIndate || '';
        if (aIn !== bIn) return aIn.localeCompare(bIn);

        const aName = a.icName || '';
        const bName = b.icName || '';
        return aName.localeCompare(bName);
    });

    compactContactList(filtered, k);
}

//전체조회 검색필터
function contactFiltered(keyword, baseList) {
    const src = baseList || contactListAll;

    const k = $.trim(keyword || '');
    if (!k) {
        contactList(src, '');
        return;
    }

    const lk = k.toLowerCase();
    const lkNum = lk.replace(/[^0-9]/g, '');

    const filtered = (src || []).filter(function (row) {
        row = row || {};

        const dept = row.icBuserNm || '';
        const rank = row.icJik3 || row.icJikgub || '';
        const name = row.icName || '';

        const hp = row.icHPphone || row.icHp || '';
        const sa = row.icSaphone || row.icTel || '';

        const text = (dept + ' ' + rank + ' ' + name + ' ' + hp + ' ' + sa).toLowerCase();
        if (text.indexOf(lk) > -1) return true;

        if (lkNum) {
            const hpNum = (hp || '').replace(/[^0-9]/g, '');
            const saNum = (sa || '').replace(/[^0-9]/g, '');
            return (hpNum.indexOf(lkNum) > -1) || (saNum.indexOf(lkNum) > -1);
        }
        return false;
    });

    contactList(filtered, k);
}

//카테고리 별 html
function setView(view) {
    $('.contact-view').hide();

    if (view === 'all') {
        $('#viewAll').show();
        if (!contactRendered) {
            contactList(contactListAll, '');
            contactRendered = true;
        }
    }

    if (view === 'myDept') {
        $('#viewAll').show();
        contactList(myDeptList(contactListAll), '');
        return;
    }

    if (view === 'compact') {
        $('#viewCompact').show();
        if (!compactRendered) {
            compactContactList(contactListAll, '');
            compactRendered = true;
        }
    }
}

//간편조회 테이블 그리기
function compactContactList(list, keyword) {
    list = list || [];
    $('#contactTotalCnt').text(Number(list.length || 0).toLocaleString());

    let html = ''
        + '<div class="contact-table-wrap">'
        + '<table class="contact-table">'
        + '  <thead>'
        + '    <tr>'
        + '      <th>부서명</th>'
        + '      <th>직급명</th>'
        + '      <th>이름</th>'
        + '      <th>휴대폰번호</th>'
        + '      <th>직통번호</th>'
        + '    </tr>'
        + '  </thead>'
        + '  <tbody>';

    if (!list.length) {
        html += '<tr><td colspan="5">데이터가 없습니다.</td></tr>';
        html += '  </tbody></table></div>';
        $('#viewCompact').html(html);
        return;
    }

    for (let i = 0; i < list.length;) {
        const dept = list[i].icBuserNm || '';
        let deptSpan = 1;
        while (i + deptSpan < list.length && (list[i + deptSpan].icBuserNm || '') === dept) deptSpan++;

        for (let j = i; j < i + deptSpan;) {
            const rank = list[j].icJik3 || list[j].icJikgub || '';
            let rankSpan = 1;
            while (j + rankSpan < i + deptSpan) {
                const nextRank = list[j + rankSpan].icJik3 || list[j + rankSpan].icJikgub || '';
                if (nextRank !== rank) break;
                rankSpan++;
            }

            for (let r = 0; r < rankSpan; r++) {
                const rowIdx = j + r;
                const row = list[rowIdx] || {};

                const name = row.icName || '';
                const hp = row.icHPphone || '';
                const sa = row.icSaphone || '';
                const hpTel = (hp || '').replace(/[^0-9+]/g, '');

                const deptHtml = kwHighlight(dept, keyword);
                const rankHtml = kwHighlight(rank, keyword);
                const nameHtml = kwHighlight(name, keyword);
                const hpHtml = kwHighlight(hp, keyword);
                const saHtml = kwHighlight(sa, keyword);

                html += '<tr>'
                    + (j === i && r === 0
                        ? '<td class="group-cell dept-cell" rowspan="' + deptSpan + '">' + deptHtml + '</td>'
                        : '')
                    + (r === 0
                        ? '<td class="group-cell rank-cell" rowspan="' + rankSpan + '">' + rankHtml + '</td>'
                        : '')
                    + '<td>' + nameHtml + '</td>'
                    + '<td>' + (hpTel ? '<a class="tel-link" href="tel:' + hpTel + '">' + hpHtml + '</a>' : hpHtml) + '</td>'
                    + '<td>' + saHtml + '</td>'
                    + '</tr>';
            }

            j += rankSpan;
        }

        i += deptSpan;
    }

    html += '  </tbody></table></div>';
    $('#viewCompact').html(html);
}

//연락처 목록 그리기
function contactList(list, keyword) {
    list = list || [];
    $('#contactTotalCnt').text(Number(list.length || 0).toLocaleString());

    //가나다라 정렬
    const sortedList = list.slice().sort(function (a, b) {
        const nameA = (a && a.icName ? a.icName : '');
        const nameB = (b && b.icName ? b.icName : '');
        return nameA.localeCompare(nameB, 'ko');
    });

    let html = ''
        + '<div class="contact-card-list">'
        + '  <ul class="contact-card-items">';

    if (!sortedList.length) {
        html += ''
            + '    <li class="contact-card-item">'
            + '      <div class="contact-card">'
            + '        <div class="contact-info">'
            + '          <div class="contact-name">데이터가 없습니다.</div>'
            + '        </div>'
            + '      </div>'
            + '    </li>'
            + '  </ul>'
            + '</div>';
        $('#viewAll').html(html);
        return;
    }

    const defaultAvatarUrl = '/images/emptyUser.png';

    for (let i = 0; i < sortedList.length; i++) {
        const row = sortedList[i] || {};

        const nameRaw = row.icName || '';
        const rankRaw = row.icJik3 || row.icJikgub || '';
        const deptRaw = row.icBuserNm || '';

        const hpRaw = row.icHPphone || row.icHp || '';
        const saRaw = row.icSaphone || row.icTel || '';

        const afNum = $.trim(row.icCode || ''); // 사번
        const photoUrl = afNum ? ('/attach/blobImageRequest.do?afNum=' + encodeURIComponent(afNum)) : '';
        const thumbUrl = afNum ? ('/attach/thumbnailImageRequest.do?size=90&afNum=' + encodeURIComponent(afNum)) : '';
        const imgUrl = thumbUrl ? thumbUrl : defaultAvatarUrl;

        const name = kwHighlight(nameRaw, keyword);
        const rank = kwHighlight(rankRaw, keyword);
        const dept = kwHighlight(deptRaw, keyword);

        const hp = kwHighlight(hpRaw, keyword);
        const sa = kwHighlight(saRaw, keyword);

        const actionPhone = cmEscapeHtml(hpRaw);
        const ext = String(saRaw || '').replace(/[^0-9]/g, '');

        html += ''
            + '    <li class="contact-card-item" data-phone="' + actionPhone + '">'
            + '      <div class="contact-row">'
            + '        <img class="contact-profile-img" alt="" loading="lazy" decoding="async"'
            + '             src="' + imgUrl + '"'
            + '             data-thumb="' + imgUrl + '"'
            + '             data-origin="' + photoUrl + '"'
            + '             data-default="' + defaultAvatarUrl + '" />'
            + '        <div class="contact-body">'
            + '          <div class="contact-card">'
            + '            <div class="contact-info">'
            + '              <div class="contact-name">' + name + '</div>'
            + '              <div class="contact-meta">' + rank + (rankRaw && deptRaw ? ' / ' : '') + dept + '</div>'
            + '            </div>'
            + '            <span class="contact-toggle-ico" aria-hidden="true"></span>'
            + '          </div>'
            + '          <div class="contact-expand" style="display:none;">'
            + '            <div class="contact-expand-inner">'

            + '              <div class="contact-phone-lines">'
            + '                <div class="contact-phone-line"><span class="contact-phone-label">휴대폰</span><span class="contact-phone-sep"> | </span><span class="contact-phone-val">' + hp + '</span></div>'
            + '                <div class="contact-phone-line"><span class="contact-phone-label">직&nbsp;&nbsp;&nbsp;통</span><span class="contact-phone-sep"> | </span><span class="contact-phone-val contact-ext-call" data-ext="' + ext + '">' + sa + '</span></div>'
            + '              </div>'
            + '              <div class="contact-actions" data-phone="' + actionPhone + '">'
            + '                <button type="button" class="contact-action-btn contact-action-call" aria-label="전화">'
            + '                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.6 3 3.7 5.1 6.7 6.7l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.8.7.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.6 22 2 13.4 2 3c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.6.7 3.8.1.4 0 .8-.3 1.1l-2.4 2.1z"/></svg>'
            + '                </button>'
            + '                <button type="button" class="contact-action-btn contact-action-sms" aria-label="문자">'
            + '                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 1.4 0 2 0V4c0-1.1-.9-2-2-2z"/></svg>'
            + '                </button>'
            + '              </div>'
            + '            </div>'
            + '          </div>'
            + '        </div>'
            + '      </div>'
            + '    </li>';
    }

    html += ''
        + '  </ul>'
        + '</div>';

    $('#viewAll').html(html);
}

//내 부서 그리기
function myDeptList(list) {
    const myDeptCd = $.trim($('#loginBuser').val() || '');

    return (list || []).filter(function (row) {
        row = row || {};
        return $.trim(row.icBuser || '') === myDeptCd;
    });
}

//글자 하이라이트
function kwHighlight(text, keyword) {
    const k = $.trim(keyword || '');
    if (!k) return cmEscapeHtml(text);

    const safeText = cmEscapeHtml(text);
    const escapedKw = cmEscapeHtml(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return safeText.replace(new RegExp(escapedKw, 'gi'), '<span class="kw-highlights">$&</span>');
}