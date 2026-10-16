package com.example.mshintra.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.rememberme.PersistentRememberMeToken;
import org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

public class ConcurrentRememberMeServices extends PersistentTokenBasedRememberMeServices {
    private static final long RESTORE_WINDOW = TimeUnit.SECONDS.toNanos(5);
    private static final String RESTORE_KEY = ConcurrentRememberMeServices.class.getName() + ".restore";
    private final PersistentTokenRepository repository;
    private final Object[] locks = new Object[64];
    private final Map<String, Restore> restores = Collections.synchronizedMap(new LinkedHashMap<>(128, .75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Restore> entry) {
            return size() > 1024;
        }
    });

    public ConcurrentRememberMeServices(String key, UserDetailsService users, PersistentTokenRepository repository) {
        super(key, users, repository);
        this.repository = repository;
        for (int index = 0; index < locks.length; index++) locks[index] = new Object();
    }

    //동시에 도착한 자동로그인 요청 복구
    @Override
    protected UserDetails processAutoLoginCookie(String[] tokens, HttpServletRequest request, HttpServletResponse response) {
        if (tokens.length != 2) return super.processAutoLoginCookie(tokens, request, response);
        long started = System.nanoTime();
        String series = tokens[0];
        synchronized (locks[Math.floorMod(series.hashCode(), locks.length)]) {
            Restore restore = restores.get(series);
            PersistentRememberMeToken current = repository.getTokenForSeries(series);
            if (restore != null && started <= restore.completed().get()
                    && System.nanoTime() - restore.created() <= RESTORE_WINDOW
                    && restore.previousToken().equals(tokens[1])
                    && current != null && restore.username().equals(current.getUsername())
                    && restore.currentToken().equals(current.getTokenValue())
                    && current.getDate().getTime() + getTokenValiditySeconds() * 1000L >= System.currentTimeMillis()) {
                UserDetails user = getUserDetailsService().loadUserByUsername(restore.username());
                setCookie(new String[]{series, restore.currentToken()}, getTokenValiditySeconds(), request, response);
                return user;
            }

            UserDetails user = super.processAutoLoginCookie(tokens, request, response);
            current = repository.getTokenForSeries(series);
            if (current != null) {
                Restore pending = new Restore(tokens[1], current.getTokenValue(), user.getUsername(),
                        System.nanoTime(), new AtomicLong(Long.MAX_VALUE));
                restores.put(series, pending);
                request.setAttribute(RESTORE_KEY, pending);
            }
            return user;
        }
    }

    //첫 복구 응답 완료
    public void completeRestore(HttpServletRequest request) {
        Restore restore = (Restore) request.getAttribute(RESTORE_KEY);
        if (restore != null) restore.completed().compareAndSet(Long.MAX_VALUE, System.nanoTime());
    }

    private record Restore(String previousToken, String currentToken, String username, long created, AtomicLong completed) {
    }
}
