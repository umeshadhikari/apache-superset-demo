package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned to the Angular frontend with the Superset guest token
 * and the Superset base URL needed to initialise the Embedded SDK.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupersetGuestTokenResponse {
    private String token;
    private String supersetDomain;
}
