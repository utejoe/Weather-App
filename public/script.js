const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatheritemEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const unsupportedMessage = document.getElementById('unsupported-message');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Show loading timeout fallback if data doesn't load
let dataLoaded = false;
setTimeout(() => {
  if (!dataLoaded) {
    unsupportedMessage.style.display = 'block';
  }
}, 7000); // 7 seconds timeout

// Clock & Date
setInterval(() => {
  const time = new Date();
  const day = time.getDay();
  const month = time.getMonth();
  const date = time.getDate();
  const hour = time.getHours();
  const min = time.getMinutes();
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hoursIn12HrFormat = hour % 12 || 12;

  timeEl.innerHTML = `${hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat}:${min < 10 ? '0' + min : min} <span id="am-pm">${ampm}</span>`;
  dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

// ✅ Detect if geolocation is available
if ('geolocation' in navigator) {
  getWeatherData();
} else {
  unsupportedMessage.style.display = 'block';
}

function getWeatherData() {
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;

    // === Current Weather ===
    fetch(`https://weather-app-ja3o.onrender.com/weather?lat=${latitude}&lon=${longitude}`)
      .then(res => res.json())
      .then(data => {
        dataLoaded = true;
        timezone.innerHTML = data.name;
        countryEl.innerHTML = `${data.sys.country}`;
        currentWeatheritemEl.innerHTML = `
          <div class="weather-item"><div>Humidity</div><div>${data.main.humidity}%</div></div>
          <div class="weather-item"><div>Pressure</div><div>${data.main.pressure} hPa</div></div>
          <div class="weather-item"><div>Wind Speed</div><div>${data.wind.speed} m/s</div></div>
          <div class="weather-item"><div>Temp</div><div>${data.main.temp}&#176; C</div></div>
        `;

        currentTempEl.innerHTML = `
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" class="w-icon" alt="weather-icon">
          <div class="other">
            <div class="day">${moment.unix(data.dt).format('dddd')}</div>
            <div class="temp">Current - ${data.main.temp}&#176; C</div>
            <div class="temp">Feels like - ${data.main.feels_like}&#176; C</div>
          </div>
        `;
      }).catch(err => {
        console.error('Weather fetch error:', err);
        unsupportedMessage.style.display = 'block';
      });

    // === 5-Day Forecast ===
    fetch(`https://weather-app-ja3o.onrender.com/forecast?lat=${latitude}&lon=${longitude}`)
      .then(res => res.json())
      .then(data => {
        let forecastMap = {};
        const today = moment().format('ddd');

        data.list.forEach(item => {
          const day = moment(item.dt_txt).format('ddd');
          if (day === today) return;

          if (!forecastMap[day]) {
            forecastMap[day] = {
              temps: [],
              icon: item.weather[0].icon
            };
          }
          forecastMap[day].temps.push(item.main.temp);
        });

        let forecastHTML = '';
        let dayCount = 0;

        for (let day in forecastMap) {
          if (dayCount >= 5) break;

          const temps = forecastMap[day].temps;
          const minTemp = Math.min(...temps).toFixed(1);
          const maxTemp = Math.max(...temps).toFixed(1);
          const icon = forecastMap[day].icon;

          forecastHTML += `
            <div class="weather-forecast-item">
              <div class="day">${day}</div>
              <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="w-icon" alt="icon">
              <div class="temp">Night - ${minTemp}&#176; C</div>
              <div class="temp">Day - ${maxTemp}&#176; C</div>
            </div>
          `;
          dayCount++;
        }

        weatherForecastEl.innerHTML = forecastHTML;
      }).catch(err => {
        console.error('Forecast fetch error:', err);
      });
  }, (error) => {
    unsupportedMessage.style.display = 'block';
    console.error("Location error:", error);
  });
}
