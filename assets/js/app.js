import Running from './running.js';
import Cycling from './cycling.js';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const workoutContainers = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

export default class App {
  #map;
  #mapEvent;
  #workouts = JSON.parse(localStorage.getItem('workouts')) || [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);

    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
      setTimeout(() => {
        this._renderWorkoutMarker(workout);
      }, 500);
    });

    workoutContainers.addEventListener('click', this._moveOnClick.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert("Couldn't get your current position.");
      });
    }
  }

  _moveOnClick(e) {
    if (e.target.closest('.workout')) {
      const id = e.target.closest('.workout').dataset.id;

      const workoutClicked = this.#workouts.find(workout => workout.id === id);
      this.#map.setView(workoutClicked.coords);
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm({ latlng }) {
    this.#mapEvent = latlng;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    inputCadence.value = '';
    inputDuration.value = '';
    inputDistance.value = '';
    inputElevation.value = '';
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // Validation
    if (type === 'Running') {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running(
        [this.#mapEvent.lat, this.#mapEvent.lng],
        distance,
        duration,
        cadence
      );
    }

    // Validation

    if (type === 'Cycling') {
      const elevGain = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevGain) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling(
        [this.#mapEvent.lat, this.#mapEvent.lng],
        distance,
        duration,
        elevGain
      );
    }
    this.#workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));

    this._renderWorkout(workout);
    this._renderWorkoutMarker(workout);
    this._hideForm();
  }

  _renderWorkout(workout) {
    let workoutType = workout.type;
    const isRunning = workoutType === 'Running';
    const html = `<li class="workout workout--${workout.type.toLowerCase()}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.type} on ${
      months[new Date().getMonth()]
    } ${new Date().getDate()}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.icon}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${
      isRunning ? workout.pace : workout.speed
    }</span>
    <span class="workout__unit">${isRunning ? 'min/km' : 'km/h'}</span>
  </div>
  <div class="workout__details">
  <span class="workout__icon">${isRunning ? '🦶🏼' : '⛰'}</span>
  <span class="workout__value">${
    isRunning ? workout.cadence : workout.elevGain
  }</span>
  <span class="workout__unit">${isRunning ? 'm' : 'spm'}</span>
</div>
</li>
    `;

    form.insertAdjacentHTML('afterend', html);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type.toLowerCase()}-popup`,
        })
      )
      .setPopupContent(
        `${workout.icon} ${workout.type} on ${
          months[new Date().getMonth()]
        } ${new Date().getDate()}`
      )
      .openPopup();
  }
}
