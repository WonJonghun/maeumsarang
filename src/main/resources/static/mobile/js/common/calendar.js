// createCalendar(날짜)로 호출
// calendarContainer div 있어야함 날짜없으면 오늘로 호출
window.createCalendar = function (baseDate) {
    return IntraCalendar.createCalendar(baseDate, '#calendarContainer');
};

let IntraCalendar = (function () {
    function Calendar(calendarSelector, holidayListSelector, baseDate) {
        this.calendarSelector = calendarSelector || '#mainCalendar';
        this.holidayListSelector = holidayListSelector || '#holidayListData';
        this.grid = $(this.calendarSelector);

        this.today = new Date();

        let initDate = baseDate;
        if (!initDate) {
            initDate = new Date();
        }

        this.currentDate = new Date(initDate.getFullYear(), initDate.getMonth(), 1);
        this.holidayMap = {};
        this.scheduleMap = {};
        this.useDomHoliday = false;

        this.flagCd = $('#loginFlag').val();
        this.saCd = $('#loginIcCode').val();
    }

    Calendar.prototype.init = function () {
        if (!this.grid.length) return;

        this.bindEvents();
        this.useDomHoliday = ($(this.holidayListSelector).length > 0 && $(this.holidayListSelector).find('li').length > 0);

        this.refreshMonth();
    };

    Calendar.prototype.bindEvents = function () {
        let self = this;
        let wrap = self.grid.closest('.calendar-wrap');

        wrap.find('.cal-prev').off('click.intraCal').on('click.intraCal', function () {
            self.changeMonth(-1);
        });

        wrap.find('.cal-next').off('click.intraCal').on('click.intraCal', function () {
            self.changeMonth(1);
        });
    };

    Calendar.prototype.changeMonth = function (diff) {
        let y = this.currentDate.getFullYear();
        let m = this.currentDate.getMonth();
        this.currentDate = new Date(y, m + diff, 1);
        this.refreshMonth();
    };

    Calendar.prototype.refreshMonth = function () {
        let self = this;

        if (!self.grid.length) return;

        let year = self.currentDate.getFullYear();
        let month = self.currentDate.getMonth() + 1;

        // 1) 휴일 데이터 준비
        let holidayReq;
        if (self.useDomHoliday) {
            self.holidayMap = {};
            $(self.holidayListSelector).find('li').each(function () {
                let li = $(this);
                let date = li.data('date');
                if (!date) return;
                self.holidayMap[date] = li.data('name') || '';
            });
            holidayReq = $.Deferred().resolve([]).promise();
        } else {
            let yearStr = '' + year;
            let monthStr = (month < 10 ? '0' + month : '' + month);
            holidayReq = cmAjax('/schedule/holidayList.do', 'GET', { year: yearStr, month: monthStr }, false)
                .then(function (list) { return list; }, function () { return null; });
        }

        // 2) 스케줄 데이터 준비
        let scheduleReq;
        if (!self.flagCd || !self.saCd) {
            console.log('scheduleList param missing', self.flagCd, self.saCd);
            scheduleReq = $.Deferred().resolve(null).promise();
        } else {
            let monthStr2 = (month < 10 ? '0' + month : '' + month);
            let baseDt = year + '-' + monthStr2 + '-01';

            let param = {
                baseDt: baseDt,
                flagCd: self.flagCd,
                saCd: self.saCd
            };

            scheduleReq = cmAjax('/schedule/scheduleList.do', 'GET', param, false)
                .then(function (list) { return list; }, function () { return null; });
        }

        // 3) 둘 다 준비되면 한 번에 draw + schedule 적용
        $.when(holidayReq, scheduleReq).done(function (holidayList, scheduleList) {
            if (!self.useDomHoliday) {
                self.holidayMap = {};
                if (holidayList && holidayList.length) {
                    $.each(holidayList, function (idx, h) {
                        if (!h || !h.ccDt) return;
                        let dateKey = String(h.ccDt).substring(0, 10);
                        self.holidayMap[dateKey] = h.ccOffNm || '';
                    });
                }
            }

            self.scheduleMap = {};
            if (scheduleList && scheduleList.length) {
                let dto = scheduleList[0];
                let lastDay = new Date(year, month, 0).getDate();
                let monthStr3 = (month < 10 ? '0' + month : '' + month);

                for (let day = 1; day <= lastDay; day++) {
                    let fieldName = 'a' + day;
                    let value = dto[fieldName];
                    if (!value || String(value).trim() === '') continue;

                    let dayStr = (day < 10 ? '0' + day : '' + day);
                    let dateKey2 = year + '-' + monthStr3 + '-' + dayStr;
                    self.scheduleMap[dateKey2] = value;
                }
            }

            self.draw();
            self.applyScheduleToGrid();
        });
    };

    Calendar.prototype.formatDateKey = function (dateObj) {
        let y = dateObj.getFullYear();
        let m = dateObj.getMonth() + 1;
        let d = dateObj.getDate();

        m = (m < 10 ? '0' + m : '' + m);
        d = (d < 10 ? '0' + d : '' + d);
        return y + '-' + m + '-' + d;
    };

    Calendar.prototype.getHolidayName = function (dateObj) {
        return this.holidayMap[this.formatDateKey(dateObj)];
    };

    Calendar.prototype.draw = function () {
        let year = this.currentDate.getFullYear();
        let month = this.currentDate.getMonth();
        let today = this.today;

        let firstDayOfMonth = new Date(year, month, 1);
        let startDay = new Date(firstDayOfMonth);
        startDay.setDate(1 - firstDayOfMonth.getDay());

        let lastDayOfMonth = new Date(year, month + 1, 0);
        let endDay = new Date(lastDayOfMonth);
        endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

        let html = '';
        let cursor = new Date(startDay);

        while (cursor <= endDay) {
            let isCurrentMonth = (cursor.getMonth() === month);
            let dayOfWeek = cursor.getDay();
            let cls = 'cal-day';

            if (isCurrentMonth) {
                if (dayOfWeek === 0) cls += ' sun';
                else if (dayOfWeek === 6) cls += ' sat';
            } else {
                cls += ' other-month';
            }

            if (isCurrentMonth &&
                cursor.getFullYear() === today.getFullYear() &&
                cursor.getMonth() === today.getMonth() &&
                cursor.getDate() === today.getDate()) {
                cls += ' selected today text-deep-blue';
            }

            let holidayName = this.getHolidayName(cursor);
            if (holidayName) cls += ' holiday';

            html += '<button type="button" class="' + cls + ' fw500" data-date="' + this.formatDateKey(cursor) + '">' + cursor.getDate() +
                '<span class="cal-duty-text"></span></button>';

            cursor.setDate(cursor.getDate() + 1);
        }

        this.grid.html(html);
        this.grid.closest('.calendar-wrap').find('.cal-current-month').text(year + '. ' + (month + 1));
    };

    Calendar.prototype.applyScheduleToGrid = function () {
        let self = this;

        self.grid.find('.cal-day').each(function () {
            let btn = $(this);
            let date = btn.data('date');
            if (!date) return;

            let parts = String(date).split('-');
            if (parts.length !== 3) return;

            let dayNum = parseInt(parts[2], 10);
            if (isNaN(dayNum)) return;

            let scheduleText = self.scheduleMap[date] || '';
            let colorClass = 'text-gray';

            if (scheduleText && String(scheduleText).trim() !== '') {
                let first = scheduleText.charAt(0).toUpperCase();
                if (first === 'D') {
                    colorClass = 'text-black';
                } else if (first === 'E') {
                    colorClass = 'text-deep-blue';
                } else if (first === 'N') {
                    colorClass = 'text-light-red';
                } else {
                    colorClass = 'text-gray';
                }
            }

            let hasCircled = /[①-⑳]/.test(scheduleText);

            btn.find('.cal-duty-text').remove();
            btn.text(dayNum);

            let spanClass = 'cal-duty-text ' + colorClass;
            if (hasCircled) spanClass += ' circled';

            btn.append('<span class="' + spanClass + '">' + scheduleText + '</span>');
        });
    };

    function parseBaseDate(input) {
        if (!input) return new Date();
        if (Object.prototype.toString.call(input) === '[object Date]' && !isNaN(input.getTime())) return input;

        if (typeof input === 'string') {
            let m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) {
                let y = parseInt(m[1], 10);
                let mm = parseInt(m[2], 10);
                let d = parseInt(m[3], 10);
                return new Date(y, mm - 1, d);
            }
        }

        return new Date();
    }

    return {
        // 기존 방식(호환 유지): 이미 만들어진 grid(id 등)를 넘겨서 초기화
        init: function (calendarSelector, holidayListSelector, baseDate) {
            let cal = new Calendar(calendarSelector, holidayListSelector, parseBaseDate(baseDate));
            cal.init();
            return cal;
        },

        // 신규 방식: container 안에 달력 UI 자체를 생성하고 초기화
        createCalendar: function (baseDate, containerSelector, holidayListSelector) {
            let containerSel = containerSelector || '#calendarContainer';
            let container = $(containerSel);

            if (!container.length) {
                console.log('calendar container not found:', containerSel);
                return null;
            }

            let gridId = 'intraCalendarGrid_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);

            let html = '';
            html += '<div class="calendar-wrap">';
            html += '  <div class="calendar-header-row">';
            html += '    <button type="button" class="cal-nav cal-prev" aria-label="이전 달">&lsaquo;</button>';
            html += '    <span class="cal-current-month"></span>';
            html += '    <button type="button" class="cal-nav cal-next" aria-label="다음 달">&rsaquo;</button>';
            html += '  </div>';
            html += '  <div class="calendar-week-header">';
            html += '    <span class="cal-weekday sun">일</span>';
            html += '    <span class="cal-weekday">월</span>';
            html += '    <span class="cal-weekday">화</span>';
            html += '    <span class="cal-weekday">수</span>';
            html += '    <span class="cal-weekday">목</span>';
            html += '    <span class="cal-weekday">금</span>';
            html += '    <span class="cal-weekday sat">토</span>';
            html += '  </div>';
            html += '  <div id="' + gridId + '" class="calendar-grid"></div>';
            html += '</div>';

            container.empty().append(html);

            let cal = new Calendar('#' + gridId, holidayListSelector || '#holidayListData', parseBaseDate(baseDate));
            cal.init();
            return cal;
        }
    };
})();
