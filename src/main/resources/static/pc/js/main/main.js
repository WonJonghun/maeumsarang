$(function () {
    //식단 기본 선택
    const state = JSON.parse(window.frameElement?.getAttribute('data-state') ?? 'null');
    const today = cmGetToday('-');
    const selected = state?.selectedDate ?? today;
    const now = new Date();
    const minute = now.getHours() * 60 + now.getMinutes();
    const meal = state?.meal ?? (minute <= 540 ? 1 : minute <= 810 ? 2 : 3);

    $('#pcMealTabs button')
        .attr('aria-pressed', 'false')
        .filter('[data-meal="' + meal + '"]')
        .attr('aria-pressed', 'true');

    //초기화
    updatePcMainClock();
    setInterval(updatePcMainClock, 1000);
    loadPcMainNotifications();
    loadPcMainVacation(today);
    loadPcMainDay(selected);
    loadPcMainCalendar(state?.calendarMonth ? state.calendarMonth + '-01' : selected);
    loadPcMainBoards();
    loadPcMainBulletin();

    //카드 목록 스크롤 안내
    const scrolls = $('#pcDashboard .pc-main-body').not('#pcMainCalendar, #pcMealMenus');
    scrolls.each(function () {
        $(this).parent().addClass('pc-main-scroll').append(`
            <button type="button" class="pc-main-scroll-hint" title="목록 맨 아래로 이동"
                    aria-label="목록 맨 아래로 이동" aria-controls="${cmEscapeHtml(this.id)}" hidden>
                <i class="bi bi-chevron-down" aria-hidden="true"></i>
            </button>`);
        updatePcMainScroll(this);
    });
    scrolls.on('scroll animationend', function () {
        updatePcMainScroll(this);
    });
    $('#pcDashboard').on('click', '.pc-main-scroll-hint', function () {
        const scroll = $(this).siblings('.pc-main-body')[0];
        scroll.scrollTo({top: scroll.scrollHeight, behavior: 'smooth'});
    }).on('wheel', '.pc-main-scroll-hint', function (event) {
        event.preventDefault();
        const scroll = $(this).siblings('.pc-main-body')[0];
        scroll.scrollBy({top: event.originalEvent.deltaY, left: event.originalEvent.deltaX});
    });
    const scrollObserver = new ResizeObserver(function (entries) {
        entries.forEach(entry => updatePcMainScroll(entry.target));
    });
    const contentObserver = new MutationObserver(function () {
        scrolls.each(function () {
            updatePcMainScroll(this);
        });
    });
    scrolls.each(function () {
        scrollObserver.observe(this);
        contentObserver.observe(this, {
            childList: true,
            subtree: true,
            attributes: true,
        });
        document.fonts.ready.then(function () {
            attributeFilter: ['hidden']
        });
        scrolls.each(function () {
            updatePcMainScroll(this);
        });
    });

    //카드 높이 맞춤
    const center = $('.pc-dashboard-column-center')[0];
    const observer = new ResizeObserver(function () {
        const gap = parseFloat(getComputedStyle(center).rowGap);
        const brand = $('.pc-brand-card').outerHeight();
        const meal = $('.pc-meal-card').outerHeight();
        const duty = parseFloat(getComputedStyle($('.pc-duty-card')[0]).minHeight);

        $(center).css('min-height', brand + meal + gap * 2 + duty);

        const height = $(center).outerHeight();
        $('.pc-people-card').css('height', height - $('.pc-myinfo-card').outerHeight() - gap);
        $('.pc-duty-card').css('height', height - brand - meal - gap * 2);
    });
    observer.observe(center);
    observer.observe($('.pc-meal-card')[0]);
    observer.observe($('.pc-brand-card')[0]);

    //달력과 일정 높이 맞춤
    const calendar = $('.pc-calendar')[0];
    new ResizeObserver(function () {
        $('.pc-main-schedules').css('height', $(calendar).outerHeight());
    }).observe(calendar);

    //직원 사진 미리보기
    const preview = $(`
        <div id="pcPersonPhotoPreview" class="pc-person-photo-preview" role="tooltip" hidden>
            <span class="pc-person-photo-frame">
                <i class="bi bi-person-fill" aria-hidden="true"></i>
                <img alt="">
            </span>
            <span class="pc-person-photo-name"></span>
        </div>`).appendTo('body');
    const previewImage = preview.find('img');
    let previewTimer;
    const hidePhoto = function () {
        clearTimeout(previewTimer);
        preview.prop('hidden', true);
        $('#pcDashboard [aria-describedby="pcPersonPhotoPreview"]').removeAttr('aria-describedby');
    };

    previewImage.on('load', function () {
        preview.removeClass('is-loading');
    }).on('error', function () {
        if ($(this).attr('src') === '/images/emptyUser.png') {
            hidePhoto();
            return;
        }
        $(this).attr('src', '/images/emptyUser.png');
    });

    $('#pcDashboard').on('mouseenter focusin', '.pc-person-name[data-user-id]:not([data-user-id=""])', function () {
        hidePhoto();
        const name = $(this);
        previewTimer = setTimeout(function () {
            if (!name[0].isConnected) return;

            const id = name.attr('data-user-id');
            let photoId = id.trim();
            if (name.closest('#pcMainVacations, #pcMainBirthdays').length) {
                photoId = photoId.replace(/^00(?=\d{4}$)/, '');
            }
            previewImage.attr('alt', name.text() + ' 사진');
            preview.find('.pc-person-photo-name').text(name.text());
            preview.attr('data-user-id', id);
            if (preview.attr('data-photo-id') !== photoId) {
                preview.attr('data-photo-id', photoId).addClass('is-loading');
                previewImage.attr('src', '/attach/profileView.do?afNum=' + encodeURIComponent(photoId) + '&afSeq=1&thumbnail=true');
            }
            preview.prop('hidden', false);
            name.attr('aria-describedby', 'pcPersonPhotoPreview');

            const rect = name[0].getBoundingClientRect();
            const width = preview.outerWidth();
            const height = preview.outerHeight();
            const top = rect.top - height - 8;
            preview.css({
                left: Math.max(12, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 12)),
                top: Math.max(12, Math.min(top < 12 ? rect.bottom + 8 : top, window.innerHeight - height - 12))
            });
        }, 150);
    }).on('mouseleave focusout', '.pc-person-name[data-user-id]:not([data-user-id=""])', hidePhoto);

    $('#pcCalendarDays, #pcCalendarPrev, #pcCalendarNext, #pcCalendarToday').on('click', hidePhoto);
    $('#cmPopup').on('close', hidePhoto);
    $('.pc-person-list, .pc-duty-list, .pc-content').on('scroll', hidePhoto);
    $(window).on('resize', hidePhoto);
    $(document).on('pcWorkTab:hide cmPopup:closed', hidePhoto);

    //자동 갱신 요청은 로그인 사용 시간에서 제외
    let automatic = false;
    let pendingRefresh = null;
    let changes;
    let leaving = false;
    $(document).on('ajaxSend', function (event, xhr, settings) {
        if (automatic) {
            xhr.setRequestHeader('X-PC-Main-Refresh', 'true');
            settings.pcMainRefresh = true;
        }
    }).on('ajaxError', function (event, xhr, settings) {
        if (settings.pcMainRefresh && xhr.status === 401) {
            leaving = true;
            changes.close();
            window.top.location.replace('/pc/main.do');
        }
    }).on('ajaxStop', function () {
        if (leaving) return;
        if (pendingRefresh !== null) {
            $(document).trigger('pcWorkTab:refresh', [pendingRefresh]);
        } else if (changes.readyState === EventSource.CLOSED) {
            connectChanges();
        }
    });

    //로고 클릭·변경 알림 수신 시 데이터 갱신
    $(document).on('pcWorkTab:refresh', function (event, background = false) {
        if ($.active) {
            pendingRefresh = pendingRefresh === false ? false : background;
            return;
        }
        pendingRefresh = null;
        hidePhoto();
        automatic = background;
        try {
            loadPcMainNotifications();
            loadPcMainVacation(cmGetToday('-'), true);
            loadPcMainDay($('#pcDashboard').attr('data-selected-date'), true, background);
            loadPcMainCalendar($('#pcCalendarMonth').attr('data-month') + '-01');
            loadPcMainBoards(true);
            loadPcMainBulletin(true);
        } finally {
            automatic = false;
        }
    });

    //서버 변경 알림 연결·해제
    const connectChanges = function () {
        $('#pcDashboard').attr('data-change-state', 'connecting');
        changes = new EventSource('/pc/main/changes.do?version='
            + encodeURIComponent($('#pcDashboard').attr('data-change-version')));
        changes.addEventListener('open', function () {
            $('#pcDashboard').attr('data-change-state', 'connected');
        });
        changes.addEventListener('error', function () {
            $('#pcDashboard').attr('data-change-state', 'disconnected');
        });
        changes.addEventListener('changed', function (event) {
            if (event.lastEventId) $('#pcDashboard').attr('data-change-version', event.lastEventId);
            $(document).trigger('pcWorkTab:refresh', [true]);
        });
        changes.addEventListener('session-expired', function () {
            leaving = true;
            changes.close();
            window.top.location.replace('/pc/main.do');
        });
    };
    connectChanges();
    $(window).on('pagehide', function () {
        leaving = true;
        changes.close();
    }).on('pageshow', function (event) {
        if (event.originalEvent.persisted) {
            leaving = false;
            connectChanges();
        }
    });

    //업무 탭 상태 저장·복원
    $(document).on('pcWorkTab:save', function () {
        window.parent.savePcWorkTabState(window.frameElement.getAttribute('data-tab-key'), {
            selectedDate: $('#pcDashboard').attr('data-selected-date'),
            calendarMonth: $('#pcCalendarMonth').attr('data-month'),
            meal: Number($('#pcMealTabs [aria-pressed="true"]').attr('data-meal')),
            scroll: $('#pcContent').scrollTop()
        });
    });
    $(window).on('load', function () {
        $('#pcContent').scrollTop(state?.scroll ?? 0);
    });

    //직원 정보·달력 팝업
    $('#pcDashboard').on('click keydown', '.pc-person-name[data-user-id]:not([data-user-id=""])', function (event) {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        hidePhoto();
        cmOpenPopup('/pc/main/employeePopup.do', 880, 439, {
            userId: $(this).attr('data-user-id'),
            baseDt: $('#pcDashboard').attr('data-selected-date'),
            formatted: $(this).closest('#pcMainVacations, #pcMainBirthdays').length > 0
        }, '직원정보', true);
    });

    //이전·다음 달 선택
    $('#pcCalendarPrev, #pcCalendarNext').on('click', function () {
        const date = new Date($('#pcCalendarMonth').attr('data-month') + '-01T00:00:00');
        date.setMonth(date.getMonth() + (this.id === 'pcCalendarPrev' ? -1 : 1));
        loadPcMainCalendar(cmFormatYmd(date, '-'));
    });

    //오늘 선택
    $('#pcCalendarToday').on('click', function () {
        const today = cmGetToday('-');
        loadPcMainDay(today);
        loadPcMainCalendar(today);
    });

    //날짜 선택
    $('#pcCalendarDays').on('click', '.pc-calendar-day', function () {
        const ymd = $(this).attr('data-date');
        $('#pcMainCalendar').attr('data-selected-date', ymd);
        $('#pcCalendarDays button').attr('aria-pressed', 'false');
        $(this).attr('aria-pressed', 'true');
        loadPcMainDay(ymd);

        if (ymd.substring(0, 7) !== $('#pcCalendarMonth').attr('data-month')) {
            loadPcMainCalendar(ymd);
        }
    });

    //프로필 기본 이미지
    $('#pcMainProfileImage').on('error', function () {
        $(this).off('error').attr('src', $(this).attr('data-fallback-src'));
    });
    const photo = $('#pcMainProfileImage')[0];
    if (photo.complete && photo.naturalWidth === 0) {
        $(photo).trigger('error');
    }

    //게시글 상세
    $('#pcDashboard').on('click', '.pc-main-post-title', function () {
        hidePhoto();
        const tvUk = $(this).attr('data-tv-uk');
        const flag = Number(tvUk.charAt(0));
        const title = flag === 1 ? '직원공지사항' : $(this).closest('.pc-main-card').find('h2').text();
        cmOpenPopup('/pc/notice/detailPopup.do', 900, 760, {
            tnFlag: flag,
            tvUk: tvUk
        }, title, false, 'cm-popup-board');
    });

    //상세 조회 성공 시 읽음 표시
    $(document).on('cmPopup:loaded', function (event, frame) {
        const detail = $(frame.contentDocument).find('.pc-board-detail');
        if (!detail.length) return;
        $('#pcDashboard .pc-main-post-title').filter(function () {
            return $(this).attr('data-tv-uk') === detail.attr('data-tv-uk');
        }).closest('.pc-main-post').removeClass('is-unread');
    });

    //게시판 전체보기
    $('.pc-board-more').on('click', function () {
        openPcWorkTab('board', '전자게시판', '/pc/notice/board.do', {
            ccWinCode: 'w_gongji_list',
            ccBaseKey: $(this).attr('data-base-key')
        });
    });

    //식단 탭 선택
    $('#pcMealTabs').on('click', 'button', function () {
        $('#pcMealTabs button').attr('aria-pressed', 'false');
        $(this).attr('aria-pressed', 'true');
        $('#pcMealMenus .pc-meal-section')
            .prop('hidden', true)
            .filter('[data-meal="' + $(this).attr('data-meal') + '"]')
            .prop('hidden', false);
    });
});

