public class RaceSimulator {
  public static void main(String[] args) {
    RaceTrack silverstone = new RaceTrack(112, false);
    Car car1 = new Car(1, 79, 6, 5, 19, 25, 15);
    Car car2 = new Car(2, 67, 8, 4, 29, 16, 11);
    Car car3 = new Car(3, 41, 7, 6, 31, 18, 13);

    // First two laps
    for (int lap = 0; lap < 2; lap++) {
      race (silverstone, car1, car2, car3);
    }

    // Now it starts raining
    silverstone.setRaining(true);

    // And we race for a final time
    race (silverstone, car1, car2, car3);
  }

  private static void race (RaceTrack silverstone, Car car1, Car car2, Car car3) {
    car1.completeLap(silverstone);
    car2.completeLap(silverstone);
    car3.completeLap(silverstone);

    int time1 = car1.getTotalTime();
    int time2 = car2.getTotalTime();
    int time3 = car3.getTotalTime();

    if (time1 > time2) {
      if (time1 > time3) {
        System.out.println(car1.getID());
      } else {
        System.out.println(car3.getID());
      }
    } else {
      if (time2 > time3) {
        System.out.println(car2.getID());
      } else {
        System.out.println(car3.getID());
      }
    }
  }
}
