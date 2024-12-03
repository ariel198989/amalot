<fal_docs>
  <title>Fal AI: Text-to-Image Generation API</title>
  <description>Learn how to generate images from text using the Fal API and explore advanced features like queue management, streaming, and webhooks.</description>
  <code_snippet>
Node.js:

import { fal } from "@fal-ai/client";

fal.config({
  credentials: "PASTE_YOUR_FAL_KEY_HERE", // Add your API key here
});

async function generateImage() {
  const result = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt: "a photo of a cute puppy in the style of Pixar animation",
      image_size: "square_hd", // Options: landscape_4_3, square_hd, etc.
    },
    logs: true,
    pollInterval: 5000, // Check queue status every 5 seconds
    onQueueUpdate(update) {
      console.log("Queue update:", update);
    },
  });

  console.log("Generated Image URL:", result.images[0].url);
}

generateImage();

// Make sure your API key is securely stored in an environment variable
// Example: FAL_KEY="your-api-key"
  </code_snippet>

  <models>
    <title>Fal Image Generation Models</title>
    <model>
      <name>fal-ai/flux/dev</name>
      <details>
        <item>12 billion parameter flow transformer</item>
        <item>High-quality images from text</item>
        <item>Personal and commercial use</item>
      </details>
    </model>
    <model>
      <name>fal-ai/recraft-v3</name>
      <details>
        <item>Generates long texts, vector art, brand styles</item>
        <item>State-of-the-art (SOTA) image generation</item>
        <item>Top performer in Hugging Face benchmarks</item>
      </details>
    </model>
    <model>
      <name>fal-ai/stable-diffusion-v35-large</name>
      <details>
        <item>Multimodal Diffusion Transformer (MMDiT)</item>
        <item>Improved performance, typography, and prompt understanding</item>
        <item>Optimized for resource efficiency</item>
      </details>
    </model>
  </models>

  <features>
    <feature>
      <title>Queue Management</title>
      <details>
        <item>Submit requests to the queue and track progress with request IDs.</item>
        <item>Cancel or check the status of queued requests.</item>
        <item>Use webhooks to get asynchronous updates.</item>
      </details>
    </feature>
    <feature>
      <title>Streaming</title>
      <details>
        <item>Receive partial updates as events while images are being processed.</item>
        <item>Stream output for real-time inference tasks.</item>
      </details>
    </feature>
    <feature>
      <title>Webhooks</title>
      <details>
        <item>Enable notifications for completed requests via custom URLs.</item>
        <item>Receive payloads with generated images or error details.</item>
      </details>
    </feature>
  </features>

  <usage_notes>
    <note>Optimize API usage by adjusting the `pollInterval` for queue updates.</note>
    <note>Use the `fal.queue.result()` method to retrieve completed requests.</note>
    <note>Keep your API key secure by using environment variables.</note>
  </usage_notes>

  <resources>
    <link url="https://fal.ai/docs">Fal AI API Documentation</link>
    <link url="https://fal.ai/models">Explore Available Models</link>
    <link url="https://github.com/fal-ai">Fal GitHub Repository</link>
  </resources>
</fal_docs>
<fal_docs>
  <title>Fal AI: Comprehensive Text-to-Image Generation Models</title>
  <description>Explore all available text-to-image generation models offered by Fal AI, optimized for various use cases, from photorealism to vector art creation.</description>
  <models>
    <model>
      <name>fal-ai/flux/schnell</name>
      <type>text-to-image</type>
      <details>
        <item>12 billion parameter flow transformer</item>
        <item>High-quality images from text in 1-4 steps</item>
        <item>Optimized for speed</item>
        <item>Suitable for personal and commercial use</item>
      </details>
    </model>
    <model>
      <name>fal-ai/flux-pro/v1.1-ultra</name>
      <type>text-to-image</type>
      <details>
        <item>FLUX1.1 [pro] ultra version</item>
        <item>Supports up to 2K resolution</item>
        <item>Enhanced photorealism</item>
        <item>Improved composition and artistic fidelity</item>
      </details>
    </model>
    <model>
      <name>fal-ai/recraft-v3</name>
      <type>text-to-image</type>
      <details>
        <item>Generates long texts, vector art, and brand styles</item>
        <item>State-of-the-art (SOTA) in image generation</item>
        <item>Top performer in Hugging Face benchmarks</item>
      </details>
    </model>
    <model>
      <name>fal-ai/flux/dev</name>
      <type>text-to-image</type>
      <details>
        <item>12 billion parameter flow transformer</item>
        <item>High-quality images from text</item>
        <item>Suitable for personal and commercial use</item>
      </details>
    </model>
    <model>
      <name>fal-ai/flux-subject</name>
      <type>text-to-image</type>
      <details>
        <item>Super-fast with subject input capabilities</item>
        <item>Personalization, styles, and brand identity generation</item>
      </details>
    </model>
    <model>
      <name>fal-ai/flux-pro/v1.1</name>
      <type>text-to-image</type>
      <details>
        <item>Enhanced version of FLUX1.1</item>
        <item>Improved artistic fidelity and detail</item>
        <item>Better composition quality</item>
      </details>
    </model>
    <model>
      <name>fal-ai/omnigen-v1</name>
      <type>text-to-image</type>
      <details>
        <item>Multi-modal prompts</item>
        <item>Supports tasks like image editing, virtual try-on, and multi-person generation</item>
        <item>Wide range of image generation capabilities</item>
      </details>
    </model>
    <model>
      <name>fal-ai/stable-diffusion-v35-large</name>
      <type>text-to-image</type>
      <details>
        <item>Multimodal Diffusion Transformer (MMDiT)</item>
        <item>Improved image quality and typography</item>
        <item>Efficient performance</item>
      </details>
    </model>
    <model>
      <name>fal-ai/stable-diffusion-v35-medium</name>
      <type>text-to-image</type>
      <details>
        <item>Medium-size Multimodal Diffusion Transformer</item>
        <item>Improved performance and resource efficiency</item>
      </details>
    </model>
    <model>
      <name>fal-ai/flux-realism</name>
      <type>text-to-image</type>
      <details>
        <item>LoRA adaptation for hyper-realistic images</item>
        <item>Exceptional detail, lighting, and textures</item>
        <item>Optimized for true-to-life photographic quality</item>
      </details>
    </model>
    <model>
      <name>fal-ai/flux-general</name>
      <type>text-to-image</type>
      <details>
        <item>Supports AI extensions like LoRA and ControlNet</item>
        <item>Comprehensive control over image generation</item>
        <item>Versatile use cases</item>
      </details>
    </model>
  </models>
  <usage_notes>
    <note>Choose the appropriate model based on your specific requirements such as speed, photorealism, or stylized output.</note>
    <note>Use the queue management system to handle long-running requests effectively.</note>
    <note>Enable webhooks for asynchronous processing and result notifications.</note>
  </usage_notes>
  <resources>
    <link url="https://fal.ai/models">Explore All Models</link>
    <link url="https://fal.ai/docs">API Documentation</link>
    <link url="https://github.com/fal-ai">Fal GitHub Repository</link>
  </resources>
</fal_docs>
