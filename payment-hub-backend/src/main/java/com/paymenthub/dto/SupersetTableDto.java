package com.paymenthub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupersetTableDto {

    private String tableName;
    private List<SupersetColumnDto> columns;
}
