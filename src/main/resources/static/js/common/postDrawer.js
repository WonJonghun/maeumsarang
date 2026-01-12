(function ($) {
    'use strict';

    if (window.postDetail) return;

    function buildPostDetailHtml(data) {
        let title = cmEscapeHtml(data.tnTitle || '');
        let dateStr = cmEscapeHtml(data.tnDateStr || '');
        let uk = cmEscapeHtml(data.tnUk || '');
        let viewCount = cmEscapeHtml(data.viewCount || '0');

        let html = '';
        html += '<div class="post-detail-head">';
        html += '  <h3 class="post-detail-title">' + title + '</h3>';
        html += '  <div class="post-detail-meta">';
        html += '    <span>' + dateStr + '</span>';
        html += '    <span>' + uk + '</span>';
        html += '    <span>조회 <span>' + viewCount + '</span></span>';
        html += '  </div>';
        html += '</div>';

        html += '<div style="height:12px;"></div>';
        html += '<div class="post-detail-remark">' + cmNl2br(data.tnRemark || '') + '</div>';

        html += '<div id="postImagePreview" class="post-image-preview" style="display:none;"></div>';

        html += '<div id="postAttachArea" class="post-attach-area" style="display:none;">';
        html += '  <div class="post-attach-title">첨부파일</div>';
        html += '  <ul id="postAttachList" class="post-attach-list"></ul>';
        html += '</div>';

        return html;
    }

    function clearAttachArea() {
        $('#postAttachArea').hide();
        $('#postAttachList').empty();
        $('#postImagePreview').hide().empty();
    }

    function loadAttachList(afNum) {
        if (!afNum) {
            clearAttachArea();
            return;
        }

        clearAttachArea();

        cmAjax('/attach/list.do', 'GET', {afNum: afNum}, false)
            .done(function (list) {
                if (window.detailDrawerIsOpen && !window.detailDrawerIsOpen()) return;

                if (!list || list.length === 0) {
                    clearAttachArea();
                    return;
                }

                let attachList = $('#postAttachList');
                let imagePreview = $('#postImagePreview');

                attachList.empty();
                imagePreview.hide().empty();

                let hasImage = false;

                for (let i = 0; i < list.length; i++) {
                    let item = list[i];

                    let fileName = (item.afFileName && item.afFileName.length > 0)
                        ? item.afFileName
                        : (item.afNum + '.' + ('0' + item.afSeq).slice(-2));

                    let downUrl = '/attach/download.do?afNum=' + encodeURIComponent(item.afNum)
                        + '&afSeq=' + encodeURIComponent(item.afSeq);

                    $('<li/>', {class: 'post-attach-item'})
                        .append(
                            $('<a/>', {
                                class: 'post-attach-link',
                                href: downUrl,
                                download: fileName
                            }).text(fileName)
                        )
                        .append(
                            $('<span/>', {class: 'post-attach-size'}).text(cmFormatKb(item.afFileSize))
                        )
                        .appendTo(attachList);

                    if (cmIsImageFileName(fileName)) {
                        hasImage = true;

                        let viewUrl = '/attach/view.do?afNum=' + encodeURIComponent(item.afNum)
                            + '&afSeq=' + encodeURIComponent(item.afSeq);

                        $('<div/>', {class: 'post-image-item'})
                            .append(
                                $('<img/>', {
                                    class: 'post-image',
                                    src: viewUrl,
                                    alt: fileName,
                                    loading: 'lazy'
                                }).on('error', function () {
                                    $(this).closest('.post-image-item').hide();
                                })
                            )
                            .appendTo(imagePreview);
                    }
                }

                $('#postAttachArea').show();
                if (hasImage) imagePreview.show();
            })
            .fail(function () {
                clearAttachArea();
            });
    }

    // main.js에서 window.postDetail로 사용중
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

        window.detailDrawerShow(buildPostDetailHtml(data), useHistory !== false);
        loadAttachList(data.tnImgNum);
    };

})(jQuery);
