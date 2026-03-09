<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<link rel="stylesheet" href="<c:url value='/css/page/approval/approvalWS.css'/>">

<div class="approval-ws-wrap">
    <div class="approval-header">
        <div class="approval-ws-title">일업무보고</div>

        <c:if test="${not empty detail.ccSignCnt and detail.ccSignCnt > 0}">
            <div class="approval-sign-wrap">
                <div class="approval-sign-label">결재</div>

                <div class="approval-sign-table">
                    <c:forEach var="idx" begin="1" end="${detail.ccSignCnt}">
                        <c:set var="signTitle" value="" />
                        <c:set var="signDate" value="" />
                        <c:set var="signNo" value="" />

                        <c:choose>
                            <c:when test="${idx eq 1}">
                                <c:set var="signTitle" value="${detail.ccSignTt1}" />
                                <c:set var="signDate" value="${detail.ccSignDt1}" />
                                <c:set var="signNo" value="${detail.esSign1}" />
                            </c:when>
                            <c:when test="${idx eq 2}">
                                <c:set var="signTitle" value="${detail.ccSignTt2}" />
                                <c:set var="signDate" value="${detail.ccSignDt2}" />
                                <c:set var="signNo" value="${detail.esSign2}" />
                            </c:when>
                            <c:when test="${idx eq 3}">
                                <c:set var="signTitle" value="${detail.ccSignTt3}" />
                                <c:set var="signDate" value="${detail.ccSignDt3}" />
                                <c:set var="signNo" value="${detail.esSign3}" />
                            </c:when>
                            <c:when test="${idx eq 4}">
                                <c:set var="signTitle" value="${detail.ccSignTt4}" />
                                <c:set var="signDate" value="${detail.ccSignDt4}" />
                                <c:set var="signNo" value="${detail.esSign4}" />
                            </c:when>
                            <c:when test="${idx eq 5}">
                                <c:set var="signTitle" value="${detail.ccSignTt5}" />
                                <c:set var="signDate" value="${detail.ccSignDt5}" />
                                <c:set var="signNo" value="${detail.esSign5}" />
                            </c:when>
                            <c:when test="${idx eq 6}">
                                <c:set var="signTitle" value="${detail.ccSignTt6}" />
                                <c:set var="signDate" value="${detail.ccSignDt6}" />
                                <c:set var="signNo" value="${detail.esSign6}" />
                            </c:when>
                            <c:when test="${idx eq 7}">
                                <c:set var="signTitle" value="${detail.ccSignTt7}" />
                                <c:set var="signDate" value="${detail.ccSignDt7}" />
                                <c:set var="signNo" value="${detail.esSign7}" />
                            </c:when>
                            <c:when test="${idx eq 8}">
                                <c:set var="signTitle" value="${detail.ccSignTt8}" />
                                <c:set var="signDate" value="${detail.ccSignDt8}" />
                                <c:set var="signNo" value="${detail.esSign8}" />
                            </c:when>
                        </c:choose>

                        <div class="approval-sign-col">
                            <div class="approval-sign-title">
                                <c:out value="${signTitle}" />
                            </div>

                            <div class="approval-sign-box">
                                <div class="approval-sign-mark">
                                    <c:if test="${not empty signNo}">
                                        <c:url var="signImgUrl" value="/attach/blobImageRequest.do">
                                            <c:param name="afNum" value="${signNo}" />
                                        </c:url>

                                        <img class="detail-image-no-border"
                                             src="${signImgUrl}"
                                             alt="${signNo}.jpg"
                                             loading="lazy">
                                    </c:if>
                                </div>
                            </div>

                            <div class="approval-sign-date"><c:out value="${fn:trim(signDate)}" /></div>
                        </div>
                    </c:forEach>
                </div>
            </div>
        </c:if>
    </div>

    <div class="approval-kv-list">
        <c:forEach var="item" items="${detail.items}">
            <div class="approval-kv-row">
                <div class="approval-kv-key">
                    <c:out value="${item.title}" />
                </div>
                <div class="approval-kv-val">
                    <c:out value="${item.value}" />
                </div>
            </div>
        </c:forEach>
    </div>
</div>