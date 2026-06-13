package com.parkvue.cricinfo.backend.service;

import com.parkvue.cricinfo.backend.dto.MatchSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.ArrayList;

@Service
public class BroadcastingService {

    // Map of Match ID to a list of active emitters
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String matchId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // Keep alive
        
        emitters.computeIfAbsent(matchId, k -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(matchId, emitter));
        emitter.onTimeout(() -> removeEmitter(matchId, emitter));
        emitter.onError((e) -> removeEmitter(matchId, emitter));

        return emitter;
    }

    public void broadcast(String matchId, MatchSummaryDTO summary) {
        List<SseEmitter> matchEmitters = emitters.get(matchId);
        if (matchEmitters != null) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            matchEmitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                        .name("match-update")
                        .data(summary));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            });
            matchEmitters.removeAll(deadEmitters);
        }
    }

    private void removeEmitter(String matchId, SseEmitter emitter) {
        List<SseEmitter> matchEmitters = emitters.get(matchId);
        if (matchEmitters != null) {
            matchEmitters.remove(emitter);
        }
    }
}