//업무 알림 조회
function loadPcMainNotifications() {
    cmAjax('/profile/pc/checkApproList.do', 'GET', {}, false).done(function (list) {
        const row = list[0];
        const fields = {
            approval: 'ccCnt1',
            mail: 'ccCnt99',
            official: 'ccCnt12',
            post: 'ccCnt22',
            parcel: 'ccCnt32',
            coop: 'ccCnt2'
        };

        $.each(fields, function (key, field) {
            const count = row ? Number(row[field]) || 0 : 0;
            const badge = $('.pc-notification-badge[data-key="' + key + '"]');
            const button = badge.parent();
            const label = button.children('span').first().text();

            badge.text(count).prop('hidden', count <= 0);
            button.attr('aria-label', count > 0 ? label + ' 알림 ' + count + '건' : label);
        });
    });
}

//내 휴가 현황 조회
function loadPcMainVacation(ymd, refresh) {
    if (!refresh) {
        $('#pcLeaveTotal, #pcLeaveUsed, #pcLeaveLeft').text('—');
        $('#pcLeaveLeft').parent().removeClass('is-positive is-negative');
    }
    $('#pcLeaveStatus').text('').prop('hidden', true);
    cmAjax('/vacation/status.do', 'GET', {
        ccCode: $('#pcDashboard').attr('data-user-id'),
        searchDate: ymd
    }, !refresh).done(function (row) {
        if (!row) {
            $('#pcLeaveTotal, #pcLeaveUsed, #pcLeaveLeft').text('—');
            $('#pcLeaveLeft').parent().removeClass('is-positive is-negative');
            $('#pcLeaveStatus').text('휴가 정보가 없습니다.').prop('hidden', false);
            return;
        }

        $('#pcLeaveTotal').text(row.flag21);
        $('#pcLeaveUsed').text(row.flag22);
        $('#pcLeaveLeft').text(row.changeJan).parent()
            .toggleClass('is-positive', row.changeJan > 0)
            .toggleClass('is-negative', row.changeJan < 0);
    }).fail(function () {
        $('#pcLeaveStatus').text('휴가 정보를 불러오지 못했습니다.').prop('hidden', false);
    });
}

