<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>직원 로그인 | 마음사랑병원 인트라넷</title>
    <link rel="stylesheet" href="<c:url value='/common/css/pretendard.css'/>">
    <link rel="stylesheet" href="<c:url value='/webjars/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css'/>">
    <link rel="stylesheet" href="<c:url value='/common/css/common.css'/>">
    <link rel="stylesheet" href="<c:url value='/pc/css/login/login.css'/>">
</head>
<body class="pc-login-page" data-login-device="pc"
      data-pc-url="<c:url value='/login/pc/login.do'/>" data-mobile-url="<c:url value='/login/login.do'/>">
<main class="pc-login-card">
    <section class="pc-login-form-panel" aria-labelledby="pcLoginTitle">
        <img class="pc-login-logo" src="<c:url value='/images/mainLogo.png'/>" alt="마음사랑병원">

        <div class="pc-login-form-wrap">
            <p class="pc-login-eyebrow">마음사랑병원 인트라넷</p>
            <h1 id="pcLoginTitle">직원 로그인</h1>
<%--            <p class="pc-login-description">직원 계정으로 로그인해 주세요.</p>--%>

            <form id="pcLoginForm" action="<c:url value='/login/loginProc.do'/>" method="post" novalidate>
                <input type="hidden" name="<c:out value='${_csrf.parameterName}'/>" value="<c:out value='${_csrf.token}'/>">
                <input type="hidden" name="loginType" value="pc">

                <div class="pc-login-field">
                    <label for="pcLoginId">사번</label>
                    <div class="pc-login-input-wrap">
                        <i class="bi bi-person" aria-hidden="true"></i>
                        <input type="text" id="pcLoginId" name="loginId" autocomplete="username" inputmode="numeric"
                               placeholder="사번을 입력해 주세요" aria-describedby="pcLoginError" required>
                    </div>
                </div>

                <div class="pc-login-field">
                    <label for="pcLoginPw">비밀번호</label>
                    <div class="pc-login-input-wrap">
                        <i class="bi bi-lock" aria-hidden="true"></i>
                        <input type="password" id="pcLoginPw" name="loginPw" autocomplete="current-password"
                               placeholder="비밀번호를 입력해 주세요" aria-describedby="pcLoginError" required>
                        <button type="button" id="pcPasswordToggle" class="pc-login-password-toggle"
                                aria-label="비밀번호 표시" aria-controls="pcLoginPw" aria-pressed="false">
                            <i class="bi bi-eye" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                <div id="pcLoginError" class="pc-login-error" role="alert" aria-live="polite">
                    <c:choose>
                        <c:when test="${param.error eq 'true'}">
                            <c:out value="사번 또는 비밀번호를 확인해 주세요."/>
                        </c:when>
                        <c:when test="${param.expired eq 'true'}">
                            <c:out value="로그인 시간이 만료되었습니다. 다시 로그인해 주세요."/>
                        </c:when>
                    </c:choose>
                </div>

                <label class="pc-login-remember" for="pcRememberMe">
                    <input type="checkbox" id="pcRememberMe" name="rememberMe" value="true">
                    <span>자동로그인</span>
                </label>
                <button type="submit" id="pcLoginSubmit" class="pc-login-submit">로그인</button>
            </form>

        </div>

        <p class="pc-login-copyright">© Maeumsarang Hospital</p>
    </section>

    <aside class="pc-login-visual" aria-labelledby="pcLoginVisualTitle">
        <header class="pc-login-mission">
            <p class="pc-login-visual-label">MISSION <span>마음사랑의 약속</span></p>
            <h2 id="pcLoginVisualTitle"><span>최상의 의료서비스로</span><br><strong>인간사랑</strong>을 구현합니다.</h2>
            <div class="pc-login-leaves" aria-hidden="true"><span></span><span></span><span></span></div>
        </header>

        <section class="pc-login-purpose" aria-labelledby="pcPurposeTitle">
            <h3 id="pcPurposeTitle">환자와 가족의 행복, 더 건강한 지역사회</h3>
            <p>최고의 의술과 최선의 봉사로써 환자와 그 가족에게 최대의 행복을 제공하고,
                나아가 지역사회 정신건강에 이바지하기 위함입니다.</p>
        </section>

        <section class="pc-login-vision" aria-labelledby="pcVisionTitle">
            <h3 id="pcVisionTitle">우리가 만들어가는 병원 <span>OUR VISION</span></h3>
            <ol>
                <li><span class="pc-login-vision-icon" aria-hidden="true"><i class="bi bi-shield-check"></i></span><p>전문성 있는 진료로<br><strong>신뢰받는 병원</strong></p></li>
                <li><span class="pc-login-vision-icon" aria-hidden="true"><i class="bi bi-heart"></i></span><p>사랑실천으로<br><strong>고객이 행복한 병원</strong></p></li>
                <li><span class="pc-login-vision-icon" aria-hidden="true"><i class="bi bi-stars"></i></span><p>창의적인 인재양성으로<br><strong>신바람 나게 일하는 병원</strong></p></li>
                <li><span class="pc-login-vision-icon" aria-hidden="true"><i class="bi bi-people"></i></span><p>지역사회의 건강과<br><strong>행복한 삶에 기여하는 병원</strong></p></li>
            </ol>
        </section>

        <section class="pc-login-values" aria-labelledby="pcValuesTitle">
            <h3 id="pcValuesTitle">함께 지키는 행동규범 <span>5C VALUES</span></h3>
            <dl>
                <div><dt>고객만족 <span>Customer Satisfaction</span></dt><dd>최고의 의료서비스로 고객만족 극대화에 이바지한다.</dd></div>
                <div><dt>최고성과 <span>Championship</span></dt><dd>맡은 일에 최고의 성과를 내기 위하여 노력한다.</dd></div>
                <div><dt>창의 <span>Creativity</span></dt><dd>도전과 창의적 정신으로 미래를 개척한다.</dd></div>
                <div><dt>팀웍 <span>Consensus</span></dt><dd>우리의 공동목표 달성에 최선을 다한다.</dd></div>
                <div><dt>환경친화 <span>Clean Environment</span></dt><dd>우리 병원은 물론 지역 환경 개선에 기여한다.</dd></div>
            </dl>
        </section>
    </aside>
</main>
<script src="<c:url value='/common/js/jquery-3.7.1.min.js'/>"></script>
<script src="<c:url value='/common/js/loginDevice.js'/>"></script>
<script src="<c:url value='/pc/js/login/login.js'/>"></script>
</body>
</html>
