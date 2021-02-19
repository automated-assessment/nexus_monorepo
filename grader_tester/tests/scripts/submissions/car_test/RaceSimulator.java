public class RaceSimulator {

    public static Car getWinner(Car c1, Car c2, Car c3) {

        if (c1.getTotalTime() <= c2.getTotalTime() && c1.getTotalTime() <= c3.getTotalTime()) {
            return c1;
        }
        if (c2.getTotalTime() <= c3.getTotalTime()) {
            return c2;
        }
        return c3;
    }

    public static void main(String args[]) {
        RaceTrack silverstone = new RaceTrack(112, false);

        Car c1 = new Car(1, 79, 6, 5, 19, 25, 15);
        Car c2 = new Car(1, 79, 6, 5, 19, 25, 15);
        Car c3 = new Car(1, 79, 6, 5, 19, 25, 15);

        for (int i = 1; i <= 2; i++) {
            c1.completeLap(silverstone);
            c2.completeLap(silverstone);
            c3.completeLap(silverstone);

            Car winner = getWinner(c1, c2, c3);
            System.out.println(winner.getID());
        }

        silverstone.setRain(true);

        c1.completeLap(silverstone);
        c2.completeLap(silverstone);
        c3.completeLap(silverstone);

        Car winner = getWinner(c1, c2, c3);
        System.out.println(winner.getID());
    }
}