//메인 달력 조회
function loadPcMainCalendar(ymd) {
    const calendar = $('#pcMainCalendar');
    const dashboard = $('#pcDashboard');
    calendar.attr({
        'data-user-id': dashboard.attr('data-user-id'),
        'data-team-code': dashboard.attr('data-team-code'),
        'data-work-flag': dashboard.attr('data-work-flag'),
        'data-selected-date': dashboard.attr('data-selected-date') || ymd,
        'data-loading': 'false'
    });
    loadPcCalendar(calendar, ymd);
}

//선택일 업무 현황 조회
function loadPcMainDay(ymd, refresh, automatic) {
    $('#pcDashboard').attr('data-selected-date', ymd);
    $('.pc-selected-date').text(formatPcCalendarDate(ymd).substring(5));
    loadPcMainCommute(ymd, refresh);
    if (!refresh) {
        $('#pcMainSchedules, #pcMainPatients, #pcMealMenus').html('<p class="pc-main-empty">조회 중입니다.</p>');
        $('#pcMainVacations, #pcMainBirthdays, #pcMainDuty, #pcMainOutDuty').html('<li class="pc-main-empty">조회 중입니다.</li>');
        $('#pcVacationCount, #pcBirthdayCount').text('—');
    }

    cmAjax('/schedule/todayScheduleList.do', 'GET', {
        searchDate: ymd,
        ccBuser: $('#pcDashboard').attr('data-team-code'),
        userId: $('#pcDashboard').attr('data-user-id')
    }, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        const html = list.map(function (item) {
            const {time, remark} = detailPcMainSchedule(item);

            return `
                <div class="pc-main-schedule">
                    ${time ? `<time>${cmEscapeHtml(time)}</time>` : ''}
                    <p>${cmNl2br(remark)}</p>
                </div>`;
        }).join('');

        $('#pcMainSchedules').html(list.length ? html : '<p class="pc-main-empty">등록된 일정이 없습니다.</p>');
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMainSchedules').html('<p class="pc-main-empty">일정을 불러오지 못했습니다.</p>');
    });

    cmAjax('/customer/dailyStats.do', 'GET', {baseDt: ymd}, false).done(function (data) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        if (!data) {
            $('#pcMainPatients').html('<p class="pc-main-empty">환자 현황이 없습니다.</p>');
            return;
        }

        const beds = cmToNumber(data.srTo);
        const total = cmToNumber(data.cnt1);
        const emergency = cmToNumber(data.emergencyCnt);
        const admit = cmToNumber(data.cnt4);
        const discharge = cmToNumber(data.cnt5);
        const register = cmToNumber(data.cnt8);
        const exam = cmToNumber(data.cnt9);
        const metrics = [
            {
                name: '재원',
                color: '#004a80',
                percent: beds ? Math.round(total * 100 / beds) : 0,
                number: total + '<small>명</small>',
                detail: '허가병상 ' + beds + '병상'
            },
            {
                name: '급성기병상',
                color: '#c56753',
                percent: Math.round(emergency * 100 / 40),
                number: emergency + '<small>명</small>',
                detail: '급성기병상 40병상'
            },
            {
                name: '입 · 퇴원',
                isInout: true,
                color: '#fda433',
                percent: admit + discharge ? Math.round(discharge * 100 / (admit + discharge)) : 0,
                number: admit + ' / ' + discharge,
                detail: '월 누계 ' + cmToNumber(data.cnt2) + ' / ' + cmToNumber(data.cnt3)
            },
            {
                name: '외래',
                color: '#52a243',
                percent: register ? Math.round(exam * 100 / register) : 0,
                number: exam + '<small>명</small>',
                detail: '접수 ' + register + '명'
            }
        ];
        const html = metrics.map(function (item) {
            const percent = Math.max(0, Math.min(item.percent, 100));

            if (item.isInout) {
                return `
                    <div class="pc-patient-metric pc-patient-inout${admit + discharge ? '' : ' is-empty'}">
                        <h3>${item.name}</h3>
                        <div class="pc-patient-ring"
                             style="--metric-color:${item.color};--metric-percent:${percent}"
                             aria-label="당일 입원 ${admit}명, 퇴원 ${discharge}명">
                            <span>${item.number}<small>당일</small></span>
                        </div>
                        <div class="pc-patient-number pc-patient-inout-labels">
                            <span class="pc-patient-admit">입원</span>
                            <span class="pc-patient-discharge">퇴원</span>
                        </div>
                        <small class="pc-patient-detail">${item.detail}</small>
                    </div>`;
            }

            return `
                <div class="pc-patient-metric">
                    <h3>${item.name}</h3>
                    <div class="pc-patient-ring"
                         style="--metric-color:${item.color};--metric-percent:${percent}"
                         aria-label="${item.name} ${item.percent}%">
                        <span>${item.percent}%</span>
                    </div>
                    <strong class="pc-patient-number">${item.number}</strong>
                    <small class="pc-patient-detail">${item.detail}</small>
                </div>`;
        }).join('');

        $('#pcMainPatients').html(html);
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMainPatients').html('<p class="pc-main-empty">환자 현황을 불러오지 못했습니다.</p>');
    });

    ['/schedule/dayDuty.do', '/pc/main/outDutyList.do'].forEach(function (url, index) {
        const target = index === 0 ? '#pcMainDuty' : '#pcMainOutDuty';
        cmAjax(url, 'GET', {searchDate: ymd}, false).done(function (list) {
            if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

            let html = '';
            if (index === 0) {
                html = list.map(function (item) {
                    return `
                        <li>
                            <small class="pc-person-description">${cmEscapeHtml(item.hcName)}</small>
                            <span class="pc-person-name" data-user-id="${cmEscapeHtml(item.duCode1)}"${item.duCode1 ? ' role="button" tabindex="0"' : ''}>
                                <span class="pc-main-link-text">${cmEscapeHtml(item.duName)}</span>
                            </span>
                        </li>`;
                }).join('');
            } else {
                ['오전', '오후'].forEach(function (period) {
                    const people = list.filter(item => item.ccFlag === period);
                    if (!people.length) return;

                    html += `
                        <li class="pc-out-duty-group">
                            <strong class="pc-out-duty-period">${period}</strong>
                            <div class="pc-out-duty-names">
                                ${people.map(item => `
                                    <span class="pc-person-name" data-user-id="${cmEscapeHtml(item.ccCode)}"${item.ccCode ? ' role="button" tabindex="0"' : ''}>
                                        <span class="pc-main-link-text">${cmEscapeHtml(item.ccName)}</span>
                                    </span>`).join('')}
                            </div>
                        </li>`;
                });
            }

            $(target).html(list.length ? html : '<li class="pc-main-empty">등록된 정보가 없습니다.</li>');
        }).fail(function () {
            if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
            $(target).html('<li class="pc-main-empty">정보를 불러오지 못했습니다.</li>');
        });
    });

    cmAjax('/main/birthDayList.do', 'GET', {searchDate: ymd}, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        [4, 2].forEach(function (sort) {
            const people = list.filter(function (item) {
                return Number(item.sort) === sort;
            });
            const target = sort === 4 ? '#pcMainVacations' : '#pcMainBirthdays';
            $(sort === 4 ? '#pcVacationCount' : '#pcBirthdayCount').text(people.length);

            const html = people.map(function (item) {
                let type = item.ccRemark;
                if (sort === 2 && type) {
                    if (type.includes('+')) type = '양력';
                    else if (type.includes('-')) type = '음력';
                }

                return `
                    <li>
                        <span class="pc-person-name" data-user-id="${cmEscapeHtml(item.ccCode)}"${item.ccCode ? ' role="button" tabindex="0"' : ''}>
                            <span class="pc-main-link-text">${sort === 4 ? formatPcMainSymbols(item.ccName) : cmEscapeHtml(item.ccName)}</span>
                        </span>
                        <small class="pc-person-description">${sort === 4 ? formatPcMainSymbols(type) : cmEscapeHtml(type)}</small>
                    </li>`;
            }).join('');

            $(target).html(people.length
                ? html
                : `<li class="pc-main-empty">${sort === 4 ? '휴가자' : '생일자'}가 없습니다.</li>`);
        });
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMainVacations, #pcMainBirthdays').html('<li class="pc-main-empty">정보를 불러오지 못했습니다.</li>');
    });

    if (automatic) return;

    cmAjax('/main/mealList.do', 'GET', {searchDate: ymd}, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        const selected = Number($('#pcMealTabs button[aria-pressed="true"]').attr('data-meal'));
        const html = [1, 2, 3].map(function (flag) {
            const meals = list.filter(function (item) {
                return Number(item.fmFlag) === flag;
            });
            const names = meals.map(function (item) {
                return `<li>${cmEscapeHtml(item.reName)}</li>`;
            }).join('');
            const kcal = meals.reduce(function (sum, item) {
                return sum + cmToNumber(item.fmKal);
            }, 0);
            const menu = meals.length
                ? `<ul class="pc-meal-names">${names}</ul>
                   <span class="pc-meal-kcal">${kcal} kcal</span>`
                : '<p class="pc-main-empty">등록된 식단이 없습니다.</p>';

            return `
                <div class="pc-meal-section" data-meal="${flag}"
                     aria-label="${['아침', '점심', '저녁'][flag - 1]} 식단"${flag !== selected ? ' hidden' : ''}>
                    ${menu}
                </div>`;
        }).join('');

        $('#pcMealMenus').html(html);
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcMealMenus').html('<p class="pc-main-empty">식단을 불러오지 못했습니다.</p>');
    });
}

