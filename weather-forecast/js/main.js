document.addEventListener('DOMContentLoaded', () => {

  const day = new Date();
  let getDay = time => new Date(time);

  const monthsRus = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  // const monthsRu = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  // const monthsEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  // const dayRus = ['Вск', 'Пнд', 'Втр', 'Сре', 'Чтв', 'Птн', 'Суб'];
  // const dayRussian = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  // const dayEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  // const dayEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // const dayEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


  function timestampConversation(t) {
    const now = getDay(t * 1000);
    let hour = now.getHours();
    let minute = now.getMinutes();
    hour = (hour < 10) ? `0${hour}` : hour;
    minute = (minute < 10) ? `0${minute}` : minute;
    return `${hour}:${minute}`
  }

  let windDeg = (deg) => {
    if (deg >= 0 || deg <= 22.5 && deg >= 337.5 || deg <= 360) return 'северный'
    else if (deg >= 22.6 || deg <= 67.5) return 'северо-восточный'
    else if (deg >= 67.6 || deg <= 112.5) return 'восточный'
    else if (deg >= 112.6 || deg <= 157.5) return 'юго-восточный'
    else if (deg >= 157.6 || deg <= 202.5) return 'южный'
    else if (deg >= 202.6 || deg <= 277.5) return 'юго-западный'
    else if (deg >= 277.6 || deg <= 282.5) return 'западный'
  }

  function getFullDay() {
    let dd = String(day.getDate()).padStart(2, '0');
    let mm = String(day.getMonth() + 1).padStart(2, '0');
    const yyyy = day.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  function getDuration(sunrise, sunset) {
    let sunRise = getDay(sunrise);
    let sunSet = getDay(sunset);
    let different = sunSet - sunRise;
    let hours = Math.floor((different % 86400) / 3600)
    let minutes = Math.ceil(((different % 86400) % 3600) / 60);
    if (minutes === 60) minutes -= 1;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    return `${hours} ч ${minutes} мин`;
  }

  function getPosition(lat, lon) {
    getCurrentWeather(lat, lon);
    getForecastWeather(lat, lon);
    getOneCallAPI(lat, lon);
    loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBlRvR5o1Duvdlb2O7fp_OpPYIRginKYao&libraries=places&callback=initMap', initMap, lat, lon);
    // hidePreloader()
  }

  (function () {
    let lat = 50.4497115;
    let lon = 30.5235707;
    navigator.geolocation.getCurrentPosition(function (geoPosition) {
        let lat = geoPosition ? geoPosition.coords.latitude : 50.4497115;
        let lon = geoPosition ? geoPosition.coords.longitude : 30.5235707;
        getPosition(lat, lon);
      },
      function (error) {
        console.log(error);
        getPosition(lat, lon);
      }
    );
  })();

  function loadScript(src, initMap, lat, lon) {
    let script = document.createElement('script');
    script.src = src;
    script.onload = () => initMap(lat, lon)
    document.head.append(script);
  }

  /*function hidePreloader() {
    const spinner = document.querySelector('.preloader');
    const cont = document.querySelector('.container.hide');
    setTimeout(() => {
      spinner.classList.add('hide');
      if (cont) cont.classList.remove('hide');
    }, 1000);
  }*/

  function showPreloader() {
    const spinner = document.querySelector('.preloader.hide');
    const cont = document.querySelector('.container');
    if (spinner) spinner.classList.remove('hide');
    cont.classList.add('hide');
  }

  function initMap(lat, lon) {
    const center = {lat: lat, lng: lon}
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: center,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    const marker = new google.maps.Marker({
      map,
      position: center
    });
    const infoWindow = new google.maps.InfoWindow({
      content: '',
    });

    const locationButton = document.createElement("button");

    locationButton.textContent = "Ваше местоположение";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            getPosition(pos.lat, pos.lng)
            map.setCenter(pos);
            marker.setPosition(pos);
            marker.setVisible(true);
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        );
      } else {
        handleLocationError(false, infoWindow, map.getCenter());
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
          browserHasGeolocation
            ? "Ошибка: В вашем браузере отключена геолокация"
            : "Ошибка: Ваш браузер не поддерживает службу геолокации"
        );
        infoWindow.open(map);
      }
    });

    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      showPreloader();
      let place = autocomplete.getPlace();
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
      infoWindow.close();
      if (!place.geometry) {
        // hidePreloader();
        alert('Error');
      } else {
        map.fitBounds(place.geometry.viewport)
      }
      /*marker.setIcon({
        scaledSize: new google.maps.Size(25, 25)
      });*/
      /*marker.setPosition(place.geometry.location);
      marker.setVisible(true);*/
      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      getCity(lat, lon)
      document.getElementById('autocomplete').value = '';
    });

    function getCity(lat, lon) {
      const url = new URL("https://api.openweathermap.org/data/2.5/weather");
      const params = {
        lat: lat,
        lon: lon,
        units: "metric",
        lang: "ru",
        appid: "2e3f0a4de66d0bcd26974266f439e301"
      };

      for (let param in params) {
        url.searchParams.set(param, params[param])
      }

      fetch(url.toString())
        .then(data => data.json())
        .then(cityName => {
          renderCurrentWeather(cityName);
          getForecastWeather(cityName.coord.lat, cityName.coord.lon);
          getOneCallAPI(cityName.coord.lat, cityName.coord.lon)
        });
      // hidePreloader();
    }
  }

  function getCurrentWeather(lat, lon) {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    const params = {
      lat: lat,
      lon: lon,
      units: "metric",
      lang: "ru",
      appid: "2e3f0a4de66d0bcd26974266f439e301"
    };

    for (let param in params) {
      url.searchParams.set(param, params[param])
    }

    fetch(url.toString())
      .then(data => data.json())
      .then(currentWeather => renderCurrentWeather(currentWeather))
  }

  function renderCurrentWeather({weather, main, visibility, sys}) {
    function createIcon() {
      const link = document.createElement('link');
      link.rel = `icon`
      link.href = `https://openweathermap.org/img/wn/${weather[0]['icon']}.png`
      document.head.append(link)
    }

    createIcon();
    document.getElementById('rightNow-weather').innerHTML = (`
          <div class="col-md-8 current-weather-wrapp row">
            <div class="col-4 current-weather-description row">
              <div class="icon"><img src='https://openweathermap.org/img/wn/${weather[0]['icon']}@2x.png' alt="icon"/></div>
              <span class="description">${weather[0]["description"]}</span>
            </div>
            <div class="col-8 current-weather-temperature row">
              <span class="temperature">${Math.round(main['temp'])}&deg;C</span>
              <span class="feel">Ощущается как ${Math.round(main['feels_like'])}&deg;C</span>
            </div>
          </div>
          <div class="col-md-4 current-weather-duration row">
              <span class="sunrise">Восход: ${timestampConversation(sys['sunrise'])}</span>
              <span class="sunset">Закат: ${timestampConversation(sys['sunset'])}</span>
              <span class="duration">Продолжительность дня: ${getDuration(sys['sunrise'], sys['sunset'])}</span>
              <span class="visibility">Видимость: ${(visibility / 1000)}км</span>
          </div>`)

    document.querySelector('#current-weather .date').textContent = (`${getFullDay()}`);
  }

  function getForecastWeather(lat, lon) {
    const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
    const params = {
      lat: lat,
      lon: lon,
      units: "metric",
      lang: "ru",
      appid: "2e3f0a4de66d0bcd26974266f439e301"
    };

    for (let param in params) {
      url.searchParams.set(param, params[param])
    }

    fetch(url.toString())
      .then(data => data.json())
      .then(forecastWeather => {
        renderForecastWeather(forecastWeather)
      })
  }

  function renderForecastWeather({list}) {

    for (let i = 1; i <= 5; i++) {
      document.querySelector(`section.day${i} .hourly-today-hour`).innerHTML = '<th class="today"></th>';
      document.querySelector(`section.day${i} .hourly-today-icon`).innerHTML = '<th></th>';
      document.querySelector(`section.day${i} .hourly-today-description`).innerHTML = '<th>Прогноз</th>';
      document.querySelector(`section.day${i} .hourly-today-temp`).innerHTML = '<th>Температура (&deg;C)</th>';
      document.querySelector(`section.day${i} .hourly-today-feel`).innerHTML = '<th>Ощущается</th>';
      document.querySelector(`section.day${i} .hourly-today-wind`).innerHTML = '<th>Ветер (м/с)</th>';
      document.querySelector(`section.day${i} .hourly-today-degrees`).innerHTML = '<th>Направление</th>';
      document.querySelector(`section.day${i} .hourly-today-wind_gust`).innerHTML = '<th>Порывы (м/с)</th>';
      document.querySelector(`section.day${i} .hourly-today-humidity`).innerHTML = '<th>Влажность</th>';
      document.querySelector(`section.day${i} .hourly-today-pressure`).innerHTML = '<th>Давление (mmHg)</th>';
      document.querySelector(`section.day${i} .hourly-today-visibility`).innerHTML = '<th>Видимость (км)</th>';
    }

    /*let trunc = (t) => Math.trunc(t / 1000);
    const endToday = day.setHours(23, 0, 0);
    let start = [] ;
    let end = [];
    for(let i =0; i < 5; i++){
      let value =  i === 0 ? endToday : start[i - 1] * 1000 ;
      start[i] = trunc(value + 10800000);
      end[i] = trunc(value + 86400000);
    }

    for (let i = 0; i < list.length; i++) {
      if (list[i]['dt'] >= start[i] && list[i]['dt'] <= end[i]) {
        for (let j = 1; j <= 5; j++) {
          document.querySelector(`section.day${j} .hourly-today-hour`).innerHTML += `<td>${timestampConversation(list[i]['dt'])}</td>`;
          document.querySelector(`section.day${j} .hourly-today-icon`).innerHTML += `<td><img src='https://openweathermap.org/img/wn/${list[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
          document.querySelector(`section.day${j} .hourly-today-description`).innerHTML += `<td>${list[i]['weather'][0]['description']}</td>`;
          document.querySelector(`section.day${j} .hourly-today-temp`).innerHTML += `<td>${Math.round(list[i]['main']['temp'])}&deg;</td>`;
          document.querySelector(`section.day${j} .hourly-today-feel`).innerHTML += `<td>${Math.round(list[i]['main']['feels_like'])}&deg;</td>`;
          document.querySelector(`section.day${j} .hourly-today-wind`).innerHTML += `<td>${Math.round(list[i]['wind']['speed'])}</td>`;
          document.querySelector(`section.day${j} .hourly-today-degrees`).innerHTML += `<td>${windDeg(list[i]['wind']['deg'])}</td>`;
          document.querySelector(`section.day${j} .hourly-today-wind_gust`).innerHTML += `<td>${list[i]['wind']['gust']}</td>`;
          document.querySelector(`section.day${j} .hourly-today-humidity`).innerHTML += `<td>${list[i]['main']['humidity']}%</td>`;
          document.querySelector(`section.day${j} .hourly-today-pressure`).innerHTML += `<td>${Math.floor((list[i]['main']['pressure'] * 0.75006156) * 100) / 100}</td>`;
          document.querySelector(`section.day${j} .hourly-today-visibility`).innerHTML += `<td>${list[i]['visibility'] / 1000}</td>`;
        }
      }
    }
  }*/

    let trunc = (t) => Math.trunc(t / 1000);
    const endToday = day.setHours(23, 0, 0);
    const startDay1 = trunc(endToday + 10800000);
    const endDay1 = trunc(endToday + 86400000);
    const startDay2 = trunc((endDay1 * 1000) + 10800000);
    const endDay2 = trunc((endDay1 * 1000) + 86400000);
    const startDay3 = trunc((endDay2 * 1000) + 10800000);
    const endDay3 = trunc((endDay2 * 1000) + 86400000);
    const startDay4 = trunc((endDay3 * 1000) + 10800000);
    const endDay4 = trunc((endDay3 * 1000) + 86400000);
    const startDay5 = trunc((endDay4 * 1000) + 10800000);
    const endDay5 = trunc((endDay4 * 1000) + 86400000);

    //todo: fix and refactor
    for (let i = 0; i < list.length; i++) {
      if (list[i]['dt'] >= startDay1 && list[i]['dt'] <= endDay1) {
        document.querySelector(`section.day1 .hourly-today-hour`).innerHTML += `<td>${timestampConversation(list[i]['dt'])}</td>`;
        document.querySelector(`section.day1 .hourly-today-icon`).innerHTML += `<td><img src='https://openweathermap.org/img/wn/${list[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
        document.querySelector(`section.day1 .hourly-today-description`).innerHTML += `<td>${list[i]['weather'][0]['description']}</td>`;
        document.querySelector(`section.day1 .hourly-today-temp`).innerHTML += `<td>${Math.round(list[i]['main']['temp'])}&deg;</td>`;
        document.querySelector(`section.day1 .hourly-today-feel`).innerHTML += `<td>${Math.round(list[i]['main']['feels_like'])}&deg;</td>`;
        document.querySelector(`section.day1 .hourly-today-wind`).innerHTML += `<td>${Math.round(list[i]['wind']['speed'])}</td>`;
        document.querySelector(`section.day1 .hourly-today-degrees`).innerHTML += `<td>${windDeg(list[i]['wind']['deg'])}</td>`;
        document.querySelector(`section.day1 .hourly-today-wind_gust`).innerHTML += `<td>${list[i]['wind']['gust']}</td>`;
        document.querySelector(`section.day1 .hourly-today-humidity`).innerHTML += `<td>${list[i]['main']['humidity']}%</td>`;
        document.querySelector(`section.day1 .hourly-today-pressure`).innerHTML += `<td>${Math.floor((list[i]['main']['pressure'] * 0.75006156) * 100) / 100}</td>`;
        document.querySelector(`section.day1 .hourly-today-visibility`).innerHTML += `<td>${list[i]['visibility'] / 1000}</td>`;
      } else if (list[i]['dt'] >= startDay2 && list[i]['dt'] <= endDay2) {
        document.querySelector(`section.day2 .hourly-today-hour`).innerHTML += `<td>${timestampConversation(list[i]['dt'])}</td>`;
        document.querySelector(`section.day2 .hourly-today-icon`).innerHTML += `<td><img src='https://openweathermap.org/img/wn/${list[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
        document.querySelector(`section.day2 .hourly-today-description`).innerHTML += `<td>${list[i]['weather'][0]['description']}</td>`;
        document.querySelector(`section.day2 .hourly-today-temp`).innerHTML += `<td>${Math.round(list[i]['main']['temp'])}&deg;</td>`;
        document.querySelector(`section.day2 .hourly-today-feel`).innerHTML += `<td>${Math.round(list[i]['main']['feels_like'])}&deg;</td>`;
        document.querySelector(`section.day2 .hourly-today-wind`).innerHTML += `<td>${Math.round(list[i]['wind']['speed'])}</td>`;
        document.querySelector(`section.day2 .hourly-today-degrees`).innerHTML += `<td>${windDeg(list[i]['wind']['deg'])}</td>`;
        document.querySelector(`section.day2 .hourly-today-wind_gust`).innerHTML += `<td>${list[i]['wind']['gust']}</td>`;
        document.querySelector(`section.day2 .hourly-today-humidity`).innerHTML += `<td>${list[i]['main']['humidity']}%</td>`;
        document.querySelector(`section.day2 .hourly-today-pressure`).innerHTML += `<td>${Math.floor((list[i]['main']['pressure'] * 0.75006156) * 100) / 100}</td>`;
        document.querySelector(`section.day2 .hourly-today-visibility`).innerHTML += `<td>${list[i]['visibility'] / 1000}</td>`;
      } else if (list[i]['dt'] >= startDay3 && list[i]['dt'] <= endDay3) {
        document.querySelector(`section.day3 .hourly-today-hour`).innerHTML += `<td>${timestampConversation(list[i]['dt'])}</td>`;
        document.querySelector(`section.day3 .hourly-today-icon`).innerHTML += `<td><img src='https://openweathermap.org/img/wn/${list[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
        document.querySelector(`section.day3 .hourly-today-description`).innerHTML += `<td>${list[i]['weather'][0]['description']}</td>`;
        document.querySelector(`section.day3 .hourly-today-temp`).innerHTML += `<td>${Math.round(list[i]['main']['temp'])}&deg;</td>`;
        document.querySelector(`section.day3 .hourly-today-feel`).innerHTML += `<td>${Math.round(list[i]['main']['feels_like'])}&deg;</td>`;
        document.querySelector(`section.day3 .hourly-today-wind`).innerHTML += `<td>${Math.round(list[i]['wind']['speed'])}</td>`;
        document.querySelector(`section.day3 .hourly-today-degrees`).innerHTML += `<td>${windDeg(list[i]['wind']['deg'])}</td>`;
        document.querySelector(`section.day3 .hourly-today-wind_gust`).innerHTML += `<td>${list[i]['wind']['gust']}</td>`;
        document.querySelector(`section.day3 .hourly-today-humidity`).innerHTML += `<td>${list[i]['main']['humidity']}%</td>`;
        document.querySelector(`section.day3 .hourly-today-pressure`).innerHTML += `<td>${Math.floor((list[i]['main']['pressure'] * 0.75006156) * 100) / 100}</td>`;
        document.querySelector(`section.day3 .hourly-today-visibility`).innerHTML += `<td>${list[i]['visibility'] / 1000}</td>`;
      } else if (list[i]['dt'] >= startDay4 && list[i]['dt'] <= endDay4) {
        document.querySelector(`section.day4 .hourly-today-hour`).innerHTML += `<td>${timestampConversation(list[i]['dt'])}</td>`;
        document.querySelector(`section.day4 .hourly-today-icon`).innerHTML += `<td><img src='https://openweathermap.org/img/wn/${list[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
        document.querySelector(`section.day4 .hourly-today-description`).innerHTML += `<td>${list[i]['weather'][0]['description']}</td>`;
        document.querySelector(`section.day4 .hourly-today-temp`).innerHTML += `<td>${Math.round(list[i]['main']['temp'])}&deg;</td>`;
        document.querySelector(`section.day4 .hourly-today-feel`).innerHTML += `<td>${Math.round(list[i]['main']['feels_like'])}&deg;</td>`;
        document.querySelector(`section.day4 .hourly-today-wind`).innerHTML += `<td>${Math.round(list[i]['wind']['speed'])}</td>`;
        document.querySelector(`section.day4 .hourly-today-degrees`).innerHTML += `<td>${windDeg(list[i]['wind']['deg'])}</td>`;
        document.querySelector(`section.day4 .hourly-today-wind_gust`).innerHTML += `<td>${list[i]['wind']['gust']}</td>`;
        document.querySelector(`section.day4 .hourly-today-humidity`).innerHTML += `<td>${list[i]['main']['humidity']}%</td>`;
        document.querySelector(`section.day4 .hourly-today-pressure`).innerHTML += `<td>${Math.floor((list[i]['main']['pressure'] * 0.75006156) * 100) / 100}</td>`;
        document.querySelector(`section.day4 .hourly-today-visibility`).innerHTML += `<td>${list[i]['visibility'] / 1000}</td>`;
      } else if (list[i]['dt'] >= startDay5 && list[i]['dt'] <= endDay5) {
        document.querySelector(`section.day5 .hourly-today-hour`).innerHTML += `<td>${timestampConversation(list[i]['dt'])}</td>`;
        document.querySelector(`section.day5 .hourly-today-icon`).innerHTML += `<td><img src='https://openweathermap.org/img/wn/${list[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
        document.querySelector(`section.day5 .hourly-today-description`).innerHTML += `<td>${list[i]['weather'][0]['description']}</td>`;
        document.querySelector(`section.day5 .hourly-today-temp`).innerHTML += `<td>${Math.round(list[i]['main']['temp'])}&deg;</td>`;
        document.querySelector(`section.day5 .hourly-today-feel`).innerHTML += `<td>${Math.round(list[i]['main']['feels_like'])}&deg;</td>`;
        document.querySelector(`section.day5 .hourly-today-wind`).innerHTML += `<td>${Math.round(list[i]['wind']['speed'])}</td>`;
        document.querySelector(`section.day5 .hourly-today-degrees`).innerHTML += `<td>${windDeg(list[i]['wind']['deg'])}</td>`;
        document.querySelector(`section.day5 .hourly-today-wind_gust`).innerHTML += `<td>${list[i]['wind']['gust']}</td>`;
        document.querySelector(`section.day5 .hourly-today-humidity`).innerHTML += `<td>${list[i]['main']['humidity']}%</td>`;
        document.querySelector(`section.day5 .hourly-today-pressure`).innerHTML += `<td>${Math.floor((list[i]['main']['pressure'] * 0.75006156) * 100) / 100}</td>`;
        document.querySelector(`section.day5 .hourly-today-visibility`).innerHTML += `<td>${list[i]['visibility'] / 1000}</td>`;
      }

    }
  }

  function getOneCallAPI(lat, lon) {
    const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
    const params = {
      lat: lat,
      lon: lon,
      units: "metric",
      lang: "ru",
      appid: "2e3f0a4de66d0bcd26974266f439e301"
    };

    for (let param in params) {
      url.searchParams.set(param, params[param])
    }

    fetch(url.toString())
      .then(data => data.json())
      .then(oneCall => {
        renderOneCallAPI(oneCall)
      })
  }

  function renderOneCallAPI({daily, hourly}) {

    document.querySelector('.hourly .hourly-today-hour').innerHTML = '<th class="today"></th>';
    document.querySelector('.hourly .hourly-today-icon').innerHTML = '<th></th>';
    document.querySelector('.hourly .hourly-today-description').innerHTML = '<th>Прогноз</th>';
    document.querySelector('.hourly .hourly-today-temp').innerHTML = '<th>Температура (&deg;C)</th>';
    document.querySelector('.hourly .hourly-today-feel').innerHTML = '<th>Ощущается</th>';
    document.querySelector('.hourly .hourly-today-wind').innerHTML = '<th>Ветер (м/с)</th>';
    document.querySelector('.hourly .hourly-today-degrees').innerHTML = '<th>Направление</th>';
    document.querySelector('.hourly .hourly-today-wind_gust').innerHTML = '<th>Порывы (м/с)</th>';
    document.querySelector('.hourly .hourly-today-dew_point').innerHTML = '<th>Точка росы (&deg;C)</th>';
    document.querySelector('.hourly .hourly-today-humidity').innerHTML = '<th>Влажность</th>';
    document.querySelector('.hourly .hourly-today-pressure').innerHTML = '<th>Давление (mmHg)</th>';
    document.querySelector('.hourly .hourly-today-visibility').innerHTML = '<th>Видимость (км)</th>';

    let a = day.setHours(23, 0, 0);
    let b = a + 25200000;
    let c = Math.trunc(b / 1000)

    for (let i = 0; i < hourly.length; i++) {
      document.querySelector('.hourly .hourly-today-hour').innerHTML += `<td>${timestampConversation(hourly[i]['dt'])}</td>`;
      document.querySelector('.hourly .hourly-today-icon').innerHTML += `<td><img src='https://openweathermap.org/img/wn/${hourly[i]['weather'][0]['icon']}@2x.png' alt="icon"/></td>`;
      document.querySelector('.hourly .hourly-today-description').innerHTML += `<td>${hourly[i]['weather'][0]['description']}</td>`;
      document.querySelector('.hourly .hourly-today-temp').innerHTML += `<td>${Math.round(hourly[i]['temp'])}&deg;</td>`;
      document.querySelector('.hourly .hourly-today-feel').innerHTML += `<td>${Math.round(hourly[i]['feels_like'])}&deg;</td>`;
      document.querySelector('.hourly .hourly-today-wind').innerHTML += `<td>${Math.round(hourly[i]['wind_speed'])}</td>`;
      document.querySelector('.hourly .hourly-today-degrees').innerHTML += `<td>${windDeg(hourly[i]['wind_deg'])}</td>`;
      document.querySelector('.hourly .hourly-today-wind_gust').innerHTML += `<td>${hourly[i]['wind_gust']}</td>`;
      document.querySelector('.hourly .hourly-today-dew_point').innerHTML += `<td>${hourly[i]['dew_point']}&deg;</td>`;
      document.querySelector('.hourly .hourly-today-humidity').innerHTML += `<td>${hourly[i]['humidity']}%</td>`;
      document.querySelector('.hourly .hourly-today-pressure').innerHTML += `<td>${Math.floor((hourly[i]['pressure'] * 0.75006156) * 100) / 100}</td>`;
      document.querySelector('.hourly .hourly-today-visibility').innerHTML += `<td>${hourly[i]['visibility'] / 1000}</td>`;
      if (hourly[i]['dt'] === c) break
    }

    for (let i = 1; i <= 5; i++) {
      let todayMM = getDay((daily[i]['dt']) * 1000).getMonth();
      let todayDD = getDay((daily[i]['dt']) * 1000).getDate();

      document.querySelector(`li.day${i} h3`).innerHTML = `${dayRu[getDay(daily[i]['dt'] * 1000).getDay()]}`;
      document.querySelector(`li.day${i} .forecast-day-date`).innerHTML = `${monthsRus[todayMM]} ${todayDD}`;
      document.querySelector(`li.day${i} .forecast-day-icon`).innerHTML = `<img src='https://openweathermap.org/img/wn/${daily[i]['weather']['0']['icon']}@2x.png' alt="icon"/>`;
      document.querySelector(`li.day${i} .forecast-day-temperature`).innerHTML = `${Math.floor(daily[i]['temp']['max'])}&deg;C`;
      document.querySelector(`li.day${i} .forecast-day-description`).innerHTML = `${daily[i]['weather'][0]['description']}`
    }
  }
});