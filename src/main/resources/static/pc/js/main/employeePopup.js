$(function () {
    //초기화
    const calendar = $('#pcEmployeeCalendar');
    loadPcCalendar(calendar, calendar.attr('data-selected-date'));

    //이메일 한 줄 표시
    const email = $('#pcEmployeeEmail');
    const fitEmail = function () {
        const context = document.createElement('canvas').getContext('2d');
        context.font = getComputedStyle(email[0]).font;
        const spacing = (email[0].clientWidth - context.measureText(email.text()).width)
            / Math.max(Array.from(email.text()).length - 1, 1);
        email.css('letter-spacing', Math.max(-2, Math.min(0, spacing)) + 'px');
    };
    new ResizeObserver(fitEmail).observe(email[0]);
    document.fonts.ready.then(fitEmail);

    //프로필 기본 이미지
    $('#pcEmployeePhoto').on('error', function () {
        $(this).off('error').attr('src', $(this).attr('data-fallback-src'));
    });
    const photo = $('#pcEmployeePhoto')[0];
    if (photo.complete && photo.naturalWidth === 0) {
        $(photo).trigger('error');
    }

    //이전·다음 달
    $('#pcEmployeePrev, #pcEmployeeNext').on('click', function () {
        const date = new Date(calendar.find('.pc-calendar-month').attr('data-month') + '-01T00:00:00');
        date.setMonth(date.getMonth() + (this.id === 'pcEmployeePrev' ? -1 : 1));
        loadPcCalendar(calendar, cmFormatYmd(date, '-'));
    });

    //오늘 선택
    $('#pcEmployeeToday').on('click', function () {
        const today = cmGetToday('-');
        calendar.attr('data-selected-date', today);
        loadPcCalendar(calendar, today);
    });

    //근무 날짜 선택
    calendar.on('click', '.pc-calendar-day', function () {
        const day = $(this);
        const ymd = day.attr('data-date');
        calendar.attr('data-selected-date', ymd);
        calendar.find('.pc-calendar-day').attr('aria-pressed', 'false');
        day.attr('aria-pressed', 'true');
        $('#pcEmployeeWork').text(day.attr('data-work') || '—');
        if (ymd.substring(0, 7) !== calendar.find('.pc-calendar-month').attr('data-month')) {
            loadPcCalendar(calendar, ymd);
        }
    });

    //조회 후 선택일 근무
    calendar.on('pcCalendar:loaded', function () {
        const day = calendar.find('.pc-calendar-day[aria-pressed="true"]:not(.is-other-month)');
        if (day.length) {
            $('#pcEmployeeWork').text(day.attr('data-work') || '—');
        }
    });
});
