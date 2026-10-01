$(function () {
    const mobileDevice = navigator.userAgentData?.mobile === true
        || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    const device = mobileDevice ? 'mobile' : 'pc';
    const currentDevice = $('body').attr('data-login-device');

    if (currentDevice !== device) {
        const targetUrl = $('body').attr('data-' + device + '-url');
        window.location.replace(targetUrl + (currentDevice === 'authenticated' ? '' : window.location.search));
    }
});
