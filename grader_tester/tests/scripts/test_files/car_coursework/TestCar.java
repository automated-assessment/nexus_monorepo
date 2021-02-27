import static org.junit.Assert.assertEquals;

import org.junit.Test;

import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestWeight;
import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestDescription;

/**
 * Tests the second part of the coursework:
 *
 * Create a class to represent a Car. When we create an object of this class,
 * we should be apply to supply values for the following attributes (1 mark):
 *
 * 1. an id number to identify the car,
 * 2. a fuel level, given in integer units with a maximum of 100,
 * 3. a lowFuelBoost, which is the amount of seconds in one lap that a car
 *    goes faster when its fuel level is low,
 * 4. a highFuelSlowdown, which is the amount of seconds in one lap that a car
 *    goes slower when its fuel level is high,
 * 5. a fuelConsumptionPerLap, given in integer units, to indicate how much
 *    fuel a car uses up per lap,
 * 6. a pitStopTime, which is the amount of seconds it takes for the car to
 *    complete a pit stop (to refuel the car),
 * 7. a rainSlowdown, which is the amount of seconds that a car slows down in
 *    one lap when it is raining,
 * 8. a totalTime, which is the total amount of seconds taken during a race
 *    and which starts at zero.
 */
public class TestCar {
  @Test
  @TestWeight(1)
  @TestDescription("Check structure and construction of Car class")
  public void testRaceTrackConstruction() {
    Car c = new Car(7, 50, 20, 10, 25, 17, 15);

    assertEquals("Car id is not tracked correctly", 7, c.getID());
    assertEquals("Car fuel level is not tracked correctly", 50, c.getFuel());
    assertEquals("Car low fuel boost is not tracked correctly", 20, c.getLowFuelBoost());
    assertEquals("Car high fuel slowdown is not tracked correctly", 10, c.getHighFuelSlowdown());
    assertEquals("Car fuel consumption per lap is not tracked correctly", 25, c.getFuelConsumptionPerLap());
    assertEquals("Car pit stop time is not tracked correctly", 17, c.getPitStopTime());
    assertEquals("Car rain slow down is not tracked correctly", 15, c.getRainSlowdown());
    assertEquals("Car total time should start at 0", 0, c.getTotalTime());

    try{
      c = new Car(9, 150, 22, 18, 27, 19, 12);

      // If there was no exception, we expect the student code to cap the fuel level to 100
      assertEquals("Car id is not tracked correctly", 9, c.getID());
      assertEquals("Car fuel level is not tracked correctly. It should be capped at 100.", 100, c.getFuel());
      assertEquals("Car low fuel boost is not tracked correctly", 22, c.getLowFuelBoost());
      assertEquals("Car high fuel slowdown is not tracked correctly", 18, c.getHighFuelSlowdown());
      assertEquals("Car fuel consumption per lap is not tracked correctly", 27, c.getFuelConsumptionPerLap());
      assertEquals("Car pit stop time is not tracked correctly", 19, c.getPitStopTime());
      assertEquals("Car rain slow down is not tracked correctly", 12, c.getRainSlowdown());
      assertEquals("Car total time should start at 0", 0, c.getTotalTime());
    }
    catch (Exception e) {
      // This is a good thing: the student code recognised that the fuel level was too high
    }
  }
}
