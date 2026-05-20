<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title><c:out value='${menuAuth.menuName}'/></title>
    <%@ include file="../common/common-inc.jspf" %>

    <link rel="stylesheet" href="<c:url value='/css/page/payStub.css'/>">
</head>

<body class="paystub-list-page">
<div class="page-root">
    <c:set var="headerMainYn" value="N"/>
    <c:set var="headerSearchYn" value="N"/>
    <%@ include file="../common/header.jspf" %>

    <main class="paystub-wrap">
    <div class="paystub-monthbar" aria-label="월 변경">
        <div class="month-row">
            <div class="month-nav" role="group" aria-label="월 이동">
                <button type="button" id="btnMonthPrev" class="month-btn" aria-label="이전 월">
                    <i class="bi bi-caret-left-fill"></i>
                </button>

                <button type="button" id="btnMonthRange" class="month-range" aria-label="월 선택">
                    <span class="month-range-text">YYYY.MM</span>
                </button>

                <button type="button" id="btnMonthNext" class="month-btn" aria-label="다음 월">
                    <i class="bi bi-caret-right-fill"></i>
                </button>
            </div>
        </div>
    </div>

    <div class="paystub-table-wrap">
        <table class="paystub-detail-table">
            <colgroup>
                <col class="section-col">
                <col class="item-col">
                <col class="amount-col">
                <col class="section-col">
                <col class="item-col">
                <col class="amount-col">
            </colgroup>
            <thead>
            <tr>
                <th colspan="3">지급 항목</th>
                <th colspan="3">공제 항목</th>
            </tr>
            </thead>
            <tbody>
                <tr>
                    <th rowspan="15" class="section-cell">과세</th>
                    <td class="item-cell">급여</td>
                    <td class="amount-cell" id="pdOpay">0</td>

                    <th rowspan="20" class="section-cell section-cell-deduction">공제</th>
                    <td class="item-cell">건강보험료</td>
                    <td class="amount-cell" id="pdIbohum">0</td>
                </tr>
                <tr>
                    <td class="item-cell">상여금</td>
                    <td class="amount-cell" id="pdObouns">0</td>
                    <td class="item-cell">요양보험료</td>
                    <td class="amount-cell" id="pdIgong03">0</td>
                </tr>
                <tr>
                    <td class="item-cell">연장수당</td>
                    <td class="amount-cell" id="pdOgita01">0</td>
                    <td class="item-cell">국민연금</td>
                    <td class="amount-cell" id="pdIgukmin">0</td>
                </tr>
                <tr>
                    <td class="item-cell">직책수당</td>
                    <td class="amount-cell" id="pdOgita02">0</td>
                    <td class="item-cell">고용보험료</td>
                    <td class="amount-cell" id="pdIgoyong">0</td>
                </tr>
                <tr>
                    <td class="item-cell">휴일수당</td>
                    <td class="amount-cell" id="pdOgita03">0</td>
                    <td class="item-cell">상조회비</td>
                    <td class="amount-cell" id="pdIsangjo">0</td>
                </tr>
                <tr>
                    <td class="item-cell">Night수당</td>
                    <td class="amount-cell" id="pdOgita04">0</td>
                    <td class="item-cell">식대공제</td>
                    <td class="amount-cell" id="pdIfoodamt">0</td>
                </tr>
                <tr>
                    <td class="item-cell">고정휴일수당</td>
                    <td class="amount-cell" id="pdOgita05">0</td>
                    <td class="item-cell">후원회비</td>
                    <td class="amount-cell" id="pdIgong02">0</td>
                </tr>
                <tr>
                    <td class="item-cell">고정연장수당</td>
                    <td class="amount-cell" id="pdOgita06">0</td>
                    <td class="item-cell">가불공제</td>
                    <td class="amount-cell" id="pdIgong01">0</td>
                </tr>
                <tr>
                    <td class="item-cell">고정야간수당</td>
                    <td class="amount-cell" id="pdOgita12">0</td>
                    <td class="item-cell">갑근세</td>
                    <td class="amount-cell" id="pdItax">0</td>
                </tr>
                <tr>
                    <td class="item-cell">근속수당</td>
                    <td class="amount-cell" id="pdOgita07">0</td>
                    <td class="item-cell">주민세</td>
                    <td class="amount-cell" id="pdIjumintax">0</td>
                </tr>
                <tr>
                    <td class="item-cell">연차수당</td>
                    <td class="amount-cell" id="pdOgita08">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">전문수당</td>
                    <td class="amount-cell" id="pdOgita09">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">직무수당</td>
                    <td class="amount-cell" id="pdOgita11">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">당직수당</td>
                    <td class="amount-cell" id="pdOgita13">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">전월착오</td>
                    <td class="amount-cell" id="pdOgita10">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>

                <tr class="sum-row">
                    <th colspan="2" class="sum-label">과세 합계</th>
                    <td class="amount-cell" id="taxableTotal">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>

                <tr>
                    <th rowspan="4" class="section-cell section-cell-nontax">비과세</th>
                    <td class="item-cell">식대(*)</td>
                    <td class="amount-cell" id="pdOfoodamt">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">차량유지비(*)</td>
                    <td class="amount-cell" id="pdOcaramt">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">기타수당(*)</td>
                    <td class="amount-cell" id="pdOgita14">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>
                <tr>
                    <td class="item-cell">전월착오(*)</td>
                    <td class="amount-cell" id="pdOgita15">0</td>
                    <td class="empty-cell" colspan="2"></td>
                </tr>

                <tr class="sum-row">
                    <th colspan="2" class="sum-label">비과세 합계</th>
                    <td class="amount-cell" id="nonTaxableTotal">0</td>
                    <th colspan="2" class="sum-label">공제 합계</th>
                    <td class="amount-cell" id="deductionTotal">0</td>
                </tr>

                <tr class="final-row">
                    <th colspan="2" class="sum-label">급여총액</th>
                    <td class="amount-cell" id="grossTotal">0</td>
                    <th colspan="2" class="sum-label">실지급액</th>
                    <td class="amount-cell amount-cell-final" id="realPayAmount">0</td>
                </tr>
            </tbody>
        </table>
    </div>
</main>

<%--    <input type="hidden" id="ccFlag" value="<c:out value='${ccFlag}'/>"/>--%>
</div>

<%@ include file="../common/detailDrawer.jspf" %>
<script src="<c:url value='/js/paystub/payStub.js'/>"></script>
</body>
</html>
