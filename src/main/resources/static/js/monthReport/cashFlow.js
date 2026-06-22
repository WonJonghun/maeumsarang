$(function () {
    initCashFlowViewport();
    initCashFlowDate();
    initCashFlowResetDate();
    initCashFlowDragScroll();
    loadCashFlowList();

    $(document).on('topbar:search', function () {
        loadCashFlowList();
    });

    $('#searchKeyword').on('input', function () {
        loadCashFlowList(true);
    });
});

let cashFlowListAll = [];
let cashFlowListView = [];

//화면높이
function initCashFlowViewport() {
    setCashFlowViewport();

    $(window).on('resize orientationchange', function () {
        setCashFlowViewport();
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setCashFlowViewport);
        window.visualViewport.addEventListener('scroll', setCashFlowViewport);
    }
}

//화면높이 설정
function setCashFlowViewport() {
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--cash-flow-vh', height + 'px');
}

//초기일자
function initCashFlowDate() {
    const today = cmGetToday('-');
    $('#searchFromDate').val(today.substring(0, 4) + '-01-01');
    $('#searchToDate').val(today);
}

//초기화 날짜
function initCashFlowResetDate() {
    $(document).on('click.cashFlowReset', '#topbarFilterReset', function () {
        setTimeout(function () {
            initCashFlowDate();
            loadCashFlowList();
        }, 0);
    });
}

//테이블 드래그 스크롤
function initCashFlowDragScroll() {
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    $(document).on('mousedown', '.cash-flow-table-wrap', function (e) {
        if (e.button !== 0) return;

        isDown = true;
        startX = e.pageX;
        startY = e.pageY;
        scrollLeft = this.scrollLeft;
        scrollTop = this.scrollTop;
        $(this).addClass('is-dragging');
    });

    $(document).on('mousemove', function (e) {
        if (!isDown) return;

        const tableWrap = $('.cash-flow-table-wrap.is-dragging').get(0);
        if (!tableWrap) return;

        e.preventDefault();
        tableWrap.scrollLeft = scrollLeft - (e.pageX - startX);
        tableWrap.scrollTop = scrollTop - (e.pageY - startY);
    });

    $(document).on('mouseup mouseleave', function () {
        if (!isDown) return;

        isDown = false;
        $('.cash-flow-table-wrap.is-dragging').removeClass('is-dragging');
    });
}

//목록조회 + 검색
function loadCashFlowList(isSearchOnly) {
    const keyword = ($('#searchKeyword').val() || '').toLowerCase();

    if (isSearchOnly) {
        cashFlowListView = cashFlowListAll.filter(function (row) {
            return [
                row.ccCode || '',
                row.ccName || ''
            ].join(' ').toLowerCase().indexOf(keyword) > -1;
        });

        renderCashFlowList();
        return;
    }

    const data = {
        searchFromDate: $('#searchFromDate').val(),
        searchToDate: $('#searchToDate').val()
    };

    cmAjax('/monthReport/selectCashFlowList.do', 'GET', data, true).done(function (list) {
        cashFlowListAll = list || [];
        loadCashFlowList(true);
    });
}

//목록렌더
function renderCashFlowList() {
    if (!cashFlowListView.length) {
        $('#cash-flow-summary').html('');
        $('#cash-flow-table').html(`
            <div class="cash-flow-empty">
                ${$('#searchKeyword').val() ? '검색 결과가 없습니다.' : '목록이 없습니다.'}
            </div>
        `);
        return;
    }

    let html = `
        <div class="cash-flow-table-wrap">
            <table class="cash-flow-table">
                <colgroup>
                    <col class="cash-flow-name-col">
                    <col span="12" class="cash-flow-month-col">
                    <col class="cash-flow-total-col">
                    <col class="cash-flow-total-col">
                    <col class="cash-flow-total-col">
                </colgroup>
                <thead>
                    <tr>
                        <th>계정과목</th>
                        <th>1월</th>
                        <th>2월</th>
                        <th>3월</th>
                        <th>4월</th>
                        <th>5월</th>
                        <th>6월</th>
                        <th>7월</th>
                        <th>8월</th>
                        <th>9월</th>
                        <th>10월</th>
                        <th>11월</th>
                        <th>12월</th>
                        <th>계</th>
                        <th>전년</th>
                        <th>차이</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < cashFlowListView.length; i++) {
        html += getCashFlowRowHtml(cashFlowListView[i]);
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    $('#cash-flow-summary').html(getCashFlowSummaryHtml());
    $('#cash-flow-table').html(html);
}

//요약
function getCashFlowSummaryHtml() {
    const income = cashFlowListAll.find(function (row) {
        return Number(row.flag || 0) === 0;
    }) || {};

    const expense = cashFlowListAll.find(function (row) {
        return Number(row.flag || 0) === 2;
    }) || {};

    const balance = cashFlowListAll.find(function (row) {
        return Number(row.flag || 0) === 4;
    }) || {};

    const balanceAmt = Number(balance.amt00 || 0);
    const balanceClass = balanceAmt >= 0 ? 'is-plus' : 'is-minus';

    return `
        <div class="cash-flow-summary-card">
            <div class="cash-flow-summary-item income">
                <span>수입계</span>
                <strong>${cmFormatAmount(income.amt00 || 0)}</strong>
            </div>
            <div class="cash-flow-summary-item expense">
                <span>지출계</span>
                <strong>${cmFormatAmount(expense.amt00 || 0)}</strong>
            </div>
            <div class="cash-flow-summary-item balance ${balanceClass}">
                <span>과부족</span>
                <strong>${cmFormatAmount(balance.amt00 || 0)}</strong>
            </div>
        </div>
    `;
}

//row
function getCashFlowRowHtml(row) {
    const className = getCashFlowRowClass(row);
    const diffClass = Number(row.amt21 || 0) >= 0 ? 'is-plus' : 'is-minus';

    return `
        <tr class="${className} ${diffClass}">
            <th>${cmEscapeHtml(row.ccName || '')}</th>
            <td>${cmFormatAmount(row.amt1 || 0)}</td>
            <td>${cmFormatAmount(row.amt2 || 0)}</td>
            <td>${cmFormatAmount(row.amt3 || 0)}</td>
            <td>${cmFormatAmount(row.amt4 || 0)}</td>
            <td>${cmFormatAmount(row.amt5 || 0)}</td>
            <td>${cmFormatAmount(row.amt6 || 0)}</td>
            <td>${cmFormatAmount(row.amt7 || 0)}</td>
            <td>${cmFormatAmount(row.amt8 || 0)}</td>
            <td>${cmFormatAmount(row.amt9 || 0)}</td>
            <td>${cmFormatAmount(row.amt10 || 0)}</td>
            <td>${cmFormatAmount(row.amt11 || 0)}</td>
            <td>${cmFormatAmount(row.amt12 || 0)}</td>
            <td class="cash-flow-sum">${cmFormatAmount(row.amt00 || 0)}</td>
            <td class="cash-flow-prev">${cmFormatAmount(row.amt20 || 0)}</td>
            <td class="cash-flow-diff">${cmFormatAmount(row.amt21 || 0)}</td>
        </tr>
    `;
}

//row class
function getCashFlowRowClass(row) {
    const flag = Number(row.flag || 0);

    if (flag === 0) return 'cash-flow-income-total';
    if (flag === 2) return 'cash-flow-expense-total';
    if (flag === 4) return 'cash-flow-balance-total';

    return 'cash-flow-detail';
}