import static org.junit.Assert.assertEquals;

import org.junit.Test;

import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestWeight;
import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestDescription;

/**
 * Tests the completeLap method of class Car.
 *
 * In the class Car, create a method completeLap, which returns the total time,
 * in seconds, that the car takes to complete one lap around a provided race
 * track. This total lap time must be calculated using the following guidelines:
 *
 * 1. The base time for one lap is the race track's average lap time. (1 mark)
 * 2. When the fuel level is above 50 units, the car is heavier and therefore,
 *    goes slower in this lap by the amount of seconds specified by
 *    highFuelSlowdown. Otherwise, the car goes faster in this lap by the
 *    amount of seconds specified by lowFuelBoost. (1 mark).
 * 3. When it is raining, the car goes slower in this lap by the amount of
 *    seconds specified by rainSlowdown. (1 mark)
 * 4. At the end of a lap, the car uses up the amount of fuel given by
 *    fuelConsumptionPerLap. (1 mark)
 * 5. The car will need to take a pit stop when the fuel level drops below
 *    the amount of fuel that the car requires to complete one lap. When the
 *    car takes a pit stop, this makes the car go slower in this lap by the
 *    amount of seconds specified in pitStopTime. This also refuels the car
 *    to full capacity. (2 marks)
 */
public class TestCompleteLap {
  @Test
  @TestWeight(1)
  @TestDescription("The base time for one lap is the race track's average lap time.")
  public void testBaseTimeCalculation() {
    RaceTrack rt = new RaceTrack(50, false);
    Car c = new Car(6, 100, 0, 0, 20, 0, 0);

    assertEquals("Base time miscalculated", 50, c.completeLap(rt));
  }

  @Test
  @TestWeight(1)
  @TestDescription(
    "When the fuel level is above 50 units, the car is heavier and therefore, " +
    "goes slower in this lap by the amount of seconds specified by highFuelSlowdown. " +
    "Otherwise, the car goes faster in this lap by the amount of seconds specified " +
    "by lowFuelBoost.")
  public void testFuelBoost() {
    RaceTrack rt = new RaceTrack(50, false);

    Car c = new Car(6, 100, 17, 25, 20, 0, 0);
    assertEquals("High fuel slowdown has not been taken into account correctly", 75, c.completeLap(rt));

    c = new Car(6, 50, 17, 25, 20, 0, 0);
    assertEquals("High fuel slowdown has not been taken into account correctly", 75, c.completeLap(rt));

    c = new Car(6, 49, 17, 25, 20, 0, 0);
    assertEquals("Low fuel boost has not been taken into account correctly", 33, c.completeLap(rt));

    c = new Car(6, 20, 17, 25, 20, 0, 0);
    assertEquals("Low fuel boost has not been taken into account correctly", 33, c.completeLap(rt));
  }

  @Test
  @TestWeight(1)
  @TestDescription(
    "When it is raining, the car goes slower in this lap by the amount of seconds " +
    "specified by rainSlowdown.")
  public void testRainSlowdown() {
    Car c = new Car(18, 100, 0, 0, 20, 0, 15);

    RaceTrack rt = new RaceTrack(50, false);
    assertEquals("When it's not raining, there should be no slowdown because of rain.", 50, c.completeLap(rt));

    rt = new RaceTrack(50, true);
    assertEquals("When it's raining, there should be slowdown because of rain.", 65, c.completeLap(rt));
  }

  @Test
  @TestWeight(1)
  @TestDescription(
    "At the end of a lap, the car uses up the amount of fuel given by fuelConsumptionPerLap.")
  public void testFuelConsumption() {
    RaceTrack rt = new RaceTrack(50, false);
    Car c = new Car(27, 100, 0, 0, 17, 0, 0);

    c.completeLap(rt);
    assertEquals("Fuel should be consumed per lap.", 100 - 17, c.getFuel());

    c.completeLap(rt);
    assertEquals("Fuel should be consumed each lap.", 100 - 17 - 17, c.getFuel());
  }

  @Test
  @TestWeight(2)
  @TestDescription(
    "The car will need to take a pit stop when the fuel level drops below the " +
    "amount of fuel that the car requires to complete one lap. When the car takes " +
    "a pit stop, this makes the car go slower in this lap by the amount of seconds " +
    "specified in pitStopTime. This also refuels the car to full capacity.")
  public void testPitStop() {
    RaceTrack rt = new RaceTrack(50, false);
    Car c = new Car(129, 10, 0, 0, 30, 23, 0);

    assertEquals("Car refuelling requires a pitstop.", 73, c.completeLap(rt));
    assertEquals("A pitstop refuels the car, but a lap of the track then consumes fuel, too.", 70, c.getFuel());
  }
}
