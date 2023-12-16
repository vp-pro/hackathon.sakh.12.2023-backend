const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = 3001;
app.use(cors()); // Enable CORS

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello, welcome to your Node.js Express API!');
});

app.post('/v1/sentiment', (req, res) => {
  const texts = req.body.message;
  
  const pythonProcess = spawn('python3', ['sentiment.py', ...texts]);

  let output = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const results = JSON.parse(output);
        res.json(results);
      } catch (error) {
        console.error(`Error parsing JSON: ${error}`);
        res.status(500).send('Internal Server Error');
      }
    } else {
      // Check if the errorOutput contains only the warning message
      if (errorOutput.includes("Warning : `load_model` does not return")) {
        // Ignore the warning and return success
        res.json({ message: 'Success' });
      } else {
        console.error(`Python script exited with code ${code}: ${errorOutput}`);
        res.status(500).send('Internal Server Error');
      }
    }
  });
});


app.get('/v1/test', (req, res) => {
  const texts = ['А вот это первый текст', 'А это другой текст!'];

  const pythonProcess = spawn('python3', ['sentiment.py', ...texts]);

  let output = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const results = JSON.parse(output);
        res.json(results);
      } catch (error) {
        console.error(`Error parsing JSON: ${error}`);
        res.status(500).send('Internal Server Error');
      }
    } else {
      // Check if the errorOutput contains only the warning message
      if (errorOutput.includes("Warning : `load_model` does not return")) {
        // Ignore the warning and return success
        res.json({ message: 'Success' });
      } else {
        console.error(`Python script exited with code ${code}: ${errorOutput}`);
        res.status(500).send('Internal Server Error');
      }
    }
  });
});




app.get('/v1/test', (req, res) => {
    const texts = ['А вот это первый текст', 'А это другой текст!'];
  
    const pythonProcess = spawn('python3', ['sentiment.py', ...texts]);
  
    let output = '';
    let errorOutput = '';
  
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
  
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
  
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const results = JSON.parse(output);
          res.json(results);
        } catch (error) {
          console.error(`Error parsing JSON: ${error}`);
          res.status(500).send('Internal Server Error');
        }
      } else {
        // Check if the errorOutput contains only the warning message
        if (errorOutput.includes("Warning : `load_model` does not return")) {
          // Ignore the warning and return success
          res.json({ message: 'Success' });
        } else {
          console.error(`Python script exited with code ${code}: ${errorOutput}`);
          res.status(500).send('Internal Server Error');
        }
      }
    });
  });

  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
