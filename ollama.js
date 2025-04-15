import ollama from 'ollama';

class Ollama {
  async chat(prompt) {
    return await ollama.chat({
      model: 'llama3.2:latest',
      messages: [{ role: 'user', content: prompt }],
    }); 
  }
}

export default (new Ollama());