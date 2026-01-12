(function (global) {
    function cmAjaxRequest(option) {
        const config = $.extend({
            url: '',
            type: 'GET',
            data: {},
            async: true,
            dataType: 'json',
            processData: true,
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            loading: false,
            success: null,
            error: null,
            complete: null
        }, option || {});

        if (config.loading && typeof global.cmShowLdg === 'function') { global.cmShowLdg(); }

        return $.ajax({
            url: config.url,
            type: config.type,
            data: config.data,
            async: config.async,
            dataType: config.dataType,
            processData: config.processData,
            contentType: config.contentType,
            beforeSend: function (xhr) {
                const token = $('meta[name="_csrf"]').attr('content');
                const header = $('meta[name="_csrf_header"]').attr('content');
                if (token && header) xhr.setRequestHeader(header, token);
            },
            success: function (response) {
                if (typeof config.success === 'function') { config.success(response); }
            },
            complete: function (xhr) {
                if (config.loading && typeof global.cmCloseLdg === 'function') { global.cmCloseLdg(); }
                if (typeof config.complete === 'function') { config.complete(xhr); }
            },
            error: function (xhr) {
                try {
                    console.error('cmAjax error', {
                        url: config.url,
                        type: config.type,
                        status: xhr && xhr.status,
                        responseText: xhr && xhr.responseText
                    });
                } catch (e) {
                    console.error('cmAjax error (log fail)', e);
                }
                if (typeof config.error === 'function') { config.error(xhr); }
            }
        });

    }

    //기본
    global.cmAjax = function (url, type, jsonData, loading) {
        const data = (jsonData === undefined || jsonData === null) ? {} : jsonData;
        return cmAjaxRequest({
            url: url,
            type: type,
            data: data,
            loading: (loading !== false)
        });
    };

    //JSON Body
    global.cmAjaxBody = function (url, type, jsonData, loading) {
        const body = (jsonData === undefined || jsonData === null) ? {} : jsonData;
        return cmAjaxRequest({
            url: url,
            type: type,
            data: JSON.stringify(body),
            loading: !!loading,
            dataType: 'json',
            processData: true,
            contentType: 'application/json; charset=UTF-8'
        });
    };

    //POST + JSON Body + JSON 응답
    global.cmAjaxJson = function (url, jsonData, loading) {
        const body = (jsonData === undefined || jsonData === null) ? {} : jsonData;
        return cmAjaxRequest({
            url: url,
            type: 'POST',
            data: JSON.stringify(body),
            loading: !!loading,
            dataType: 'json',
            processData: true,
            contentType: 'application/json; charset=UTF-8'
        });
    };

    //FormData(파일전송)
    global.cmAjaxFormData = function (url, type, formData, loading) {
        return cmAjaxRequest({
            url: url,
            type: type,
            data: formData,
            loading: (loading !== false),
            dataType: 'json',
            processData: false,
            contentType: false
        });
    };
})(window);
