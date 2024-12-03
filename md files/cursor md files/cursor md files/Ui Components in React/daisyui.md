<daisyui_installation>
  <instructions>
    <title>Integrating daisyUI into Your Tailwind CSS Project</title>
    <description>Enhance your Tailwind CSS project with daisyUI, a plugin that adds component classes and themes for rapid UI development.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Ensure Node.js and Tailwind CSS are Installed</description>
        <details>
          <item>Verify that Node.js is installed on your system. If not, download it from the [official Node.js website](https://nodejs.org/).</item>
          <item>Ensure Tailwind CSS is set up in your project. If not, follow the [Tailwind CSS installation guide](https://tailwindcss.com/docs/installation).</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Install daisyUI via npm</description>
        <action>
          <command>npm install daisyui</command>
        </action>
        <details>
          <item>Installs daisyUI as a dependency in your project.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Add daisyUI to Tailwind Configuration</description>
        <action>
          <code>
            // tailwind.config.js
            module.exports = {
              // ...
              plugins: [require('daisyui')],
            };
          </code>
        </action>
        <details>
          <item>Includes daisyUI as a plugin in your Tailwind CSS configuration.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Utilize daisyUI Components in Your HTML</description>
        <action>
          <code>
            &lt;button class="btn btn-primary"&gt;Button&lt;/button&gt;
          </code>
        </action>
        <details>
          <item>Applies daisyUI's `btn` and `btn-primary` classes to style the button.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate daisyUI into your Tailwind CSS project. For more details, refer to the [daisyUI Installation Guide](https://daisyui.com/docs/install/).</prompt>
  </execution>
</daisyui_installation>
