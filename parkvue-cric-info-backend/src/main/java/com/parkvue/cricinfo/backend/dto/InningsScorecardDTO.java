package com.parkvue.cricinfo.backend.dto;

import com.parkvue.cricinfo.backend.model.Innings;
import java.util.List;

public class InningsScorecardDTO {
    private Innings innings;
    private List<BattingRowDTO> batting;
    private List<BowlingRowDTO> bowling;

    public Innings getInnings() { return innings; }
    public void setInnings(Innings innings) { this.innings = innings; }
    public List<BattingRowDTO> getBatting() { return batting; }
    public void setBatting(List<BattingRowDTO> batting) { this.batting = batting; }
    public List<BowlingRowDTO> getBowling() { return bowling; }
    public void setBowling(List<BowlingRowDTO> bowling) { this.bowling = bowling; }
}