//게시판 조회
function loadPcMainBoards(refresh) {
    [1, 2, 3].forEach(function (flag) {
        const target = $(['#pcMainNotices', '#pcMainBoards', '#pcMainLibrary'][flag - 1]);
        if (target.data('loading')) return;
        target.data('loading', true);

        const url = flag === 3 ? '/pc/main/libraryList.do' : '/notice/list.do';
        const params = flag === 3 ? {} : {
            hcCode: 'IntGmenu',
            tnFlag: flag,
            offset: 0,
            limit: 10,
            searchId: $('#pcDashboard').attr('data-user-id')
        };

        cmAjax(url, 'GET', params, false).done(function (list) {
            const html = list.map(function (item) {
                return `
                    <article class="pc-main-post${item.ccView === 'N' ? ' is-unread' : ''}">
                        <h3>
                            <button type="button" class="pc-main-post-title" data-tv-uk="${cmEscapeHtml(item.tvUk)}"
                                    title="${cmEscapeHtml(item.tnTitle)}">
                                <span class="pc-main-link-text">${cmEscapeHtml(item.tnTitle)}</span>
                            </button>
                        </h3>
                        <p>
                            <span>${cmEscapeHtml(item.tnUk)} · 조회 ${cmEscapeHtml(item.viewCount)}</span>
                            <time>${cmEscapeHtml(item.tnDateStr)}</time>
                        </p>
                    </article>`;
            }).join('');

            const content = list.length ? html : '<p class="pc-main-empty">등록된 게시글이 없습니다.</p>';
            if (target.data('html') !== content) {
                target.html(content).data('html', content);
            }
        }).fail(function () {
            if (!refresh) {
                target.html('<p class="pc-main-empty">게시글을 불러오지 못했습니다.</p>').removeData('html');
            }
        }).always(function () {
            target.removeData('loading');
        });
    });
}

