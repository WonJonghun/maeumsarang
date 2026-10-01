<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>

<div class="approval-ws-wrap">
    <div class="approval-detail-list">
        <div class="approval-detail-section">
            <table class="approval-meta-table">
                <tbody>
                    <tr>
                        <th class="meta-table-th approval-detail-subtitle">신청일자</th>
                        <th class="meta-table-th approval-detail-subtitle">부서</th>
                        <th class="meta-table-th approval-detail-subtitle">신청자</th>
                    </tr>
                    <tr>
                        <td class="meta-table-td approval-detail-body"><c:out value="${detail.ccDate}" /></td>
                        <td class="meta-table-td approval-detail-body"><c:out value="${detail.ccBuserNm}" /></td>
                        <td class="meta-table-td td-right approval-detail-body"><c:out value="${detail.userNm}" /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="approval-detail-section">
            <div class="approval-detail-subtitle">
                휴가종류
            </div>
            <div class="approval-detail-body no-wrap">
                <c:out value="${detail.items[1].title}" />
            </div>
        </div>
        <div class="approval-detail-section">
            <div class="approval-detail-subtitle">
                휴가목적
            </div>
            <c:choose>
                <c:when test="${empty fn:trim(detail.items[2].title)}">
                    <div class="approval-detail-body is-empty">-</div>
                </c:when>
                <c:otherwise>
                    <div class="approval-detail-body"><c:out value="${detail.items[2].title}" /></div>
                </c:otherwise>
            </c:choose>
        </div>
        <div class="approval-detail-section">
            <div class="approval-detail-subtitle">
                휴가기간
            </div>
            <div class="approval-detail-body"><c:out value="${detail.items[0].value}" />

<c:out value="${detail.items[3].title}" />
<c:out value="${detail.items[3].value}" />

상기와 같이 휴가를 신청합니다.</div>
        </div>
    </div>
</div>