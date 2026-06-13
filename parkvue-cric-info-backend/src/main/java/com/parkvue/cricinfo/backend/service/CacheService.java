package com.parkvue.cricinfo.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkvue.cricinfo.backend.dto.MatchSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String MATCH_CACHE_PREFIX = "match_summary:";

    public void cacheMatchSummary(String matchId, MatchSummaryDTO summary) {
        try {
            String json = objectMapper.writeValueAsString(summary);
            redisTemplate.opsForValue().set(MATCH_CACHE_PREFIX + matchId, json, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to cache match summary: " + e.getMessage());
        }
    }

    public MatchSummaryDTO getCachedMatchSummary(String matchId) {
        try {
            String json = redisTemplate.opsForValue().get(MATCH_CACHE_PREFIX + matchId);
            if (json != null) {
                return objectMapper.readValue(json, MatchSummaryDTO.class);
            }
        } catch (Exception e) {
            System.err.println("Failed to read from cache: " + e.getMessage());
        }
        return null;
    }

    public void evictMatchSummary(String matchId) {
        redisTemplate.delete(MATCH_CACHE_PREFIX + matchId);
    }
}
