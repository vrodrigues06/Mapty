import Workout from './workout.js';

export default class Running extends Workout {
  type = 'Running';
  icon = '🏃‍♂️';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
