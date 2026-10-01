<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<link rel="stylesheet" href="<c:url value='/mobile/css/approval/approvalDetail.css'/>">

<div class="approval-detail-wrap">
    <jsp:include page="/WEB-INF/views/mobile/jsp/approval/detail/approvalSign.jsp" />
    <jsp:include page="${bodyPage}" />
</div>