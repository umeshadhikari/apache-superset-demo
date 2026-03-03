package com.paymenthub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymenthub.dto.SupersetGuestTokenRequest;
import com.paymenthub.dto.SupersetGuestTokenResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Communicates with the Apache Superset REST API to:
 * <ol>
 *   <li>Obtain a short-lived service-account JWT via {@code POST /api/v1/security/login}</li>
 *   <li>Exchange that JWT for a guest token via {@code POST /api/v1/security/guest_token/}</li>
 * </ol>
 * The guest token is passed to the Angular frontend which uses the Superset
 * Embedded SDK to render the dashboard inside an {@code <iframe>}.
 */
@Service
@RequiredArgsConstructor
public class SupersetApiService {

    private static final Logger log = LoggerFactory.getLogger(SupersetApiService.class);

    @Value("${superset.url:http://localhost:8088}")
    private String supersetUrl;

    @Value("${superset.admin.username:admin}")
    private String adminUsername;

    @Value("${superset.admin.password:admin}")
    private String adminPassword;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Generates a Superset guest token for the given dashboard UUID.
     *
     * @param dashboardId   Superset embedded dashboard UUID
     * @param username      end-user identifier (forwarded to Superset for audit)
     * @param rlsClauses    optional list of SQL WHERE clauses for row-level security
     * @return guest token response containing the token and Superset base URL
     */
    public SupersetGuestTokenResponse getGuestToken(String dashboardId, String username,
                                                    List<String> rlsClauses) {
        String jwt = loginAsAdmin();
        String guestToken = fetchGuestToken(jwt, dashboardId, username, rlsClauses);
        return new SupersetGuestTokenResponse(guestToken, supersetUrl);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private String loginAsAdmin() {
        String url = supersetUrl + "/api/v1/security/login";
        Map<String, String> body = Map.of(
                "username", adminUsername,
                "password", adminPassword,
                "provider", "db",
                "refresh", "true"
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            JsonNode node = response.getBody();
            if (node == null || !node.has("access_token")) {
                throw new RuntimeException("Superset login did not return an access_token");
            }
            return node.get("access_token").asText();
        } catch (Exception e) {
            log.error("Failed to authenticate with Superset at {}: {}", url, e.getMessage());
            throw new RuntimeException("Failed to authenticate with Superset: " + e.getMessage(), e);
        }
    }

    private String fetchGuestToken(String jwt, String dashboardId, String username,
                                   List<String> rlsClauses) {
        String url = supersetUrl + "/api/v1/security/guest_token/";

        // Build RLS rules
        List<SupersetGuestTokenRequest.RlsRule> rls = rlsClauses == null
                ? List.of()
                : rlsClauses.stream()
                        .map(clause -> SupersetGuestTokenRequest.RlsRule.builder()
                                .dataset(List.of())
                                .clause(clause)
                                .build())
                        .toList();

        SupersetGuestTokenRequest payload = SupersetGuestTokenRequest.builder()
                .user(SupersetGuestTokenRequest.UserInfo.builder()
                        .username(username)
                        .firstName(username)
                        .lastName("")
                        .build())
                .resources(List.of(
                        SupersetGuestTokenRequest.Resource.builder()
                                .type("dashboard")
                                .id(dashboardId)
                                .build()))
                .rls(rls)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(jwt);
        HttpEntity<SupersetGuestTokenRequest> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            JsonNode node = response.getBody();
            if (node == null || !node.has("token")) {
                throw new RuntimeException("Superset guest_token/ did not return a token");
            }
            return node.get("token").asText();
        } catch (Exception e) {
            log.error("Failed to obtain guest token from Superset for dashboard {}: {}", dashboardId, e.getMessage());
            throw new RuntimeException("Failed to obtain Superset guest token: " + e.getMessage(), e);
        }
    }
}
