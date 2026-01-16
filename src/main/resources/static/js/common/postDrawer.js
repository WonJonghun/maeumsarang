// 공지, 자유게시판, 자료실 등등
// 게시글 상세 HTML + 디테일드로워 오픈
function postDetail(rowEl, useHistory) {
    if (typeof detailDrawerShow !== 'function') return;

    const selRow = $(rowEl);

    const title = cmEscapeHtml(selRow.data('tn-title') || '');
    const dateStr = cmEscapeHtml(selRow.data('tn-date-str') || '');
    const uk = cmEscapeHtml(selRow.data('tn-uk') || '');
    const viewCount = cmEscapeHtml(selRow.data('view-count') || '0');
    const remark = cmNl2br(selRow.data('tn-remark') || '');
    const imgNum = selRow.data('tn-img-num') || '';

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

    detailDrawerShow(html, useHistory !== false, imgNum);
}