//알림판 조회
function loadPcMainBulletin(refresh) {
    const target = $('#pcMainBulletin');
    if (target.data('loading')) return;
    target.data('loading', true);

    cmAjax('/pc/main/bulletinList.do', 'GET', {}, false).done(function (list) {
        const html = list.map(function (item) {
            const cls = Number(item.ccColor) === 1 ? ' is-important' : '';

            return `
                <p class="pc-main-bulletin-item${cls}"><span class="pc-main-link-text">${cmEscapeHtml(item.ccTitle)}</span></p>`;
        }).join('');

        const content = list.length ? html : '<p class="pc-main-empty">등록된 알림이 없습니다.</p>';
        if (target.data('html') !== content) {
            target.html(content).data('html', content);
        }
    }).fail(function () {
        if (!refresh) {
            target.html('<p class="pc-main-empty">알림을 불러오지 못했습니다.</p>').removeData('html');
        }
    }).always(function () {
        target.removeData('loading');
    });
}

//선택일 출퇴근 조회
function loadPcMainCommute(ymd, refresh) {
    $('.pc-commute').attr('aria-label', formatPcCalendarDate(ymd) + ' 출퇴근 시간');
    if (!refresh) $('#pcCommuteIn, #pcCommuteOut').text('—');
    cmAjax('/profile/commuteStat.do', 'GET', {
        searchId: $('#pcDashboard').attr('data-user-id'),
        searchDate: ymd
    }, false).done(function (list) {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;

        const row = list[0];
        $('#pcCommuteIn').text(row && row.ilIntime
            ? row.ilIntime.substring(0, 2) + ':' + row.ilIntime.substring(2, 4)
            : '—');
        $('#pcCommuteOut').text(row && row.ilOuttime
            ? row.ilOuttime.substring(0, 2) + ':' + row.ilOuttime.substring(2, 4)
            : '—');
    }).fail(function () {
        if ($('#pcDashboard').attr('data-selected-date') !== ymd) return;
        $('#pcCommuteIn, #pcCommuteOut').text('조회 실패');
    });
}

