<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<div class="approval-ws-wrap">
    <div class="approval-detail-list">
        <div class="approval-detail-section">
            <table class="approval-meta-table">
                <tbody>
                    <tr>
                        <th class="meta-table-th approval-detail-subtitle">신청일자</th>
                        <th class="meta-table-th approval-detail-subtitle">신청부서</th>
                        <th class="meta-table-th approval-detail-subtitle">신청자</th>
                    </tr>
                    <tr>
                        <td class="meta-table-td approval-detail-body"><c:out value="${detail.ccDate}" /></td>
                        <td class="meta-table-td approval-detail-body"><c:out value="${detail.ccBuserNm}" /></td>
                        <td class="meta-table-td td-right approval-detail-body"><c:out value="${detail.userNm}" /></td>
                    </tr>
                    <tr>
                        <th class="meta-table-th approval-detail-subtitle">신청번호</th>
                    </tr>
                    <tr>
                        <td class="meta-table-td approval-detail-body"><c:out value="${orDetail[0].ccCode}" /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <c:forEach var="orDetail" items="${orDetail}" varStatus="status">
            <div class="approval-detail-section">
                <div class="approval-detail-subtitle">신청물품 <c:out value="${status.count}" /></div>

                <div class="approval-or-card">
                    <table class="approval-or-table">
                        <colgroup>
                            <col style="width: 84px;" />
                            <col />
                            <col style="width: 84px;" />
                            <col />
                        </colgroup>
                        <tbody>
                        <tr>
                            <th class="approval-or-th">물품명</th>
                            <td class="approval-or-td"><c:out value="${orDetail.ocName}" /></td>
                            <th class="approval-or-th">물품코드</th>
                            <td class="approval-or-td"><c:out value="${orDetail.orOccode}" /></td>
                        </tr>
                        <tr>
                            <th class="approval-or-th">규격</th>
                            <td class="approval-or-td"><c:out value="${orDetail.ocStanSize}" /></td>
                            <th class="approval-or-th">단위</th>
                            <td class="approval-or-td"><c:out value="${orDetail.ocUnit}" /></td>
                        </tr>
                        <tr>
                            <th class="approval-or-th">수량</th>
                            <td class="approval-or-td">
                                <fmt:formatNumber value="${orDetail.orQty}" pattern="#,##0.##" />
                            </td>
                            <th class="approval-or-th">단가</th>
                            <td class="approval-or-td">
                                <fmt:formatNumber value="${orDetail.orPrice}" pattern="#,##0.##" />
                            </td>
                        </tr>
                        <tr>
                            <th class="approval-or-th">총금액</th>
                            <td class="approval-or-td" colspan="3">
                                <fmt:formatNumber value="${orDetail.orQty * orDetail.orPrice}" pattern="#,##0" />
                            </td>
                        </tr>
                        <tr>
                            <th class="approval-or-th">비고</th>
                            <td class="approval-or-td" colspan="3">
                                <c:choose>
                                    <c:when test="${empty fn:trim(orDetail.orRemark)}">
                                        <div class="approval-or-empty">-</div>
                                    </c:when>
                                    <c:otherwise>
                                        <c:out value="${orDetail.orRemark}" />
                                    </c:otherwise>
                                </c:choose>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </c:forEach>
    </div>
</div>