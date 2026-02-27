package com.spandana.photohouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PhotoHouseApplication {

    public static void main(String[] args) {
        SpringApplication.run(PhotoHouseApplication.class, args);
    }
}
