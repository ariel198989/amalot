<floatui_setup>
  <instructions>
    <title>How to Use Float UI Components in Your Project</title>
    <description>Integrate modern Float UI components styled with Tailwind CSS into your project.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Tailwind CSS</description>
        <action>
          <command>npm install -D tailwindcss postcss autoprefixer</command>
        </action>
        <details>
          <item>Follow the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/installation).</item>
          <item>Initialize Tailwind configuration:</item>
          <command>npx tailwindcss init</command>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Configure Tailwind CSS</description>
        <action>
          <code>
            // tailwind.config.js
            module.exports = {
              content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
              theme: {
                extend: {},
              },
              plugins: [],
            };
          </code>
        </action>
        <details>
          <item>Set the `content` field to include the paths to your files.</item>
          <item>This ensures Tailwind can purge unused styles in production.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Browse and Select Float UI Components</description>
        <details>
          <item>Visit the [Float UI Components Library](https://floatui.com/components).</item>
          <item>Choose the desired component and copy its HTML and Tailwind CSS code.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Paste Component Code</description>
        <action>
          <code>
            &lt;div class="bg-white shadow-lg rounded-lg p-4"&gt;
              &lt;h2 class="text-xl font-bold"&gt;Sample Component&lt;/h2&gt;
              &lt;p class="text-gray-600"&gt;This is an example component.&lt;/p&gt;
            &lt;/div&gt;
          </code>
        </action>
        <details>
          <item>Insert the copied code into your desired HTML or React component file.</item>
          <item>Ensure your file structure matches the paths defined in `tailwind.config.js`.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Customize the Component</description>
        <details>
          <item>Modify Tailwind classes to adjust styles according to your needs.</item>
          <item>Add interactivity or animations using JavaScript or libraries like Framer Motion if required.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Start the Development Server</description>
        <action>
          <command>npm run dev</command>
        </action>
        <details>
          <item>Launches your development server to preview the component in action.</item>
        </details>
      </step>
    </steps>
  </instructions>
  
  <execution>
    <prompt>Execute these steps to integrate Float UI components into your project. For more details, visit the [Float UI Documentation](https://floatui.com/docs).</prompt>
  </execution>
</floatui_setup>
