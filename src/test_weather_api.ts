// Durham, NC
const latitude = 35.994034;
const longitude = -78.898621;

const getWeatherApi = async () => {
  const URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`;
  console.log(URL);
  const response = await fetch(URL);
  const data: any = await response.json();
  console.log(data);
}

getWeatherApi();


// https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m

// https://api.open-meteo.com/v1/forecast?latitude=35.994034&longitude=-78.898621&current=temperature_2m&temperature_unit=fahrenheit