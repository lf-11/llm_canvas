const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Configuration object for LLM servers
const llmConfig = {
  local: {
    baseUrl: 'http://localhost:8000',
    modelPath: "/home/lukas/projects/LLM_testing/webui/text-generation-webui-main/models/Llama-3.3-70B-Instruct-Q4_K_S.gguf",
    chatTemplate: {
      stop: ["<|eot_id|>", "<|begin_of_text|>"]  // Add appropriate stop tokens
    },
    host: 'localhost'
  },
  remote: {
    baseUrl: 'http://192.168.178.61:8000',
    modelPath: "/home/lukas/projects/LLM_testing/webui/text-generation-webui-main/models/Llama-3.3-70B-Instruct-Q4_K_S.gguf",
    chatTemplate: {
      stop: ["<|eot_id|>", "<|begin_of_text|>"]  // Add appropriate stop tokens
    },
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
      max_tokens: 4096,
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
    
    const MAX_CONTEXT_LENGTH = 4096;
    // Rough estimate: reserve ~500 tokens for input messages
    const MAX_COMPLETION_TOKENS = 2500;
    
    const vllmRequestBody = {
      model: config.modelPath,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content || ''
      })),
      stream: true,
      temperature: parameters.temperature || 0.0,
      top_p: parameters.topP || 0.7,
      top_k: parameters.topK || 50,
      max_tokens: MAX_COMPLETION_TOKENS,
      stop: ["<|eot_id|>", "<|begin_of_text|>"]
    };

    console.log('Sending to vLLM:', vllmRequestBody);

    try {
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
      // Get the actual error message from vLLM
      if (error.response && error.response.data) {
        // If the data is a readable stream, read it
        if (typeof error.response.data.pipe === 'function') {
          let rawData = '';
          error.response.data.on('data', chunk => {
            rawData += chunk;
          });
          error.response.data.on('end', () => {
            console.error('vLLM Error:', JSON.parse(rawData));
            res.status(500).json({ error: JSON.parse(rawData) });
          });
        } else {
          // If it's already parsed
          console.error('vLLM Error:', error.response.data);
          res.status(500).json({ error: error.response.data });
        }
      } else {
        console.error('Error details:', error.message);
        res.status(500).json({ error: error.message });
      }
    }
  } catch (outerError) {
    console.error('Outer error:', outerError);
    res.status(500).json({ error: outerError.message });
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
      const MAX_COMPLETION_TOKENS = 2500;
      
      const vllmRequestBody = {
        model: config.modelPath,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content || ''
        })),
        stream: true,
        temperature: parameters.temperature || 0.0,
        top_p: parameters.topP || 0.7,
        top_k: parameters.topK || 50,
        max_tokens: MAX_COMPLETION_TOKENS,
        stop: ["<|eot_id|>", "<|begin_of_text|>"]
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

// Add these endpoints after your existing endpoints
app.get('/system-prompts', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, prompt_text FROM system_prompts ORDER BY usage_count DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    res.status(500).json({ error: 'Failed to fetch system prompts' });
  }
});

app.post('/system-prompts/increment-usage', async (req, res) => {
  const { promptId } = req.body;
  try {
    await pool.query('UPDATE system_prompts SET usage_count = usage_count + 1 WHERE id = $1', [promptId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    res.status(500).json({ error: 'Failed to update usage count' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});