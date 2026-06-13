package com.parkvue.cricinfo.backend.dto;

import java.util.List;

public class ScorecardDTO {
    private List<InningsScorecardDTO> innings;

    public List<InningsScorecardDTO> getInnings() { return innings; }
    public void setInnings(List<InningsScorecardDTO> innings) { this.innings = innings; }
}