//일정 시간 추출
function detailPcMainSchedule(item) {
    let time = item.ccTime ? item.ccTime.trim() : '';
    if (time === ':') time = '';

    let remark = item.ccRmk;
    if (!time && remark) {
        const match = /(^|[^\d])((?:(오전|오후)\s*)?([01]?\d|2[0-3])\s*(?::\s*([0-5]\d)(?!\d)|시(?:\s*([0-5]?\d)\s*분)?))/u.exec(remark);
        if (match) {
            let hour = Number(match[4]);
            if (match[3] && hour >= 1 && hour <= 12) {
                hour = hour % 12 + (match[3] === '오후' ? 12 : 0);
            }
            time = String(hour).padStart(2, '0') + ':' + String(Number(match[5] || match[6] || 0)).padStart(2, '0');
            const start = match.index + match[1].length;
            remark = (remark.slice(0, start) + remark.slice(start + match[2].length)).trim();
        }
    }
    return {time: time, remark: remark};
}

//현재 날짜와 시간
function updatePcMainClock() {
    const now = new Date();
    $('#pcDashboardClock').attr('datetime', now.toISOString());
    $('#pcDashboardToday').text(formatPcCalendarDate(cmFormatYmd(now, '-')));
    $('#pcDashboardTime').text(
        String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
    );
    $('#pcDashboardSeconds').text(' ' + String(now.getSeconds()).padStart(2, '0'));
}

//카드 목록 스크롤 안내 갱신
function updatePcMainScroll(scroll) {
    $(scroll).siblings('.pc-main-scroll-hint')
        .css({
            left: scroll.offsetLeft,
            bottom: scroll.parentElement.clientHeight - scroll.offsetTop - scroll.clientHeight,
            width: scroll.clientWidth
        })
        .prop('hidden', scroll.clientHeight === 0
            || scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop <= 1);
}

//원문자 표시
function formatPcMainSymbols(text) {
    return cmEscapeHtml(text).replace(/[\u2460-\u24ff\u3251-\u325f\u32b1-\u32bf]+/g,
        '<span class="pc-main-symbol">$&</span>');
}
