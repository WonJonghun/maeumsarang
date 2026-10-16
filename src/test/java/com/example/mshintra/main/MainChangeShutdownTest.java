package com.example.mshintra.main;

import com.example.mshintra.main.service.MainChangeService;
import com.example.mshintra.main.service.MainService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class MainChangeShutdownTest {
    @Test
    void shutdownClosesLiveSseWhileAllowingOrdinaryRequestToFinish() throws Exception {
        var context = (ServletWebServerApplicationContext) new SpringApplicationBuilder(Fixture.class)
                .web(WebApplicationType.SERVLET)
                .properties(
                        "spring.config.location=optional:classpath:/shutdown-test-no-config.properties",
                        "server.address=127.0.0.1",
                        "server.port=0",
                        "server.shutdown=graceful",
                        "spring.lifecycle.timeout-per-shutdown-phase=5s",
                        "spring.jmx.enabled=false",
                        "logging.level.root=ERROR")
                .run();
        Fixture.Controller controller = context.getBean(Fixture.Controller.class);
        try (HttpClient client = HttpClient.newHttpClient(); var executor = Executors.newFixedThreadPool(2)) {
            String url = "http://127.0.0.1:" + context.getWebServer().getPort();
            var stream = client.send(HttpRequest.newBuilder(URI.create(url + "/events")).GET().build(),
                    HttpResponse.BodyHandlers.ofInputStream());
            assertEquals(200, stream.statusCode());
            try (var body = stream.body()) {
                var ordinary = client.sendAsync(HttpRequest.newBuilder(URI.create(url + "/ordinary")).GET().build(),
                        HttpResponse.BodyHandlers.ofString());
                assertTrue(controller.started.await(3, TimeUnit.SECONDS));
                var stopping = executor.submit(context::close);
                var closedStream = executor.submit(body::readAllBytes);
                String events = new String(closedStream.get(2, TimeUnit.SECONDS), java.nio.charset.StandardCharsets.UTF_8);
                assertTrue(events.contains("event:connected"));
                assertFalse(stopping.isDone(), "일반 요청은 정상 완료를 기다려야 합니다.");
                controller.finish.countDown();
                assertEquals("finished", ordinary.get(2, TimeUnit.SECONDS).body());
                stopping.get(2, TimeUnit.SECONDS);
            }
        } finally {
            controller.finish.countDown();
            context.close();
        }
    }

    @Test
    void shutdownRejectsNewStreamsAndStopsPolling() {
        MainService main = mock(MainService.class);
        MainChangeService changes = new MainChangeService(main);
        changes.closeConnections();
        var failure = assertThrows(ResponseStatusException.class,
                () -> changes.connect("0419", "|", new MockHttpSession()));
        assertEquals(503, failure.getStatusCode().value());
        changes.checkChanges();
        verifyNoInteractions(main);
    }

    @TestConfiguration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            SecurityAutoConfiguration.class,
            UserDetailsServiceAutoConfiguration.class
    })
    static class Fixture {
        @Bean
        MainChangeService mainChangeService() {
            return new MainChangeService(mock(MainService.class));
        }

        @TestComponent
        @RestController
        static class Controller {
            private final MainChangeService changes;
            private final CountDownLatch started = new CountDownLatch(1);
            private final CountDownLatch finish = new CountDownLatch(1);

            Controller(MainChangeService changes) {
                this.changes = changes;
            }

            @GetMapping(value = "/events", produces = "text/event-stream")
            SseEmitter events(HttpSession session) {
                return changes.connect("0419", "|", session);
            }

            @GetMapping("/ordinary")
            String ordinary() throws InterruptedException {
                started.countDown();
                if (!finish.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("test release timed out");
                return "finished";
            }
        }
    }
}
