package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupersetColumnDto {

    private String columnName;
    private String dataType;
    private Boolean nullable;
}
