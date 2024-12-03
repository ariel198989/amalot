<aceternity_ui_integration>
  <instructions>
    <title>Integrating Aceternity UI Components into Your Next.js Project</title>
    <description>Enhance your Next.js application with Aceternity UI's beautiful Tailwind CSS and Framer Motion components.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Initialize Aceternity UI in Your Project</description>
        <action>
          <command>npx aceternity-ui@latest init</command>
        </action>
        <details>
          <item>Creates a `components.json` and `tailwind.config.js` file for your project.</item>
          <item>Installs necessary dependencies, including `framer-motion` and `clsx`.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Add a Specific Component</description>
        <action>
          <command>npx aceternity-ui@latest add [component]</command>
        </action>
        <details>
          <item>Replace `[component]` with the desired component's name.</item>
          <item>For example, to add the Bento Grid component:</item>
          <sublist>
            <item><command>npx aceternity-ui@latest add bento-grid</command></item>
          </sublist>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Add All Available Components</description>
        <action>
          <command>npx aceternity-ui@latest add --all</command>
        </action>
        <details>
          <item>Installs all components provided by Aceternity UI into your project.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Add Component with Example</description>
        <action>
          <command>npx aceternity-ui@latest add [component] -e</command>
        </action>
        <details>
          <item>Includes a demo or example for the specified component.</item>
          <item>For instance, to add the Bento Grid component with an example:</item>
          <sublist>
            <item><command>npx aceternity-ui@latest add bento-grid -e</command></item>
          </sublist>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>List All Available Components</description>
        <action>
          <command>npx aceternity-ui@latest add</command>
        </action>
        <details>
          <item>Displays a list of all components and their aliases available for installation.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate and utilize Aceternity UI components in your Next.js application. For more details, refer to the [Aceternity UI Documentation](https://ui.aceternity.com/).</prompt>
  </execution>
</aceternity_ui_integration>
