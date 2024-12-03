<tailwind_css_installation>
  <instructions>
    <title>Installing Tailwind CSS in Your Project</title>
    <description>Integrate Tailwind CSS into your project to utilize its utility-first approach for rapid UI development.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Tailwind CSS via npm</description>
        <action>
          <command>npm install -D tailwindcss</command>
        </action>
        <details>
          <item>Installs Tailwind CSS as a development dependency.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Initialize Tailwind Configuration</description>
        <action>
          <command>npx tailwindcss init</command>
        </action>
        <details>
          <item>Generates a `tailwind.config.js` file in your project's root directory.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Configure Template Paths</description>
        <action>
          <code>
            /** @type {import('tailwindcss').Config} */
            module.exports = {
              content: ["./src/**/*.{html,js}"],
              theme: {
                extend: {},
              },
              plugins: [],
            };
          </code>
        </action>
        <details>
          <item>Specifies the paths to all template files in your project.</item>
          <item>Ensures Tailwind purges unused styles in production builds.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Add Tailwind Directives to Your CSS</description>
        <action>
          <code>
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
          </code>
        </action>
        <details>
          <item>Include these directives in your main CSS file to inject Tailwind's base, components, and utilities styles.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Build Your CSS</description>
        <action>
          <command>npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch</command>
        </action>
        <details>
          <item>Processes your CSS with Tailwind and outputs it to the specified file.</item>
          <item>The `--watch` flag rebuilds the CSS on file changes.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Include the Compiled CSS in Your HTML</description>
        <action>
          <code>
            &lt;link href="/dist/output.css" rel="stylesheet"&gt;
          </code>
        </action>
        <details>
          <item>Add this line within the `<head>` section of your HTML file to apply Tailwind's styles.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to set up Tailwind CSS in your project. For more detailed information, refer to the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/installation).</prompt>
  </execution>
</tailwind_css_installation>
