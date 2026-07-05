package com.smartmfg.monitor.config;

import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QdrantConfig {

    @Value("${qdrant.host:localhost}")
    private String host;

    @Value("${qdrant.port:6334}")
    private int port;

    @Bean
    public QdrantClient qdrantClient() {
        // If host is mock, return null or a dummy to prevent connection errors
        if ("mock".equalsIgnoreCase(host)) {
            return null;
        }
        try {
            return new QdrantClient(QdrantGrpcClient.newBuilder(host, port, false)
                    .build());
        } catch (Exception e) {
            System.err.println("Could not initialize QdrantClient: " + e.getMessage());
            return null;
        }
    }
}
