public class Car {
  private int id;
  private int fuelLevel;
  private int lowFuelBoost;
  private int highFuelSlowdown;
  private int fuelConsumptionPerLap;
  private int pitStopTime;
  private int rainSlowdown;
  private int totalTime = 0;

  public Car(int id, int fuelLevel, int lowFuelBoost, int highFuelSlowdown,
             int fuelConsumptionPerLap, int pitStopTime, int rainSlowdown) {
    this.id = id;
    this.fuelLevel = fuelLevel;
    if (this.fuelLevel > 100) {
      this.fuelLevel = 100;
    }
    this.lowFuelBoost = lowFuelBoost;
    this.highFuelSlowdown = highFuelSlowdown;
    this.fuelConsumptionPerLap = fuelConsumptionPerLap;
    this.pitStopTime = pitStopTime;
    this.rainSlowdown = rainSlowdown;
  }

  public int completeLap(RaceTrack rt) {
    int resultTime = rt.getAverageLapTime();

    if (fuelLevel >= 50) {
      resultTime += highFuelSlowdown;
    } else {
      resultTime -= lowFuelBoost;
    }

    if (rt.isRaining()) {
      resultTime += rainSlowdown;
    }

    if (fuelLevel < fuelConsumptionPerLap) {
      resultTime += pitStopTime;
      fuelLevel = 100;
    }

    fuelLevel -= fuelConsumptionPerLap;

    totalTime += resultTime;

    return resultTime;
  }

  public int getID() {
    return id;
  }

  public int getFuel() {
    return fuelLevel;
  }

  public int getLowFuelBoost() {
    return lowFuelBoost;
  }

  public int getHighFuelSlowdown() {
    return highFuelSlowdown;
  }

  public int getFuelConsumptionPerLap() {
    return fuelConsumptionPerLap;
  }

  public int getPitStopTime() {
    return pitStopTime;
  }

  public int getRainSlowdown() {
    return rainSlowdown;
  }

  public int getTotalTime() {
    return totalTime;
  }

}
