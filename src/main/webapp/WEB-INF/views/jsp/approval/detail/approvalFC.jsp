<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>

<div class="approval-ws-wrap">
    <div class="approval-detail-list">
        <div class="approval-detail-section">
            <table class="approval-meta-table">
                <tbody>
                    <tr>
                        <th class="meta-table-th approval-detail-subtitle">작성일자</th>
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
        <c:forEach var="detail" items="${fcDetail}" varStatus="status">
            <div class="approval-detail-section">
                <c:choose>
                    <c:when test="${empty fn:trim(detail.ccTitle)}">
                        <div class="approval-detail-subtitle">내용</div>
                    </c:when>
                    <c:otherwise>
                        <div class="approval-detail-subtitle"><c:out value="${detail.ccTitle}" /></div>
                    </c:otherwise>
                </c:choose>

                <c:choose>
                    <c:when test="${empty fn:trim(detail.ccRmk)}">
                        <div class="approval-detail-body is-empty">-</div>
                    </c:when>
                    <c:otherwise>
                        <div class="approval-detail-body"><c:out value="${detail.ccRmk}" /></div>
                    </c:otherwise>
                </c:choose>
            </div>

            <c:if test="${status.last}">
                <div class="approval-detail-section">
                    <div class="approval-detail-body no-wrap font-size-12">협조자 <c:out value="${detail.ccHubJo}" /><br />
                        <c:out value="${detail.ccNum}" /> <c:out value="${detail.ccDate}" /><br />
                        <c:out value="${detail.ccAddr}" /><br />
                        <c:out value="${detail.ccPhone}" /><br /></div>
                </div>
            </c:if>
        </c:forEach>
    </div>
</div>