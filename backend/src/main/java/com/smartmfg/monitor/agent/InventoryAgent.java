package com.smartmfg.monitor.agent;

import com.smartmfg.monitor.entity.SparePart;
import com.smartmfg.monitor.service.GeminiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InventoryAgent {

    @Autowired
    private GeminiClientService geminiClient;

    private static final String SYSTEM_INSTRUCTION = 
            "You are the InventoryAgent. Your task is to verify parts availability and compile stock acquisition recommendations. " +
            "Provide output in strict JSON format: { \"partInStock\": boolean, \"partNumber\": string, \"currentStock\": int, \"minStockLevel\": int, \"isReorderRequired\": boolean, \"procurementRecommendation\": string }";

    public String checkSparesAvailability(String requestedPartNumber, List<SparePart> availableSpares) {
        String partsList = availableSpares.stream()
                .map(p -> String.format("[Part: %s, Number: %s, Stock: %d, Min: %d]", p.getName(), p.getPartNumber(), p.getStockQuantity(), p.getMinStockLevel()))
                .collect(Collectors.joining("\\n"));

        String userPrompt = String.format("Requested Part Number: %s\\nAvailable Inventory List:\\n%s\\nDetermine if parts are in stock and write reorder recommendations in JSON format.", 
                requestedPartNumber, partsList);

        return geminiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt, false);
    }
}
