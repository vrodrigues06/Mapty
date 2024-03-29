import App from './app.js';

export default class Workout {
  date = new Date();
  id = new Date().getTime().toString().slice(-4);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
