package com.smartmfg.monitor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType; // MANUAL, SOP, TROUBLESHOOTING

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "vector_id", nullable = false, length = 100)
    private String vectorId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
