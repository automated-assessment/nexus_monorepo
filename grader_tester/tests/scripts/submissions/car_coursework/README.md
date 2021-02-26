# coursework_3_tests
Tests for coursework 3 nexus demo

## Assignment description:

We would like to create a simple simulation of a car race around a race track. There is an average time, in seconds, that all cars take to complete a lap around the track. The total time each individual car takes to complete a single lap is affected by the attributes of the car and the conditions of the race track. During a race, we would like to know who the leader is at the end of each lap. At the end, we would like to know the winner.

Model this scenario based on the following requirements (note that you should use the `int` data type for variables which store an amount of seconds). Create getters and setters for all attributes.

1. Create a class to represent a `RaceTrack`. A race track has an `averageLapTime`, given in seconds, which is the average time it takes for any car to complete one single lap around the track. A race track also has a flag `isRaining`, indicating if it is currently raining. When we create an object of this class, we should be able to supply values to these attributes. (1 mark)
2. Create a class to represent a `Car`. When we create an object of this class, we should be apply to supply values for the following attributes (1mark):
  1. an `id` number to identify the car,
  2. a `fuel` level, given in integer units with a maximum of 100,
  3. a `lowFuelBoost`, which is the amount of seconds in one lap that a car goes faster when its fuel level is low,
  4. a `highFuelSlowdown`, which is the amount of seconds in one lap that a car goes slower when its fuel level is high,
  5. a `fuelConsumptionPerLap`, given in integer units, to indicate how much fuel a car uses up per lap,
  6. a `pitStopTime`, which is the amount of seconds it takes for the car to complete a pit stop (to refuel the car),
  7. a `rainSlowdown`, which is the amount of seconds that a car slows down in one lap when it is raining,
  8. a `totalTime`, which is the total amount of seconds taken during a race and which starts at zero.
3. In the class `Car`, create a method `completeLap`, which returns the total time, in seconds, that the car takes to complete one lap around a provided race track. This total lap time must be calculated using the following guidelines:
  1. The base time for one lap is the race track's average lap time. (1 mark)
  2. When the fuel level is above 50 units, the car is heavier and therefore, goes slower in this lap by the amount of seconds specified by `highFuelSlowdown`. Otherwise, the car goes faster in this lap by the amount of seconds specified by `lowFuelBoost`. (1 mark).
  3. When it is raining, the car goes slower in this lap by the amount of seconds specified by `rainSlowdown`. (1 mark)
  4. At the end of a lap, the car uses up the amount of fuel given by `fuelConsumptionPerLap`. (1 mark)
  5. The car will need to take a pit stop when the fuel level drops below the amount of fuel that the car requires to complete one lap. When the car takes a pit stop, this makes the car go slower in this lap by the amount of seconds specified in `pitStopTime`. This also refuels the car to full capacity. (2 marks)
4. Create a class `RaceSimulator`, which can be compiled and run from the command line. Use this class to do the following (in order), using the classes and methods you have created above.
  1. Create a race track and name the variable holding it `silverstone`. Set the average lap time of this track to 112 seconds and make sure it is not raining.
  2. Create three cars, which have the following attributes:
    1. Car 1:
      - the id is 1,
      - the starting fuel is 79,
      - the low fuel boost 6,
      - the high fuel slowdown is 5,
      - the amount of fuel consumed per lap is 19,
      - the time taken for a pit stop is 25,
      - the additional time taken for a lap when it is raining is 15,
      - the total time starts at 0,
    2. Car 2:
      - the id is 2,
      - the starting fuel is 67,
      - the low fuel boost 8,
      - the high fuel slowdown is 4,
      - the amount of fuel consumed per lap is 29,
      - the time taken for a pit stop is 16,
      - the additional time taken for a lap when it is raining is 11,
      - the total time starts at 0,
    3. Car 3:
      - the id is 3,
      - the starting fuel is 41,
      - the low fuel boost 7,
      - the high fuel slowdown is 6,
      - the amount of fuel consumed per lap is 31,
      - the time taken for a pit stop is 18,
      - the additional time taken for a lap when it is raining is 13,
      - the total time starts at 0,
  3. Make your cars race for two laps around silverstone, and after each lap, print the id of the leader of the race.
  4. Make it rain on silverstone. Then, make your cars race for one more lap and, finally, print out the id of the winner of the race.
