import React, { useState } from 'react';
import axios from 'axios';

function getDayOfWeek(unixTimestamp) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to milliseconds
  const dayOfWeek = daysOfWeek[date.getDay()];
  return dayOfWeek;
}


function WeatherApp() {

  // Status states 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //API Params
  const [city, setCity] = useState('');
  const [unit, setUnit] = useState('');
  const [amountDays, setAmountDays] = useState(5);
  const [forecast, setForecast] = useState(null);


  const API_KEY = process.env.REACT_APP_API_KEY;

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const apiUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');

      apiUrl.searchParams.append('q', city);
      apiUrl.searchParams.append('appid', API_KEY);
      apiUrl.searchParams.append('units', unit);

      // Results are every 3 hours, multiply days by 8 for all results at current time.
      apiUrl.searchParams.append('cnt', amountDays * 8);

      const response = await axios.get(apiUrl.toString());
      setForecast(response.data);

    } catch (error) {
      setErrorMessage(`${error.response.statusText}: ${error.message}`);
      if (!city) setErrorMessage("Please enter a valid city.")
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWeatherInfo = () => {

    if (!forecast) {
      return null;
    }

    const unitSymbol = unit === 'metric' ? 'C' : (unit === 'imperial' ? 'F' : 'K');

    // Mapping over every 8th item in the list as days are broken down into 3 hours
    const filteredForecast = forecast.list.filter((item, index) => index % 8 === 0);

    return (
      <div>
        <h2>Weather Forecast for {forecast.city.name}, {forecast.city.country}</h2>
        <div className="forecast-list">

        </div>
        <div className="flex center flex-wrap justify-center">
          {filteredForecast.map((item, index) => {
            var icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png`;
            return (
              <div className="forecast-item card w-96 glass shadow m-3 hover:scale-105 transition-all" key={index}>

                <figure><img src={icon} alt={item.weather[0].description} /></figure>
                <div className="card-body">
                  <h2 className="card-title">{getDayOfWeek(item.dt)}</h2>
                  <p>Date and time: <b>{item.dt_txt}</b></p>
                  <p>Temperature: <b>{item.main.temp}</b>°{unitSymbol}</p>
                  <p>Feels-like: <b>{item.main.feels_like}</b>°{unitSymbol}</p>
                  <p>Pressure: <b>{item.main.pressure}</b>hPa</p>
                  <p>Weather: <b>{item.weather[0].description}</b></p>
                  <p>Wind speed: <b>{item.wind.speed}</b> m/s</p>
                  <p>Humidity: <b>{item.wind.speed}</b>%</p>

                </div>
              </div>

            )
          })}

        </div>
      </div>
    );
  };

  return (
    <div className='p-4 m-4'>

      <h1>Weather Forecast</h1>

      {/* Inputs */}
      <div className='md:flex flex-row justify-between mb-3 sm:flex-column'>
        <div>
          <label className="label">
            <span className="label-text">City</span>
          </label>
          <input
            className='input input-bordered w-full max-w-lg'
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Temperature unit</span>
          </label>

          <select
            className="select select-bordered w-full max-w-sm"

            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="">Kelvin</option>
            <option value="metric">Celsius (°C)</option>
            <option value="imperial">Fahrenheit (°F)</option>
          </select>
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Number of days</span>
            <span className="label-text-alt"> Max: 5 days</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-sm max-w-xs"
            min="1"
            max="5"
            value={amountDays}
            onChange={(e) => setAmountDays(e.target.value)}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-error mb-3 ">
          <svg
            onClick={() => setErrorMessage('')}
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6 cursor-pointer"
            fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>
            <b>An error occurred whilst fetching the weather data.</b> <br />
            {errorMessage}
          </span>
        </div>

      )
      }

      <button className='btn btn-primary mb-3' disabled={loading} onClick={fetchWeatherData}>Get Forecast</button>

      {
        loading && (
          <div className='flex flex-col items-center'>
            <span className="loading loading-dots loading-lg "></span>
            <div className='flex center flex-wrap justify-center'>
              {Array.from({ length: amountDays }).map((_, index) => (
                <div key={index} className="forecast-item card w-80 h-96 m-3 glass skeleton-loader"></div>
              ))}
            </div>
          </div>
        )
      }

      {
        forecast && (
          <div>
            {renderWeatherInfo()}
          </div>
        )
      }
    </div >
  );
}

export default WeatherApp;
