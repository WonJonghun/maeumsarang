$(function () {
    $('#passChangeForm').on('submit', function (e) {
        e.preventDefault();

        savePassChange();
    });
});

//저장 버튼
function savePassChange() {
    if (!chkPassChange()) {
        return;
    }

    const data = {
        oldPassword: $('#oldPassword').val(),
        newPassword: $('#newPassword').val(),
        newPasswordConfirm: $('#newPasswordConfirm').val()
    };

    customAlert("알림","비밀번호를 변경 하시겠습니까?","YN").then(function(ok){
        if(ok){
            cmAjax('/profile/passChange.do', 'POST', data, true).done(function (item) {
                if (!item.success) {
                    customAlert('알림', item.message, 'WARN');
                    return;
                }

                customAlert('알림', "변경 되었습니다.", 'CONFIRM').then(function(){
                    location.reload();
                });
            });
        }
    });
}

//비밀번호 기준 체크
function chkPassChange() {
    const oldPassword = $('#oldPassword').val();
    const newPassword = $('#newPassword').val();
    const newPasswordConfirm = $('#newPasswordConfirm').val();

    if (oldPassword === '') {
        alert('현재 비밀번호를 입력하세요.');
        return false;
    }

    if (newPassword === '') {
        alert('새로운 비밀번호를 입력하세요.');
        return false;
    }

    if (newPasswordConfirm === '') {
        alert('새 비밀번호 확인을 입력하세요.');
        return false;
    }

    if (oldPassword === newPassword) {
        alert('다른 비밀번호를 입력해주세요.');
        return false;
    }

    if (newPassword !== newPasswordConfirm) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return false;
    }

    if (newPassword.length < 10) {
        alert('비밀번호는 최소 10자리 이상이어야 합니다.');
        return false;
    }

    if (newPassword.length > 20) {
        alert('비밀번호는 최대 20자 이하여야 합니다.');
        return false;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        alert('비밀번호는 특수문자, 영문, 숫자를 포함해야 합니다.');
        return false;
    }

    const lowerPassword = newPassword.toLowerCase();

    for (let i = 0; i < lowerPassword.length - 2; i++) {
        const first = lowerPassword.charCodeAt(i);
        const second = lowerPassword.charCodeAt(i + 1);
        const third = lowerPassword.charCodeAt(i + 2);

        if (
            (first + 1 === second && second + 1 === third)
            || (first - 1 === second && second - 1 === third)
            || (first === second && second === third)
        ) {
            alert('비밀번호에 연속문자 또는 연속숫자는 사용할 수 없습니다.');
            return false;
        }
    }

    return true;
}