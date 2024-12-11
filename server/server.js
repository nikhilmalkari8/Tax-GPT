const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

  app.post('/api/ask', async (req, res) => {
    const { query } = req.body;  // Modified query passed from the frontend
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant with knowledge of taxes.' },
          { role: 'user', content: query },  // Use the dynamic query received from the frontend
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
  
      res.json({ answer: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      res.status(500).send('Error fetching response from OpenAI');
    }
  });
  

// Route to handle file uploads
app.post('/api/upload', upload.single('taxFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded.' });
  }
  res.json({ message: 'File uploaded successfully', file: req.file });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
