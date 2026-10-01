<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>

<div class="approval-ws-wrap">
    <div class="approval-detail-list">
        <div class="approval-detail-section">
            <table class="approval-meta-table">
                <tbody>
                <tr>
                    <th class="meta-table-th approval-detail-subtitle">접수일자</th>
                    <th class="meta-table-th approval-detail-subtitle">발신처</th>
                    <th class="meta-table-th approval-detail-subtitle">종류</th>
                </tr>
                <tr>
                    <td class="meta-table-td approval-detail-body"><c:out value="${plDetail.ccDate}" /></td>
                    <td class="meta-table-td approval-detail-body"><c:out value="${plDetail.ccPlace}" /></td>
                    <td class="meta-table-td td-right approval-detail-body"><c:out value="${plDetail.ccFgNm}" /></td>
                </tr>

                <tr>
                    <th class="meta-table-th approval-detail-subtitle">문서관리자</th>
                    <th class="meta-table-th approval-detail-subtitle" colspan="2">문서번호</th>
                </tr>
                <tr>
                    <td class="meta-table-td approval-detail-body"><c:out value="${plDetail.ccManagerNm}" /></td>
                    <td class="meta-table-td approval-detail-body td-right" colspan="2"><c:out value="${plDetail.ccPaperNo}" /></td>
                </tr>

                <tr>
                    <th class="meta-table-th approval-detail-subtitle">수신지정</th>
                    <th class="meta-table-th approval-detail-subtitle">수신자</th>
                    <th class="meta-table-th approval-detail-subtitle">수신일자</th>
                </tr>
                <tr>
                    <td class="meta-table-td approval-detail-body"><c:out value="${plDetail.ccReBuserNm}" /></td>
                    <td class="meta-table-td approval-detail-body"><c:out value="${plDetail.ccReSaNm}" /></td>
                    <td class="meta-table-td td-right approval-detail-body"><c:out value="${plDetail.ccReDate}" /></td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>