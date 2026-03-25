const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

/* ROOT + HEALTH ROUTES */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Weather API is running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'weather-app',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* WEATHER ROUTES */
app.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.API_KEY,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Weather fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.get('/forecast', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: process.env.API_KEY,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Forecast fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
