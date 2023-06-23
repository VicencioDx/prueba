const fs = require('fs');
const express = require('express');
const Kafka = require('node-rdkafka');
const axios = require('axios');

function readConfigFile(fileName) {
  const data = fs.readFileSync(fileName, 'utf8').toString().split('\n');
  return data.reduce((config, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      config[key] = value;
    }
    return config;
  }, {});
}

const app = express();
const producer = new Kafka.Producer(readConfigFile('client.properties'));
producer.connect();

producer.on('ready', () => {
  app.get('/api/tiempo', async (req, res) => {
    try {
      const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
      const city = 'YOUR_CITY_NAME';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
      const response = await axios.get(url);
      const weatherData = response.data;
      const tiempo = weatherData.weather[0].description;
      producer.produce('topic_0', -1, Buffer.from(tiempo));
      res.json({ tiempo });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el tiempo' });
    }
  });

  app.get('/api/hora', async (req, res) => {
    try {
      const response = await axios.get('http://worldtimeapi.org/api/ip');
      const timeData = response.data;
      const hora = timeData.datetime;
      producer.produce('topic_0', -1, Buffer.from(hora));
      res.json({ hora });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la hora' });
    }
  });

  app.get('/api/humedad', async (req, res) => {
    try {
      const apiKey = 'YOUR_WEATHERCOM_API_KEY';
      const city = 'YOUR_CITY_NAME';
      const url = `https://api.weather.com/v3/wx/conditions/current?apiKey=${apiKey}&q=${city}`;
      const response = await axios.get(url);
      const weatherData = response.data;
      const humedad = weatherData.current.humidity;
      producer.produce('topic_0', -1, Buffer.from(humedad.toString()));
      res.json({ humedad });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la humedad' });
    }
  });

  app.listen(3000, () => {
    console.log('Servidor API iniciado en el puerto 3000');
  });
});
