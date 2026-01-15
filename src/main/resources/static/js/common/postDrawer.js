// postDrawer.js
// postDrawer.jspf 삭제 기준: 내부 구조(post-detail-head/body)를 JS가 만들어 detailDrawer로 전달
// 첨부/미리보기 로딩은 detailDrawer.js가 처리(3번째 인자 afNum)
(function ($) {
    'use strict';

    if (window.postDetail) return;

    function buildPostDetailHtml(data) {
        let title = cmEscapeHtml(data.tnTitle || '');
        let dateStr = cmEscapeHtml(data.tnDateStr || '');
        let uk = cmEscapeHtml(data.tnUk || '');
        let viewCount = cmEscapeHtml(data.viewCount || '0');
        let remark = cmNl2br(data.tnRemark || '');

        let html = '';
        html += '<div class="post-detail-head">';
        html += '  <h3 class="post-detail-title" id="postDetailTitle">' + title + '</h3>';
        html += '  <div class="post-detail-meta">';
        html += '    <span id="postDetailDate">' + dateStr + '</span>';
        html += '    <span id="postDetailWriter">' + uk + '</span>';
        html += '    <span>조회 <span id="postDetailViews">' + viewCount + '</span></span>';
        html += '  </div>';
        html += '</div>';

        html += '<div class="post-detail-body">';
        html += '  <div class="post-detail-remark" id="postDetailRemark">' + remark + '</div>';
        html += '</div>';

        return html;
    }

    window.postDetail = function (rowEl, useHistory) {
        let selRow = $(rowEl);

        let data = {
            tnTitle: selRow.data('tn-title') || '',
            tnDateStr: selRow.data('tn-date-str') || '',
            tnUk: selRow.data('tn-uk') || '',
            viewCount: selRow.data('view-count') || '0',
            tnRemark: selRow.data('tn-remark') || '',
            tnImgNum: selRow.data('tn-img-num') || ''
        };

        window.detailDrawerShow(buildPostDetailHtml(data), useHistory !== false, data.tnImgNum);
    };

})(jQuery);
