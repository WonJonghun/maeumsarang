$(function () {
    //로그인 제출
    $('#pcLoginForm').on('submit', function (e) {
        const id = $('#pcLoginId').val().trim();
        const pw = $('#pcLoginPw').val();

        if ($('#pcLoginSubmit').prop('disabled')) {
            e.preventDefault();
            return;
        }

        $('#pcLoginId, #pcLoginPw').removeAttr('aria-invalid');
        $('#pcLoginError').text('');

        if (!/^\d+$/.test(id)) {
            e.preventDefault();
            $('#pcLoginError').text('사번을 숫자로 입력해 주세요.');
            $('#pcLoginId').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        if (!pw) {
            e.preventDefault();
            $('#pcLoginError').text('비밀번호를 입력해 주세요.');
            $('#pcLoginPw').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        $('#pcLoginId').val(id);
        $('#pcLoginSubmit').prop('disabled', true).text('로그인 중…');
        $(this).attr('aria-busy', 'true');
    });

    //비밀번호 표시 전환
    // $('#pcPasswordToggle').on('click', function () {
    //     const show = $('#pcLoginPw').attr('type') === 'password';
    //     $('#pcLoginPw').attr('type', show ? 'text' : 'password');
    //     $(this)
    //         .attr('aria-pressed', String(show))
    //         .attr('aria-label', show ? '비밀번호 숨기기' : '비밀번호 표시');
    //     $(this).find('i').toggleClass('bi-eye', !show).toggleClass('bi-eye-slash', show);
    // });

    //입력 시 오류 표시 초기화
    $('#pcLoginId, #pcLoginPw').on('input', function () {
        $(this).removeAttr('aria-invalid');
        $('#pcLoginError').text('');
    });

    //페이지 복귀 시 로그인 버튼 초기화
    $(window).on('pageshow', function () {
        $('#pcLoginSubmit').prop('disabled', false).text('로그인');
        $('#pcLoginForm').removeAttr('aria-busy');
    });
});
