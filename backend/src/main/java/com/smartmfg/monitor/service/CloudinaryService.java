package com.smartmfg.monitor.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    @Autowired(required = false)
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // Check if Cloudinary is configured with valid credentials or if we should run in mock mode
            if (cloudinary == null || "mock-cloud".equals(cloudinary.config.cloudName)) {
                logger.info("Cloudinary running in mock mode. Generating local mockup URL.");
                return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60"; // Default industrial machine image
            }

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            logger.error("Failed to upload file to Cloudinary", e);
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }
}
