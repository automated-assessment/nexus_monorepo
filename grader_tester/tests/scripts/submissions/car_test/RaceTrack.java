public class RaceTrack {
  private int averageLapTime;
  private boolean isRaining;

  public RaceTrack(int averageLapTime, boolean isRaining) {
    this.averageLapTime = averageLapTime;
    this.isRaining = isRaining;
  }

  public int getAverageLapTime() {
    return this.averageLapTime;
  }

  public void setAverageLapTime(int averageLapTime) {
    this.averageLapTime = averageLapTime;
  }

  public boolean isRaining() {
    return isRaining;
  }

  public void setRaining(boolean isRaining) {
    this.isRaining = isRaining;
  }
}