package com.paymenthub.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

// TODO [review]: This class is dead code – it only logs a startup message.
//   Either populate seed data here (replacing data.sql + spring.sql.init.mode=always)
//   or remove the class entirely.
@Slf4j
@Component
public class DataInitializer implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        log.info("Payment Hub Backend started successfully. Sample data loaded.");
    }
}
