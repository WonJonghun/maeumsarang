let currentWeekStart = '';
let currentWeeklyMealPlan = null;

$(function () {
    setWeek();
    loadWeeklyMealPlan();

    $('#btnWeekPrev').on('click', function () {
        moveWeek(-1);
    });

    $('#btnWeekNext').on('click', function () {
        moveWeek(1);
    });

    $('#btnMealRegenerate').on('click', function () {
        loadWeeklyMealPlan();
    });

    $('#btnTopbarExcel').on('click', function () {
        downloadWeeklyMealPlanExcel();
    });
});

//주간식단조회
function loadWeeklyMealPlan() {
    cmAjax('/foodMenu/createWeeklyMealPlan.do', 'GET', {
        startDate: currentWeekStart
    }, true).done(function (data) {
        currentWeeklyMealPlan = data;
        renderWeeklyMealPlan(
            data,
            '#mealAutoToolList'
        );

        $('#mealWeekRange').text(
            formatWeekDate(data.startDate)
            + ' ~ '
            + formatWeekDate(data.endDate)
        );
    }).fail(function () {
        $('#mealAutoToolList').html(`
            <div class="meal-empty">
                Java 식단 생성에 실패했습니다.
            </div>
        `);
    });

    cmAjax('/foodMenu/createWeeklyMealPlanProcedure.do', 'GET', {
        startDate: currentWeekStart
    }, true).done(function (data) {
        renderWeeklyMealPlan(
            data,
            '#mealAutoToolProcedureList'
        );
    }).fail(function () {
        $('#mealAutoToolProcedureList').html(`
            <div class="meal-empty">
                프로시저 식단 생성에 실패했습니다.
            </div>
        `);
    });
}

//주간식단렌더
function renderWeeklyMealPlan(data, target) {
    const dayList = data.dayList;
    let html = `
        <div class="meal-table-wrap">
            <table class="meal-week-table">
                <thead>
                    <tr>
                        <th class="meal-type-col">구분</th>
    `;

    dayList.forEach(function (day) {
        const weekendClass = day.dayName === '토'
            ? 'sat'
            : day.dayName === '일'
                ? 'sun'
                : '';

        html += `
            <th class="${weekendClass}">
                <div class="meal-day-name">${cmEscapeHtml(day.dayName)}</div>
                <div class="meal-day-date">${getMonthDay(day.date)}</div>
            </th>
        `;
    });

    html += `
                    </tr>
                </thead>
                <tbody>
    `;

    [1, 2, 3].forEach(function (mealFlag) {
        html += `
            <tr>
                <th class="meal-type-col">
                    ${mealFlag === 1 ? '아침' : mealFlag === 2 ? '점심' : '저녁'}
                </th>
        `;

        dayList.forEach(function (day) {
            const meal = day.mealList.find(function (item) {
                return item.mealFlag === mealFlag;
            });

            html += `<td>`;

            if (meal) {
                meal.menuList.forEach(function (menu) {
                    html += `
                        <div class="meal-menu-item">
                            ${cmEscapeHtml(menu.reName)}
                        </div>
                    `;
                });
            }

            html += `</td>`;
        });

        html += `</tr>`;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    $(target).html(html);
}

//주설정
function setWeek() {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();

    monday.setDate(
        today.getDate()
        - (day === 0 ? 6 : day - 1)
    );

    currentWeekStart =
        cmFormatYmd(monday, '-');
}

//주이동
function moveWeek(week) {
    currentWeekStart = cmSubDays(
        currentWeekStart,
        -(week * 7),
        '-'
    );

    loadWeeklyMealPlan();
}

//엑셀다운로드
function downloadWeeklyMealPlanExcel() {
    if (!currentWeeklyMealPlan) {
        return;
    }

    $.ajax({
        url: '/foodMenu/downloadWeeklyMealPlanExcel.do',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(currentWeeklyMealPlan),
        xhrFields: {
            responseType: 'blob'
        },
        beforeSend: function (xhr) {
            const token =
                $('meta[name="_csrf"]')
                    .attr('content');

            const header =
                $('meta[name="_csrf_header"]')
                    .attr('content');

            if (token && header) {
                xhr.setRequestHeader(
                    header,
                    token
                );
            }
        },
        success: function (data) {
            const url =
                window.URL.createObjectURL(data);

            const link =
                document.createElement('a');

            link.href = url;

            link.download =
                '주간식단표_'
                + currentWeeklyMealPlan.startDate
                + '_'
                + currentWeeklyMealPlan.endDate
                + '.xlsx';

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        }
    });
}

//날짜표시
function getMonthDay(date) {
    const value = date.split('-');

    return Number(value[1])
        + '/'
        + Number(value[2]);
}

//주간날짜표시
function formatWeekDate(date) {
    const value = date.split('-');

    return value[0]
        + '.'
        + value[1]
        + '.'
        + value[2];
}