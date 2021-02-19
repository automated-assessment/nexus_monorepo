class Car {

    private int id, fuel, lowFuelBoost, highFuelSlowdown, fuelConsumptionPerLap, pitStopTime, rainSlowdown, totalTime;

    public Car(int id, int fuel, int lowFuelBoost, int highFuelSlowdown, int fuelConsumptionPerLap, int pitStopTime,
            int rainSlowdown) {
        this.id = id;
        this.fuel = fuel;
        this.lowFuelBoost = lowFuelBoost;
        this.highFuelSlowdown = highFuelSlowdown;
        this.fuelConsumptionPerLap = fuelConsumptionPerLap;
        this.pitStopTime = pitStopTime;
        this.rainSlowdown = rainSlowdown;
        this.totalTime = 0;

        this.fuel = (this.fuel > 100) ? 100 : this.fuel;
    }

    public int completeLap(RaceTrack r) {

        int laptime = r.getAverageLapTime();

        if (this.fuel > 50) {
            laptime += this.highFuelSlowdown;
        } else {
            laptime -= this.lowFuelBoost;
        }

        laptime += (r.isRaining()) ? this.rainSlowdown : 0;

        this.fuel -= this.fuelConsumptionPerLap;

        if (this.fuel <= 0) {
            this.fuel = 100;
            laptime += this.pitStopTime;
        }

        return laptime;
    }

    public int getTotalTime() {
        return this.totalTime;
    }

    public int getID() {
        return this.id;
    }

    public int getFuel(){
    	return this.fuel;
    }

    public int getLowFuelBoost(){
    	return this.lowFuelBoost;
    }

    public int getHighFuelSlowdown(){
    	return this.highFuelSlowdown;
    }

    public int getFuelConsumptionPerLap(){
    	return this.fuelConsumptionPerLap;
    }

    public int getPitStopTime(){
    	return this.pitStopTime;
    }

    public int getRainSlowdown(){
    	return this.rainSlowdown;
    }
}
