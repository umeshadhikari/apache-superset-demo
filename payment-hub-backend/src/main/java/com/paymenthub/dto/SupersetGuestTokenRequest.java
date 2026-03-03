package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request payload sent to the Superset guest-token API.
 * See: POST /api/v1/security/guest_token/
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupersetGuestTokenRequest {

    /** The user info object forwarded to Superset. */
    private UserInfo user;

    /** List of resources (dashboards) the token grants access to. */
    private List<Resource> resources;

    /** Row-level security rules (empty list = no additional filtering). */
    private List<RlsRule> rls;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String username;
        private String firstName;
        private String lastName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resource {
        private String type;  // "dashboard"
        private String id;    // Superset dashboard UUID
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RlsRule {
        private List<String> dataset;
        private String clause;
    }
}
