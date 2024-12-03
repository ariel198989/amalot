<anthropic_docs>
Node.js:

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Make sure to store your API key in an environment variable.
});

const completion = await client.completions.create({
  model: "claude-3-5-sonnet-20241022", // Specify the Claude model to use.
  prompt: "Hello, Claude!",
  max_tokens_to_sample: 100, // Adjust the token limit as needed.
});

console.log(completion.completion);

// Ensure you have your Anthropic API key in the .env file
// Example: ANTHROPIC_API_KEY=your_api_key_here

---

Claude Models:

Claude 3.5 Haiku  
**Our fastest model**  
- **Text input**  
- **Text output**  
- **200k context window**

Claude 3.5 Sonnet  
**Our most intelligent model**  
- **Text and image input**  
- **Text output**  
- **200k context window**

---

Model Names and API Usage:

| Model            | Anthropic API                          | AWS Bedrock                                     | GCP Vertex AI                  |
|-------------------|----------------------------------------|------------------------------------------------|---------------------------------|
| Claude 3.5 Sonnet | claude-3-5-sonnet-20241022 (claude-3-5-sonnet-latest) | anthropic.claude-3-5-sonnet-20241022-v2:0     | claude-3-5-sonnet-v2@20241022  |
| Claude 3.5 Haiku  | claude-3-5-haiku-20241022 (claude-3-5-haiku-latest)  | anthropic.claude-3-5-haiku-20241022-v1:0      | claude-3-5-haiku@20241022      |
</anthropic_docs>
