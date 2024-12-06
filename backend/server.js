const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Configuration object for LLM servers
const llmConfig = {
  local: {
    baseUrl: 'http://localhost:8000',
    modelPath: "/home/lukas/projects/LLM_testing/webui/text-generation-webui-main/models/Mistral-Small-Instruct-2409-Q6_K_L.gguf",
    host: 'localhost'
  },
  remote: {
    baseUrl: 'http://192.168.178.61:8000',
    modelPath: "/home/lukas/projects/LLM_testing/webui/text-generation-webui-main/models/Mistral-Small-Instruct-2409-Q6_K_L.gguf",
    host: '192.168.178.61'
  }
};

// Current server configuration (default to local)
let currentServer = 'local';

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Database configuration based on server type
const dbConfig = {
  local: {
    user: 'postgres',
    host: 'localhost',
    database: 'LLM_Canvas',
    password: 'postgres',
    port: 5432,
  },
  remote: {
    user: 'postgres',
    host: '192.168.178.61',  // Same as your Ubuntu machine's IP
    database: 'LLM_Canvas',
    password: 'postgres',
    port: 5432,
  }
};

// Create pool with initial configuration
let pool = new Pool(dbConfig.local);

// Update pool when server changes
app.post('/switch-server', (req, res) => {
  const { server } = req.body;
  if (server && llmConfig[server]) {
    currentServer = server;
    // Update database pool with new configuration
    pool.end();  // Close existing connections
    pool = new Pool(dbConfig[server]);
    res.json({ success: true, currentServer: server });
  } else {
    res.status(400).json({ error: 'Invalid server selection' });
  }
});

// Add endpoint to get current server
app.get('/current-server', (req, res) => {
  res.json({ currentServer, config: llmConfig[currentServer] });
});

// Completions endpoint (for simple text completion)
app.post('/completions', async (req, res) => {
  try {
    const { prompt, n = 1, stream = false } = req.body;
    const config = llmConfig[currentServer];

    const response = await axios.post(`${config.baseUrl}/v1/completions`, {
      prompt: prompt,
      max_tokens: 16384,
      n: n,
      stream: stream
    });

    // Store in database
    await pool.query(
      'INSERT INTO llm_calls (model_name, input_prompt, output) VALUES ($1, $2, $3)',
      [response.data.model, prompt, JSON.stringify(response.data.choices)]
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Chat completions endpoint (for chat-style interactions)
app.post('/chat', async (req, res) => {
  try {
    const { messages, ...parameters } = req.body;
    const config = llmConfig[currentServer];
    
    // Extract system prompt and user input from messages
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const userPrompt = messages.find(m => m.role === 'user')?.content || '';

    // Log the chat call to database at the start
    const dbLogPromise = pool.query(
      'INSERT INTO llm_calls (model_name, system_prompt, input_prompt, parameters, output) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        config.modelPath,
        systemPrompt,
        userPrompt,
        JSON.stringify(parameters),
        '[]' // Empty output initially, could be updated later if needed
      ]
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const vllmRequestBody = {
      model: config.modelPath,
      messages: messages,
      stream: true,
      temperature: parameters.temperature || 0.7,
      top_p: parameters.topP || 0.7,
      top_k: parameters.topK || 50,
      max_tokens: 16384
    };

    console.log('Sending to vLLM:', vllmRequestBody);

    const response = await axios.post(`${config.baseUrl}/v1/chat/completions`, vllmRequestBody, {
      responseType: 'stream'
    });

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          if (line.includes('[DONE]')) {
            return;
          }
          
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta.content) {
              res.write(`data: ${JSON.stringify({ text: data.choices[0].delta.content })}\n\n`);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    });

    response.data.on('end', () => {
      res.end();
    });

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    res.status(500).send(`Error: ${error.message}`);
  }
});

// Batch chat endpoint
app.post('/chat/batch', async (req, res) => {
  const { messages, batchCount, ...parameters } = req.body;
  const config = llmConfig[currentServer];
  
  // Extract user input from messages
  const userPrompt = messages.find(m => m.role === 'user')?.content || '';

  // Log the initial batch call to database
  const dbLogPromise = pool.query(
    'INSERT INTO llm_batch_calls (model_name, input_prompt, outputs, parameters) VALUES ($1, $2, $3, $4) RETURNING id',
    [
      config.modelPath,
      JSON.stringify(userPrompt),
      '[]', // Empty outputs initially
      JSON.stringify(parameters)
    ]
  );

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Collect all outputs
    const batchOutputs = Array(batchCount).fill('');
    const promises = Array(batchCount).fill().map(async (_, index) => {
      const vllmRequestBody = {
        model: config.modelPath,
        messages: messages,
        stream: true,
        temperature: parameters.temperature || 0.7,
        top_p: parameters.topP || 0.7,
        top_k: parameters.topK || 50,
        max_tokens: 16384
      };

      const response = await axios.post(`${config.baseUrl}/v1/chat/completions`, vllmRequestBody, {
        responseType: 'stream'
      });

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            if (line.includes('[DONE]')) continue;
            
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                batchOutputs[index] += content; // Accumulate the content
                res.write(`data: ${JSON.stringify({ 
                  index, 
                  text: content
                })}\n\n`);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      });

      return new Promise((resolve) => {
        response.data.on('end', () => {
          resolve();
        });
      });
    });

    // Wait for all streams to complete
    await Promise.all(promises);

    // Update database with all completed outputs
    const dbLog = await dbLogPromise;
    await pool.query(
      'UPDATE llm_batch_calls SET outputs = $1 WHERE id = $2',
      [JSON.stringify(batchOutputs), dbLog.rows[0].id]
    );

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Batch processing error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});