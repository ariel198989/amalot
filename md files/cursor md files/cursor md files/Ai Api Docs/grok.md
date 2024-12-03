<grok_docs>
  <title>Integrating Grok API for Chat Completions</title>
  <description>Use Grok's cutting-edge models to generate intelligent chat responses, process visuals, and handle various text-based tasks with ease.</description>
  <code_snippet>
Node.js:

import axios from "axios";

const API_KEY = process.env.XAI_API_KEY; // Ensure your API key is securely stored in an environment variable.

async function createCompletion() {
  const response = await axios.post(
    "https://api.x.ai/v1/chat/completions",
    {
      model: "grok-beta", // Choose between "grok-beta" and "grok-vision-beta" based on your task.
      messages: [
        { role: "system", content: "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy." },
        { role: "user", content: "What is the answer to life and universe?" },
      ],
      temperature: 0,
      stream: false,
    },
    {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log(response.data.choices[0].message.content);
}

createCompletion();

// Ensure you have your xAI API key in the .env file
// Example: XAI_API_KEY=your_api_key_here
  </code_snippet>

  <models>
    <title>Available Grok Models</title>
    <model>
      <name>grok-beta</name>
      <details>
        <item>Capabilities: Text and code processing</item>
        <item>Efficiency: Improved speed and capabilities compared to previous versions</item>
        <item>Usage: Ideal for text generation, summarization, and function calling</item>
      </details>
    </model>
    <model>
      <name>grok-vision-beta</name>
      <details>
        <item>Capabilities: Advanced image understanding</item>
        <item>Processes: Visual information, including documents, charts, and photographs</item>
        <item>Usage: Ideal for tasks involving image analysis and visual data extraction</item>
      </details>
    </model>
  </models>

  <usage_notes>
    <note>Use the `temperature` parameter to adjust randomness in responses. A value of 0 makes the output deterministic, while higher values increase variability.</note>
    <note>Explore Grok's ability to call external functions using the `tool_choice` and `tools` parameters for enriched interactions.</note>
    <note>Monitor token usage from the `usage` field in responses to manage API costs effectively.</note>
  </usage_notes>

  <resources>
    <link url="https://api.x.ai/docs">Grok API Documentation</link>
    <link url="https://console.x.ai">xAI Console</link>
  </resources>
</grok_docs>
