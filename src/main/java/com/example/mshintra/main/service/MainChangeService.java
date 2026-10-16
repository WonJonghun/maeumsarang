package com.example.mshintra.main.service;

import com.example.mshintra.security.PcMainActivityFilter;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class MainChangeService {
    private final MainService mainService;
    private final Map<SseEmitter, Connection> connections = new ConcurrentHashMap<>();
    private volatile boolean closing;

    //최초 화면 조회 전 변경 기준 확보
    public String selectVersion(String userId) {
        return version(loadChanges(List.of("ALL", userId)), userId);
    }

    //로그인한 직원의 변경 알림 연결
    public synchronized SseEmitter connect(String userId, String version, HttpSession session) {
        if (closing) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "서버 종료 중입니다.");
        PcMainActivityFilter.start(session);
        SseEmitter emitter = new SseEmitter(0L);
        Connection connection = new Connection(userId, version, session);
        emitter.onCompletion(() -> connections.remove(emitter));
        emitter.onTimeout(() -> connections.remove(emitter));
        emitter.onError(error -> connections.remove(emitter));
        connections.put(emitter, connection);
        send(emitter, SseEmitter.event().name("connected").data("connected"));
        return emitter;
    }

    //접속자 변경 신호를 한 번에 조회
    @Scheduled(fixedDelay = 30000)
    public void checkChanges() {
        if (closing) return;
        connections.forEach((emitter, connection) -> valid(emitter, connection));
        if (connections.isEmpty()) return;

        Map<SseEmitter, Connection> currentConnections = Map.copyOf(connections);
        LinkedHashSet<String> codes = new LinkedHashSet<>();
        codes.add("ALL");
        currentConnections.values().forEach(connection -> codes.add(connection.userId));
        Map<String, LocalDateTime> changes;
        try {
            changes = loadChanges(List.copyOf(codes));
        } catch (DataAccessException exception) {
            log.warn("메인 변경 신호 조회 실패", exception);
            connections.forEach((emitter, connection) -> send(emitter, SseEmitter.event().comment("keepalive")));
            return;
        }

        currentConnections.forEach((emitter, connection) -> {
            if (!connections.containsKey(emitter) || !valid(emitter, connection)) return;
            String current = version(changes, connection.userId);
            if (!current.equals(connection.version)) {
                if (send(emitter, SseEmitter.event().name("changed").id(current).data("refresh"))) {
                    connection.version = current;
                }
            } else {
                send(emitter, SseEmitter.event().comment("keepalive"));
            }
        });
    }

    //웹 서버가 기존 요청 완료를 기다리기 전에 SSE 종료
    @EventListener(ContextClosedEvent.class)
    @PreDestroy
    public synchronized void closeConnections() {
        closing = true;
        connections.keySet().forEach(SseEmitter::complete);
        connections.clear();
    }

    private Map<String, LocalDateTime> loadChanges(List<String> codes) {
        Map<String, LocalDateTime> changes = new HashMap<>();
        mainService.selectMainChanges(codes).forEach(row -> changes.put(row.getSaCd(), row.getUpDt()));
        return changes;
    }

    private String version(Map<String, LocalDateTime> changes, String userId) {
        return Objects.toString(changes.get("ALL"), "") + "|" + Objects.toString(changes.get(userId), "");
    }

    private boolean valid(SseEmitter emitter, Connection connection) {
        try {
            SecurityContext context = (SecurityContext) connection.session.getAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
            if (context != null && context.getAuthentication() != null
                    && connection.userId.equals(context.getAuthentication().getName())
                    && !PcMainActivityFilter.isExpired(connection.session)) return true;
        } catch (IllegalStateException ignored) {
            //로그아웃·세션 만료
        }
        connections.remove(emitter);
        send(emitter, SseEmitter.event().name("session-expired").data("expired"));
        emitter.complete();
        return false;
    }

    private boolean send(SseEmitter emitter, SseEmitter.SseEventBuilder event) {
        try {
            emitter.send(event);
            return true;
        } catch (IOException | IllegalStateException exception) {
            connections.remove(emitter);
            return false;
        }
    }

    private static class Connection {
        private final String userId;
        private final HttpSession session;
        private String version;

        private Connection(String userId, String version, HttpSession session) {
            this.userId = userId;
            this.version = version;
            this.session = session;
        }
    }
}
