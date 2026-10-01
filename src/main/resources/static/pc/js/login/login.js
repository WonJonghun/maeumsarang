$(function () {
    $('#pcLoginForm').on('submit', function (e) {
        const loginId = $('#pcLoginId').val().trim();
        const loginPw = $('#pcLoginPw').val();

        if ($('#pcLoginSubmit').prop('disabled')) {
            e.preventDefault();
            return;
        }

        $('#pcLoginId, #pcLoginPw').removeAttr('aria-invalid');
        $('#pcLoginError').text('');

        if (!/^\d+$/.test(loginId)) {
            e.preventDefault();
            $('#pcLoginError').text('사번을 숫자로 입력해 주세요.');
            $('#pcLoginId').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        if (!loginPw) {
            e.preventDefault();
            $('#pcLoginError').text('비밀번호를 입력해 주세요.');
            $('#pcLoginPw').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        $('#pcLoginId').val(loginId);
        $('#pcLoginSubmit').prop('disabled', true).text('로그인 중…');
        $(this).attr('aria-busy', 'true');
    });

    // $('#pcPasswordToggle').on('click', function () {
    //     const showPassword = $('#pcLoginPw').attr('type') === 'password';
    //     $('#pcLoginPw').attr('type', showPassword ? 'text' : 'password');
    //     $(this).attr('aria-pressed', String(showPassword)).attr('aria-label', showPassword ? '비밀번호 숨기기' : '비밀번호 표시');
    //     $(this).find('i').toggleClass('bi-eye', !showPassword).toggleClass('bi-eye-slash', showPassword);
    // });

    $('#pcLoginId, #pcLoginPw').on('input', function () {
        $(this).removeAttr('aria-invalid');
        $('#pcLoginError').text('');
    });

    $(window).on('pageshow', function () {
        $('#pcLoginSubmit').prop('disabled', false).text('로그인');
        $('#pcLoginForm').removeAttr('aria-busy');
    });
});
