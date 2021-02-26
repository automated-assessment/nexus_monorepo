import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
  TestRaceTrack.class,
  TestCar.class,
  TestCompleteLap.class,
})
public class TestSpecification { }
