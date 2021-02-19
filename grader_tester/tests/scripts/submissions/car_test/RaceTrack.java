class RaceTrack {
    private int av;
    private boolean isr;

    public RaceTrack(int av, boolean isr) {
        this.av = av;
        this.isr = isr;
    }

    public int getAverageLapTime() {
        return this.av;
    }

    public boolean isRaining() {
        return this.isr;
    }

    public void setRain(boolean isr) {
        this.isr = isr;
    }
}
