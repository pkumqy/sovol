#ifndef _SOVOL_REALTIMEREPEATSIMULATION_HH
#define _SOVOL_REALTIMEREPEATSIMULATION_HH 1

#include "Field.hh"
#include "ParticleFactory.hh"
#include <vector>

enum SimulationStatus {
  DATA_OUTPUT,
  TIME_LIMIT_EXCEED,
  ENDTIME_REACHED,
  FINISHED
};

class RealTimeRepeatSimulation {
  private:
    Field *field;
    ParticleFactory *particleFactory;
    double timeStep;
    double endTime;
    int remainingNumber;
    double dataInterval;
    double dataStartTime;

    Particle *currentParticle;
    double currentTime;
    double nextDataTime;

    void setParticle(Particle *);
    double calculateNextDataTime();

  public:
    RealTimeRepeatSimulation();
    RealTimeRepeatSimulation(Field *_field, ParticleFactory *_particleFactory,
                             double _timeStep, double _endTime,
                             int _remainingNumber = 1,
                             double _dataInterval = 0.,
                             double _dataStartTime = 0.);
    ~RealTimeRepeatSimulation();
    Particle *getParticle() const;
    double getCurrentTime() const;
    SimulationStatus run(long timeLimitMilliseconds = 0);
};

#endif