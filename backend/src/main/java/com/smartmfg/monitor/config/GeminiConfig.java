package com.smartmfg.monitor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api-key:mock-key-for-now}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String defaultModel;

    @Value("${gemini.pro-model:gemini-1.5-pro}")
    private String proModel;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getDefaultModel() {
        return defaultModel;
    }

    public String getProModel() {
        return proModel;
    }
}
