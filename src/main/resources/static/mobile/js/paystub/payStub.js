let currentSearchDate = '';
let limitSearchDate = '';

$(function () {
    currentSearchDate = getDefaultSearchDate();
    loadPayStub(true);

    $('#btnMonthPrev').on('click', function () {
        currentSearchDate = moveMonth(currentSearchDate, -1);
        loadPayStub();
    });

    $('#btnMonthNext').on('click', function () {
        if ($(this).prop('disabled')) {
            return;
        }

        if (moveMonth(currentSearchDate, 1) > limitSearchDate) {
            return;
        }

        currentSearchDate = moveMonth(currentSearchDate, 1);
        loadPayStub();
    });
});

//조회
function loadPayStub(isFirstLoad) {
    $('.month-range-text').text(currentSearchDate.replace('-', '.'));

    const data = {
        searchDate: currentSearchDate,
        searchId: $('#loginIcCode').val()
    };

    cmAjax('/payStub/selectPayStubDetail.do', 'GET', data, true).done(function (item) {
        item = Array.isArray(item) ? item[0] : item;

        if (isFirstLoad && (!item || isFuturePayDate(item.pdDate))) {
            currentSearchDate = moveMonth(currentSearchDate, -1);
            limitSearchDate = currentSearchDate;
            loadPayStub();
            return;
        }

        if (isFirstLoad) {
            limitSearchDate = currentSearchDate;
        }

        setMonthNextButton();

        if (!item) {
            clearPayStubAmount();
            return;
        }

        $('#payDateText').text(formatPayDate(item.pdDate));
        $('#payPeriodText').text(getPayPeriodText(item.pdDate));
        $('#payFormulaText').text(item.ccFormula);
        $('#payAccountText').text(item.icBankname);

        $('#paystubNote').text(item.prRmk);

        $('#pdOpay').text(cmFormatAmount(item.pdOpay));
        $('#pdObouns').text(cmFormatAmount(item.pdObouns));
        $('#pdOgita01').text(cmFormatAmount(item.pdOgita01));
        $('#pdOgita02').text(cmFormatAmount(item.pdOgita02));
        $('#pdOgita03').text(cmFormatAmount(item.pdOgita03));
        $('#pdOgita04').text(cmFormatAmount(item.pdOgita04));
        $('#pdOgita05').text(cmFormatAmount(item.pdOgita05));
        $('#pdOgita06').text(cmFormatAmount(item.pdOgita06));
        $('#pdOgita07').text(cmFormatAmount(item.pdOgita07));
        $('#pdOgita08').text(cmFormatAmount(item.pdOgita08));
        $('#pdOgita09').text(cmFormatAmount(item.pdOgita09));
        $('#pdOgita10').text(cmFormatAmount(item.pdOgita10));
        $('#pdOgita11').text(cmFormatAmount(item.pdOgita11));
        $('#pdOgita12').text(cmFormatAmount(item.pdOgita12));
        $('#pdOgita13').text(cmFormatAmount(item.pdOgita13));
        $('#pdOgita14').text(cmFormatAmount(item.pdOgita14));
        $('#pdOgita15').text(cmFormatAmount(item.pdOgita15));

        $('#pdOfoodamt').text(cmFormatAmount(item.pdOfoodamt));
        $('#pdOcaramt').text(cmFormatAmount(item.pdOcaramt));

        $('#pdIbohum').text(cmFormatAmount(item.pdIbohum));
        $('#pdIgong03').text(cmFormatAmount(item.pdIgong03));
        $('#pdIgukmin').text(cmFormatAmount(item.pdIgukmin));
        $('#pdIgoyong').text(cmFormatAmount(item.pdIgoyong));
        $('#pdIsangjo').text(cmFormatAmount(item.pdIsangjo));
        $('#pdIfoodamt').text(cmFormatAmount(item.pdIfoodamt));
        $('#pdIgong02').text(cmFormatAmount(item.pdIgong02));
        $('#pdIgong01').text(cmFormatAmount(item.pdIgong01));
        $('#pdItax').text(cmFormatAmount(item.pdItax));
        $('#pdIjumintax').text(cmFormatAmount(item.pdIjumintax));

        const taxableTotal =
            cmToNumber(item.pdOpay) +
            cmToNumber(item.pdObouns) +
            cmToNumber(item.pdOgita01) +
            cmToNumber(item.pdOgita02) +
            cmToNumber(item.pdOgita03) +
            cmToNumber(item.pdOgita04) +
            cmToNumber(item.pdOgita05) +
            cmToNumber(item.pdOgita06) +
            cmToNumber(item.pdOgita07) +
            cmToNumber(item.pdOgita08) +
            cmToNumber(item.pdOgita09) +
            cmToNumber(item.pdOgita10) +
            cmToNumber(item.pdOgita11) +
            cmToNumber(item.pdOgita12) +
            cmToNumber(item.pdOgita13);

        const nonTaxableTotal =
            cmToNumber(item.pdOfoodamt) +
            cmToNumber(item.pdOcaramt) +
            cmToNumber(item.pdOgita14) +
            cmToNumber(item.pdOgita15);

        const deductionTotal =
            cmToNumber(item.pdIbohum) +
            cmToNumber(item.pdIgong03) +
            cmToNumber(item.pdIgukmin) +
            cmToNumber(item.pdIgoyong) +
            cmToNumber(item.pdIsangjo) +
            cmToNumber(item.pdIfoodamt) +
            cmToNumber(item.pdIgong02) +
            cmToNumber(item.pdIgong01) +
            cmToNumber(item.pdItax) +
            cmToNumber(item.pdIjumintax);

        const grossTotal = taxableTotal + nonTaxableTotal;
        const realPayAmount = grossTotal - deductionTotal;

        $('#taxableTotal').text(cmFormatAmount(taxableTotal));
        $('#nonTaxableTotal').text(cmFormatAmount(nonTaxableTotal));
        $('#deductionTotal').text(cmFormatAmount(deductionTotal));
        $('#grossTotal').text(cmFormatAmount(grossTotal));
        $('#realPayAmount').text(cmFormatAmount(realPayAmount));
    }).fail(function () {
        clearPayStubAmount();
        setMonthNextButton();
    });
}

