<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<div class="approval-header">
    <div class="approval-detail-title">
        <c:set var="bracketIdx" value="${fn:indexOf(detail.ccFlagNm, '(')}" />

        <c:choose>
            <c:when test="${bracketIdx ne -1}">
                <c:out value="${fn:substring(detail.ccFlagNm, 0, bracketIdx)}" />
                <br>
                <c:out value="${fn:substring(detail.ccFlagNm, bracketIdx, fn:length(detail.ccFlagNm))}" />
            </c:when>
            <c:otherwise>
                <c:out value="${detail.ccFlagNm}" />
            </c:otherwise>
        </c:choose>

        <c:out value="${detail.ccUk}" />
    </div>

    <c:if test="${not empty detail.signList}">
        <div class="approval-sign-wrap">
            <div class="approval-sign-label">결재</div>

            <div class="approval-sign-table">
                <c:forEach var="sign" items="${detail.signList}">
                    <div class="approval-sign-col">
                        <div class="approval-sign-title">
                            <c:out value="${sign.signTitle}" />
                        </div>

                        <div class="approval-sign-box">
                            <div class="approval-sign-mark">
                                <c:if test="${not empty sign.signNo}">
                                    <c:url var="signImgUrl" value="/attach/blobImageRequest.do">
                                        <c:param name="afNum" value="${sign.signNo}" />
                                    </c:url>

                                    <img class="detail-image-no-border"
                                         src="${signImgUrl}"
                                         alt="${sign.signNo}.jpg"
                                         loading="lazy">
                                </c:if>
                            </div>
                        </div>

                        <div class="approval-sign-date">
                            <c:out value="${fn:trim(sign.signDate)}" />
                        </div>
                    </div>
                </c:forEach>
            </div>
        </div>
    </c:if>
</div>