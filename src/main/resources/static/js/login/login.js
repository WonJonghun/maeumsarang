$(function(){
    //공백, 특수문자 예외
    $('#loginForm').on('submit',function(e){
        let loginIdVal = $('#loginId');
        let loginError = $('#loginError');
        let loginId = loginIdVal.val().trim();
        let loginPw = $('#loginPw').val();

        if (loginId === 'FridayParty') {
            e.preventDefault();
            window.location.href = 'https://vidkidz.tistory.com/51';
            return false;
        }

        const msg = '아이디 또는 비밀번호를 확인해 주세요.'
        loginError.text('');

        if(!loginId || !loginPw){
            loginError.text(msg);
            return false;
        }

        let numPattern = /^[0-9]+$/;
        if(!numPattern.test(loginId)){
            loginError.text(msg);
            return false;
        }

        loginIdVal.val(loginId);
        return true;
    });
});
