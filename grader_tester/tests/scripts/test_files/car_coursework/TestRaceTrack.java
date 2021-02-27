import static org.junit.Assert.*;

import org.junit.Test;

import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestWeight;
import uk.ac.kcl.inf.nexus.junit_grader.annotations.TestDescription;

/**
 * Tests the first part of the coursework:
 *
 * Create a class to represent a RaceTrack. A race track has an averageLapTime,
 * given in seconds, which is the average time it takes for any car to complete
 * one single lap around the track. A race track also has a flag isRaining,
 * indicating if it is currently raining. When we create an object of this
 * class, we should be able to supply values to these attributes. (1 mark)
 */
public class TestRaceTrack {
  @Test
  @TestWeight(1)
  @TestDescription("Check structure and construction of RaceTrack class")
  public void testRaceTrackConstruction() {
    RaceTrack rt = new RaceTrack(35, true);

    assertTrue("isRaining is not correctly tracked", rt.isRaining());
    assertEquals("Getter was not correctly returning averageLapTime",
        35, rt.getAverageLapTime());

    rt = new RaceTrack(128, false);

    assertFalse("isRaining is not correctly tracked", rt.isRaining());
    assertEquals("Getter was not correctly returning averageLapTime",
        128, rt.getAverageLapTime());
  }
}
