<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<div class="approval-body">
    <div class="approval-test-badge">[임시] 기본 문서</div>

    <c:if test="${empty detail}">
        <div class="approval-empty">상세 데이터가 없습니다.</div>
    </c:if>

    <c:if test="${not empty detail}">
        <div class="approval-kv-list">
            <c:forEach var="it" items="${detail.items}">
                <div class="approval-kv-row">
                    <div class="approval-kv-key"><c:out value="${it.title}"/></div>
                    <div class="approval-kv-val"><c:out value="${it.value}"/></div>
                </div>
            </c:forEach>
        </div>
    </c:if>
</div>