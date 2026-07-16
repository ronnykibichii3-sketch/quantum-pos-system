const forecastService = require('../services/forecastService');

exports.generateForecast = async (req, res) => {
  try {
    const forecast = await forecastService.generateForecast(req.body);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getForecasts = async (req, res) => {
  try {
    const forecasts = await forecastService.getForecasts();
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getForecastById = async (req, res) => {
  try {
    const forecast = await forecastService.getForecastById(req.params.id);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};