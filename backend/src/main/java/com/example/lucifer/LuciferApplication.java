package com.example.lucifer;

import com.example.lucifer.client.person.PersonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LuciferApplication {


    public static void main(String[] args) {
        SpringApplication.run(LuciferApplication.class, args);
    }

}


