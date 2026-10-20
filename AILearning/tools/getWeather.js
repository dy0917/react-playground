const weatherConditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

async function getWeather(city) {
    const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodingUrl.search = new URLSearchParams({
        name: city,
        count: "1",
        language: "en",
        format: "json",
    });

    const geocodingResponse = await fetch(geocodingUrl);
    if (!geocodingResponse.ok) {
        throw new Error(`City lookup failed: ${geocodingResponse.status}`);
    }

    const geocoding = await geocodingResponse.json();
    const location = geocoding.results?.[0];
    if (!location) {
        throw new Error(`No matching city found for "${city}".`);
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        timezone: "auto",
    });

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
        throw new Error(`Weather lookup failed: ${weatherResponse.status}`);
    }

    const weather = await weatherResponse.json();
    return {
        city: location.name,
        country: location.country,
        current: {
            ...weather.current,
            condition: weatherConditions[weather.current.weather_code] ?? "Unknown",
        },
        units: weather.current_units,
    };
}

export default getWeather;