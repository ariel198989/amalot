<perplexity_api>
  <title>Integrating Perplexity API for Chat Completions</title>
  <description>Enhance your application with Perplexity's powerful chat completion API for generating precise and contextual model responses.</description>
  <code_snippet>
Node.js:

const options = {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <YOUR_API_KEY>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: "llama-3.1-sonar-small-128k-online",
    messages: [
      { role: "system", content: "Be precise and concise." },
      { role: "user", content: "How many stars are there in our galaxy?" }
    ],
    max_tokens: 100,
    temperature: 0.2,
    top_p: 0.9,
    search_domain_filter: ["perplexity.ai"],
    return_images: false,
    return_related_questions: false,
    search_recency_filter: "month",
    top_k: 0,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
  }),
};

fetch('https://api.perplexity.ai/chat/completions', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));

// Ensure your API key is stored securely in an environment variable.
// Example: PERPLEXITY_API_KEY=your_api_key_here
  </code_snippet>

  <models>
    <title>Supported Perplexity Models</title>
    <model>
      <name>llama-3.1-sonar-small-128k-online</name>
      <details>
        <item>Parameter Count: 8B</item>
        <item>Context Length: 127,072</item>
        <item>Model Type: Chat Completion</item>
      </details>
    </model>
    <model>
      <name>llama-3.1-sonar-large-128k-online</name>
      <details>
        <item>Parameter Count: 70B</item>
        <item>Context Length: 127,072</item>
        <item>Model Type: Chat Completion</item>
      </details>
    </model>
    <model>
      <name>llama-3.1-sonar-huge-128k-online</name>
      <details>
        <item>Parameter Count: 405B</item>
        <item>Context Length: 127,072</item>
        <item>Model Type: Chat Completion</item>
      </details>
    </model>
  </models>

  <usage_notes>
    <note>System prompts can be used to set the style, tone, and language of responses.</note>
    <note>API key must be included in the Authorization header as Bearer <YOUR_API_KEY>.</note>
  </usage_notes>

  <resources>
    <link url="https://api.perplexity.ai/docs">Perplexity API Documentation</link>
    <link url="https://api.perplexity.ai/models">Supported Models Documentation</link>
  </resources>
</perplexity_api>
