<groq_docs>
  <title>Creating Chat Completions with Groq API</title>
  <description>Integrate Groq's API to create intelligent and dynamic chat completions using a range of supported models.</description>
  <code_snippet>
Node.js:

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Ensure your API key is securely stored in an environment variable.

async function main() {
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192", // Specify the model ID from the supported models.
    messages: [
      { role: "user", content: "Explain the importance of fast language models" },
    ],
    max_tokens: 500, // Adjust the maximum number of tokens in the completion.
    temperature: 0.7, // Set the level of randomness in the response.
    top_p: 0.9, // Use nucleus sampling to filter tokens by probability mass.
    presence_penalty: 0.5, // Encourage the model to talk about new topics.
    frequency_penalty: 0.2, // Reduce the chance of token repetition.
  });

  console.log(completion.choices[0].message.content);
}

main();

// Ensure you have your GROQ API key in the .env file
// Example: GROQ_API_KEY=your_api_key_here
  </code_snippet>

  <models>
    <title>Available Groq Models</title>
    <model>
      <name>llama3-8b-8192</name>
      <details>
        <item>Developer: Meta</item>
        <item>Context Window: 8,192 tokens</item>
        <item>Description: Optimized for tool use and efficient text processing.</item>
      </details>
    </model>
    <model>
      <name>llama-3.1-70b-versatile</name>
      <details>
        <item>Developer: Meta</item>
        <item>Context Window: 128,000 tokens</item>
        <item>Max Tokens: 32,768 tokens</item>
        <item>Description: Designed for large-scale, versatile text generation.</item>
      </details>
    </model>
    <model>
      <name>llama-3.2-1b-preview</name>
      <details>
        <item>Developer: Meta</item>
        <item>Context Window: 128,000 tokens</item>
        <item>Max Tokens: 8,192 tokens</item>
        <item>Description: Lightweight model for rapid response tasks.</item>
      </details>
    </model>
  </models>

  <usage_notes>
    <note>Use the `presence_penalty` and `frequency_penalty` parameters to control the creativity and repetitiveness of the responses.</note>
    <note>Explore the [Groq API Documentation](https://api.groq.com/docs) for additional parameters like `stream` for incremental responses.</note>
    <note>Refer to the supported model cards for optimal usage scenarios and limitations.</note>
  </usage_notes>
</groq_docs>
