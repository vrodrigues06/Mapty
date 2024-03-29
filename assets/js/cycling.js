import Workout from './workout.js';

export default class Cycling extends Workout {
  icon = '🚴‍♀️';
  type = 'Cycling';
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
