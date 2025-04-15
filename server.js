import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ollama from './ollama.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/llama', async (req, res) => {
  const emotionsText = req.body.emotions.join(', ');
  try {
    const response = await ollama.chat(`Give me exactly 10 words corresponding with the following emotions: ${emotionsText}. Format: json array of words only. Language: German`);

    res.json({words: JSON.parse(response.message.content)});
  } catch (error) {
    res.status(500).send({ error: 'There was an error executing ollama prompt' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});