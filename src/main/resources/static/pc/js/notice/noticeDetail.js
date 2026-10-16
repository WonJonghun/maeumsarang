$(function () {
    //이미지 확대
    $('#pcBoardImages').on('click', '.pc-board-image-preview', function () {
        const image = $(this).find('img');
        window.parent.cmOpenImageViewer(image.attr('src'), image.attr('alt'));
    });

    //첨부파일 조회
    const afNum = $('.pc-board-detail').attr('data-attach-id');
    if (!afNum) return;
    cmAjax('/attach/list.do', 'GET', {afNum: afNum}).done(function (list) {
        let files = '';
        let images = '';
        list.forEach(function (item) {
            const params = $.param({afNum: item.afNum, afSeq: item.afSeq});
            files += `
                <li>
                    <a href="/attach/download.do?${cmEscapeHtml(params)}" download="${cmEscapeHtml(item.afFileName)}">
                        <i class="bi bi-paperclip" aria-hidden="true"></i>
                        <span>${cmEscapeHtml(item.afFileName)}</span>
                    </a>
                    <span class="pc-board-file-size">${cmFormatKb(item.afFileSize)}</span>
                </li>`;
            if (cmIsImageFileName(item.afFileName)) {
                images += `
                    <button type="button" class="pc-board-image-preview" aria-label="${cmEscapeHtml(item.afFileName)} 확대 보기">
                        <img src="/attach/view.do?${cmEscapeHtml(params)}" alt="${cmEscapeHtml(item.afFileName)}" loading="lazy">
                    </button>`;
            }
        });
        $('#pcBoardAttachList').html(files);
        $('#pcBoardAttachments').prop('hidden', !list.length);
        $('#pcBoardImages').html(images);
    });
});
