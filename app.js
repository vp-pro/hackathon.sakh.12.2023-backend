// Подключаем необходимые модули и скрипты
const { functional_sentiment, emotional_sentiment, language_detection } = require('./api');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const cors = require('cors');

// Создаем экземпляр приложения Express
const app = express();
const port = 3001;

// Включаем поддержку CORS
app.use(cors());

// Используем парсер JSON для обработки запросов с телом в формате JSON
app.use(bodyParser.json());

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
  res.send('Hello, welcome to your Node.js Express API!');
});

// Обработчик для маршрута /v1/sentiment
app.post('/v1/sentiment', (req, res) => {
  const texts = req.body.messages;

  // Детекция языка
  const pythonLanguageDetection = spawn('python3', [language_detection, ...texts]);
  let languageOutput = '';
  let errorOutput = '';

  pythonLanguageDetection.stdout.on('data', (data) => {
    languageOutput += data.toString();
  });

  pythonLanguageDetection.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonLanguageDetection.on('close', (code) => {
    if (code !== 0) {
      console.error(`Language Detection Python script exited with code ${code}: ${errorOutput}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    try {
      const languageResults = JSON.parse(languageOutput);

      // Функциональный и эмоциональный анализ настроений
      const pythonFunctional = spawn('python3', [functional_sentiment, ...texts]);
      const pythonEmotional = spawn('python3', [emotional_sentiment, ...texts]);

      let functionalOutput = '';
      let emotionalOutput = '';
      let errorOutput = '';

      pythonFunctional.stdout.on('data', (data) => {
        functionalOutput += data.toString();
      });

      pythonFunctional.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonFunctional.on('close', (functionalCode) => {
        if (functionalCode !== 0) {
          console.error(`Functional Python script exited with code ${functionalCode}: ${errorOutput}`);
          res.status(500).send('Internal Server Error');
          return;
        }

        pythonEmotional.stdout.on('data', (data) => {
          emotionalOutput += data.toString();
        });

        pythonEmotional.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        pythonEmotional.on('close', (emotionalCode) => {
          if (emotionalCode !== 0) {
            console.error(`Emotional Python script exited with code ${emotionalCode}: ${errorOutput}`);
            res.status(500).send('Internal Server Error');
            return;
          }

          const functionalResults = JSON.parse(functionalOutput);
          const emotionalResults = JSON.parse(emotionalOutput);

          const combinedResults = functionalResults.map((functional, index) => ({
            message: texts[index],
            functional_sentiment: functional,
            emotional_sentiment: emotionalResults[index],
            detected_language: languageResults[index], // Включаем обнаруженный язык
          }));

          res.json(combinedResults);
        });
      });
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Обработчик для маршрута /v1/functional_sentiment
app.post('/v1/functional_sentiment', (req, res) => {
  const texts = req.body.messages;

  // Функциональный анализ настроений
  const pythonFunctional = spawn('python3', [functional_sentiment, ...texts]);
  let functionalOutput = '';
  let errorOutput = '';

  pythonFunctional.stdout.on('data', (data) => {
    functionalOutput += data.toString();
  });

  pythonFunctional.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonFunctional.on('close', (code) => {
    if (code !== 0) {
      console.error(`Functional Python script exited with code ${code}: ${errorOutput}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    try {
      const functionalResults = JSON.parse(functionalOutput);
      const combinedResults = functionalResults.map((functional, index) => ({
        message: texts[index],
        functional_sentiment: functional,
      }));
      res.json(combinedResults);
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Обработчик для маршрута /v1/emotional_sentiment
app.post('/v1/emotional_sentiment', (req, res) => {
  const texts = req.body.messages;

  // Эмоциональный анализ настроений
  const pythonEmotional = spawn('python3', [emotional_sentiment, ...texts]);
  let emotionalOutput = '';
  let errorOutput = '';

  pythonEmotional.stdout.on('data', (data) => {
    emotionalOutput += data.toString();
  });

  pythonEmotional.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonEmotional.on('close', (code) => {
    if (code !== 0) {
      console.error(`Emotional Python script exited with code ${code}: ${errorOutput}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    try {
      const emotionalResults = JSON.parse(emotionalOutput);
      const combinedResults = emotionalResults.map((emotional, index) => ({
        message: texts[index],
        emotional_sentiment: emotional,
      }));
      res.json(combinedResults);
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Обработчик для маршрута /v1/language_detection
app.post('/v1/language_detection', (req, res) => {
  const texts = req.body.messages;

  // Детекция языка
  const pythonLanguageDetection = spawn('python3', [language_detection, ...texts]);
  let languageOutput = '';
  let errorOutput = '';

  pythonLanguageDetection.stdout.on('data', (data) => {
    languageOutput += data.toString();
  });

  pythonLanguageDetection.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonLanguageDetection.on('close', (code) => {
    if (code !== 0) {
      console.error(`Language Detection Python script exited with code ${code}: ${errorOutput}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    try {
      const languageResults = JSON.parse(languageOutput);
      const combinedResults = languageResults.map((language, index) => ({
        message: texts[index],
        detected_language: language,
      }));
      res.json(combinedResults);
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Запускаем сервер на указанном порту
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
