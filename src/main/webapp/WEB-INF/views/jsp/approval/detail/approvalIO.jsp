<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>

<div class="approval-ws-wrap">
    <div class="approval-detail-list">
        <div class="approval-detail-section">
            <table class="approval-meta-table">
                <tbody>
                    <tr>
                        <th class="meta-table-th approval-detail-subtitle">정정일자</th>
                        <th class="meta-table-th approval-detail-subtitle">부서</th>
                        <th class="meta-table-th approval-detail-subtitle">작성자</th>
                    </tr>
                    <tr>
                        <td class="meta-table-td approval-detail-body"><c:out value="${detail.ccDate}" /></td>
                        <td class="meta-table-td approval-detail-body"><c:out value="${detail.ccBuserNm}" /></td>
                        <td class="meta-table-td td-right approval-detail-body"><c:out value="${detail.userNm}" /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <c:forEach var="item" items="${detail.items}" varStatus="status">
            <div class="approval-detail-section">
                <div class="approval-detail-subtitle">
                    <c:out value="${item.title}" />
                </div>
                <c:choose>
                    <c:when test="${empty fn:trim(item.value)}">
                        <div class="approval-detail-body is-empty">-</div>
                    </c:when>
                    <c:when test="${status.index lt 2}">
                        <div class="approval-detail-body no-wrap">
                            <span class="approval-part-font"><c:if test="${not empty item.fontColor}"><c:out value="${item.fontColor}" /></c:if></span>
                            <span class="approval-part-arrow"><c:if test="${not empty fn:trim(item.value)}">&gt;</c:if></span>
                            <span class="approval-part-value"><c:choose><c:when test="${fn:length(fn:trim(item.value)) == 4}"><c:out value="${fn:substring(item.value, 0, 2)}" />:<c:out value="${fn:substring(item.value, 2, 4)}" /></c:when><c:otherwise><c:out value="${item.value}" /></c:otherwise></c:choose></span>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <div class="approval-detail-body"><c:out value="${item.value}" />

상기와 같이 출.퇴근 정정을 신청합니다.</div>
                    </c:otherwise>
                </c:choose>
            </div>
        </c:forEach>
    </div>
</div>