function clearPayStubAmount() {
    $('#pdOpay').text(cmFormatAmount(0));
    $('#pdObouns').text(cmFormatAmount(0));
    $('#pdOgita01').text(cmFormatAmount(0));
    $('#pdOgita02').text(cmFormatAmount(0));
    $('#pdOgita03').text(cmFormatAmount(0));
    $('#pdOgita04').text(cmFormatAmount(0));
    $('#pdOgita05').text(cmFormatAmount(0));
    $('#pdOgita06').text(cmFormatAmount(0));
    $('#pdOgita07').text(cmFormatAmount(0));
    $('#pdOgita08').text(cmFormatAmount(0));
    $('#pdOgita09').text(cmFormatAmount(0));
    $('#pdOgita10').text(cmFormatAmount(0));
    $('#pdOgita11').text(cmFormatAmount(0));
    $('#pdOgita12').text(cmFormatAmount(0));
    $('#pdOgita13').text(cmFormatAmount(0));
    $('#pdOgita14').text(cmFormatAmount(0));
    $('#pdOgita15').text(cmFormatAmount(0));

    $('#pdOfoodamt').text(cmFormatAmount(0));
    $('#pdOcaramt').text(cmFormatAmount(0));

    $('#pdIbohum').text(cmFormatAmount(0));
    $('#pdIgong03').text(cmFormatAmount(0));
    $('#pdIgukmin').text(cmFormatAmount(0));
    $('#pdIgoyong').text(cmFormatAmount(0));
    $('#pdIsangjo').text(cmFormatAmount(0));
    $('#pdIfoodamt').text(cmFormatAmount(0));
    $('#pdIgong02').text(cmFormatAmount(0));
    $('#pdIgong01').text(cmFormatAmount(0));
    $('#pdItax').text(cmFormatAmount(0));
    $('#pdIjumintax').text(cmFormatAmount(0));

    $('#taxableTotal').text(cmFormatAmount(0));
    $('#nonTaxableTotal').text(cmFormatAmount(0));
    $('#deductionTotal').text(cmFormatAmount(0));
    $('#grossTotal').text(cmFormatAmount(0));
    $('#realPayAmount').text(cmFormatAmount(0));

    $('#payDateText').text('');
    $('#payPeriodText').text('');
    $('#payFormulaText').text('');
    $('#payAccountText').text('');

    $('#paystubNote').html('');
}

function getDefaultSearchDate() {
    const now = new Date();

    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}

function setMonthNextButton() {
    $('#btnMonthNext').prop('disabled', currentSearchDate >= limitSearchDate);
}

function isFuturePayDate(pdDate) {
    if (!pdDate) {
        return true;
    }

    return String(pdDate).substring(0, 10) > getTodayText();
}

function getTodayText() {
    const now = new Date();

    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
}

function moveMonth(searchDate, diffMonth) {
    const splitDate = searchDate.split('-');
    const date = new Date(Number(splitDate[0]), Number(splitDate[1]) - 1, 1);

    date.setMonth(date.getMonth() + diffMonth);

    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

function formatPayDate(dateText) {
    if (!dateText) {
        return '';
    }

    return String(dateText).substring(0, 10);
}

function getPayPeriodText(dateText) {
    if (!dateText) {
        return '';
    }

    const splitDate = String(dateText).substring(0, 10).split('-');
    const date = new Date(Number(splitDate[0]), Number(splitDate[1]) - 1, Number(splitDate[2]));
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return formatDateText(firstDate) + ' ~ ' + formatDateText(lastDate);
}

function formatDateText(date) {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
}