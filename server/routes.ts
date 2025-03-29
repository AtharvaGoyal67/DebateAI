import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  debateTopicSchema, 
  debatePointSchema, 
  rebuttalRequestSchema, 
  counterArgumentRequestSchema,
  insertDebateSchema
} from "@shared/schema";
import fetch from "node-fetch";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Simple in-memory cache for debate responses
const cache = new Map<string, any>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate debate points
  app.post("/api/debate", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = debateTopicSchema.parse(req.body);
      const { topic, language, complexity } = validatedData;
      
      // Create a cache key that includes all parameters
      const cacheKey = `${topic}-${language}-${complexity}`;
      
      // Check cache first
      if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
      }
      
      // Call the Groq API with retry logic
      const debatePoints = await generateDebatePoints(validatedData, 2);
      
      // Cache the response
      cache.set(cacheKey, debatePoints);
      
      // Return the result
      return res.json(debatePoints);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error generating debate points:", error);
      return res.status(500).json({ 
        message: "Failed to generate debate points. Please try again later." 
      });
    }
  });

  // Generate additional rebuttals
  app.post("/api/rebuttals", async (req, res) => {
    try {
      const { topic, side, count } = rebuttalRequestSchema.parse(req.body);
      const rebuttals = await generateRebuttals(topic, side, count || 3, 2);
      return res.json({ rebuttals });
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Generate counter-arguments
  app.post("/api/counter-arguments", async (req, res) => {
    try {
      const { argument, topic, count } = counterArgumentRequestSchema.parse(req.body);
      const counterArguments = await generateCounterArguments(argument, topic, count || 3, 2);
      return res.json({ counterArguments });
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Save a debate
  app.post("/api/debates", async (req, res) => {
    try {
      const debateData = insertDebateSchema.parse(req.body);
      const debate = await storage.createDebate(debateData);
      return res.status(201).json(debate);
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Get all debates (or by user ID if provided)
  app.get("/api/debates", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : null;
      const debates = await storage.getDebatesByUserId(userId);
      return res.json(debates);
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Get a debate by ID
  app.get("/api/debates/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const debate = await storage.getDebate(id);
      
      if (!debate) {
        return res.status(404).json({ message: "Debate not found" });
      }
      
      return res.json(debate);
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Delete a debate
  app.delete("/api/debates/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteDebate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Debate not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Search for debates
  app.get("/api/debates/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const debates = await storage.searchDebates(query);
      return res.json(debates);
    } catch (error) {
      handleApiError(error, res);
    }
  });

  // Create HTTP server with the Express app
  const server = createServer(app);
  return server;
}

function handleApiError(error: any, res: Response) {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({ message: validationError.message });
  }
  
  console.error("API error:", error);
  return res.status(500).json({ 
    message: error?.message || "An unexpected error occurred. Please try again later." 
  });
}

async function generateDebatePoints(requestData: any, retries = 2) {
  const apiKey = process.env.GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const { topic, language = 'english', complexity = 'moderate' } = requestData;
  
  const prompt = `
    Generate comprehensive debate points on the topic: "${topic}"
    
    LANGUAGE: ${language}
    COMPLEXITY: ${complexity}
    
    In your response, provide:
    1. At least 5 compelling points for the proposition side
    2. At least 5 compelling points for the opposition side
    3. At least 3 potential rebuttals for the proposition side
    4. At least 3 potential rebuttals for the opposition side
    5. IMPORTANT: You must include at least 5 pieces of supporting evidence with reliable sources
    
    Return your response as JSON with the following structure:
    {
      "proposition": ["point1", "point2", ...],
      "opposition": ["point1", "point2", ...],
      "propositionRebuttals": ["rebuttal1", "rebuttal2", ...],
      "oppositionRebuttals": ["rebuttal1", "rebuttal2", ...],
      "evidence": [{"point": "...", "sources": ["source1", "source2", ...]}, ...],
      "language": "${language}"
    }
  `;
  
  try {
    // Try to make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are an expert debate coach who provides comprehensive analysis of debate topics with well-structured arguments and rebuttals.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    // Check for rate limit error (HTTP 429)
    if (response.status === 429 && retries > 0) {
      // Parse the error to get the retry time
      const errorText = await response.text();
      console.log("Rate limit error, will retry:", errorText);
      
      // Try to extract retry time from error message
      let retryAfter = 3; // Default retry after 3 seconds
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = errorJson.error?.message || "";
        const retryTimeMatch = errorMsg.match(/try again in ([0-9.]+)s/i);
        if (retryTimeMatch && retryTimeMatch[1]) {
          retryAfter = Math.ceil(parseFloat(retryTimeMatch[1]));
        }
      } catch (e) {
        console.log("Could not parse error response, using default retry delay");
      }
      
      console.log(`Rate limit reached, retrying after ${retryAfter} seconds...`);
      
      // Wait for the specified time
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry with one less retry attempt
      return generateDebatePoints(requestData, retries - 1);
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 429) {
        throw new Error(`API rate limit reached. Please try again in a few seconds.`);
      } else {
        throw new Error(`Groq API error: ${response.status} ${errorData}`);
      }
    }
    
    const data = await response.json() as any;
    
    // Extract the response content and parse the JSON
    const content = data.choices[0].message.content;
    
    try {
      // First try parsing the content directly
      try {
        const jsonContent = JSON.parse(content);
        return debatePointSchema.parse(jsonContent);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          throw new Error("Failed to extract JSON from the API response");
        }
        
        const extractedJson = jsonMatch[0];
        
        // Try to repair common JSON issues (handling unescaped quotes in JSON strings)
        const repairedJson = extractedJson
          .replace(/(['"])((\\\1|.)*?)\1(\s*[:,}\]])/g, (match: string) => match) // Keep properly quoted strings
          .replace(/([a-zA-Z0-9_]+):/g, '"$1":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes
        
        const jsonContent = JSON.parse(repairedJson);
        return debatePointSchema.parse(jsonContent);
      }
    } catch (error) {
      console.error("JSON parsing error:", error);
      console.error("Raw content:", content);
      throw new Error("Failed to parse debate points from AI response");
    }
  } catch (error) {
    console.error("Error calling Groq API:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        throw new Error("API rate limit reached. Please try again in a few seconds.");
      }
    }
    
    throw new Error("Failed to generate debate points from AI service");
  }
}

async function generateRebuttals(topic: string, side: string, count: number, retries = 2) {
  const apiKey = process.env.GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Get the debate to determine the language
  let language = "english";
  
  try {
    // Find a saved debate with this topic to match the language
    const allDebates = await storage.getAllDebates();
    const matchingDebate = allDebates.find(debate => 
      debate.topic.toLowerCase() === topic.toLowerCase()
    );
    
    if (matchingDebate && matchingDebate.language) {
      language = matchingDebate.language;
    }
  } catch (error) {
    console.log("Error finding debate language, defaulting to English:", error);
  }
  
  const prompt = `
    Generate ${count} additional rebuttal points for the "${side}" side of the debate topic: "${topic}".
    
    Make these rebuttals strong, concise, and focused on countering the main arguments of the opposing side.
    
    PROVIDE ALL CONTENT IN THE ${language} LANGUAGE.
    
    Return only the array of rebuttals in JSON format:
    ["rebuttal1", "rebuttal2", ...]
    
    Make sure the output is properly formatted JSON that can be parsed.
  `;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are an expert debate coach specializing in creating effective rebuttals.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    // Check for rate limit error (HTTP 429)
    if (response.status === 429 && retries > 0) {
      // Parse the error to get the retry time
      const errorText = await response.text();
      console.log("Rate limit error, will retry:", errorText);
      
      // Try to extract retry time from error message
      let retryAfter = 3; // Default retry after 3 seconds
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = errorJson.error?.message || "";
        const retryTimeMatch = errorMsg.match(/try again in ([0-9.]+)s/i);
        if (retryTimeMatch && retryTimeMatch[1]) {
          retryAfter = Math.ceil(parseFloat(retryTimeMatch[1]));
        }
      } catch (e) {
        console.log("Could not parse error response, using default retry delay");
      }
      
      console.log(`Rate limit reached, retrying after ${retryAfter} seconds...`);
      
      // Wait for the specified time
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry with one less retry attempt
      return generateRebuttals(topic, side, count, retries - 1);
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 429) {
        throw new Error(`API rate limit reached. Please try again in a few seconds.`);
      } else {
        throw new Error(`Groq API error: ${response.status} ${errorData}`);
      }
    }
    
    const data = await response.json() as any;
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON array from the API response");
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing rebuttal JSON:", error);
      // If parsing fails, return a simplified array with the error message
      return ["Error generating rebuttals, please try again."];
    }
  } catch (error) {
    console.error("Error generating rebuttals:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        throw new Error("API rate limit reached. Please try again in a few seconds.");
      }
    }
    
    throw new Error("Failed to generate rebuttals from AI service");
  }
}

async function generateCounterArguments(argument: string, topic: string | undefined, count: number, retries = 2) {
  const apiKey = process.env.GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const topicContext = topic ? `for the debate topic "${topic}"` : '';
  
  // Get the debate to determine the language
  let language = "english";
  
  if (topic) {
    try {
      // Find a saved debate with this topic to match the language
      const allDebates = await storage.getAllDebates();
      const matchingDebate = allDebates.find(debate => 
        debate.topic.toLowerCase() === topic.toLowerCase()
      );
      
      if (matchingDebate && matchingDebate.language) {
        language = matchingDebate.language;
      }
    } catch (error) {
      console.log("Error finding debate language, defaulting to English:", error);
    }
  }
  
  const prompt = `
    Generate ${count} effective counter-arguments against the following argument ${topicContext}:
    
    "${argument}"
    
    Make these counter-arguments strong, logical, and focused on weaknesses in the original argument.
    
    PROVIDE ALL CONTENT IN THE ${language} LANGUAGE.
    
    Return only the array of counter-arguments in JSON format:
    ["counter1", "counter2", ...]
    
    Make sure the output is properly formatted JSON that can be parsed.
  `;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are an expert debater specializing in identifying weaknesses in arguments and creating effective counter-arguments.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    // Check for rate limit error (HTTP 429)
    if (response.status === 429 && retries > 0) {
      // Parse the error to get the retry time
      const errorText = await response.text();
      console.log("Rate limit error, will retry:", errorText);
      
      // Try to extract retry time from error message
      let retryAfter = 3; // Default retry after 3 seconds
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = errorJson.error?.message || "";
        const retryTimeMatch = errorMsg.match(/try again in ([0-9.]+)s/i);
        if (retryTimeMatch && retryTimeMatch[1]) {
          retryAfter = Math.ceil(parseFloat(retryTimeMatch[1]));
        }
      } catch (e) {
        console.log("Could not parse error response, using default retry delay");
      }
      
      console.log(`Rate limit reached, retrying after ${retryAfter} seconds...`);
      
      // Wait for the specified time
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry with one less retry attempt
      return generateCounterArguments(argument, topic, count, retries - 1);
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 429) {
        throw new Error(`API rate limit reached. Please try again in a few seconds.`);
      } else {
        throw new Error(`Groq API error: ${response.status} ${errorData}`);
      }
    }
    
    const data = await response.json() as any;
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON array from the API response");
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing counter-arguments JSON:", error);
      // If parsing fails, return a simplified array with the error message
      return ["Error generating counter-arguments, please try again."];
    }
  } catch (error) {
    console.error("Error generating counter-arguments:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        throw new Error("API rate limit reached. Please try again in a few seconds.");
      }
    }
    
    throw new Error("Failed to generate counter-arguments from AI service");
  }
}