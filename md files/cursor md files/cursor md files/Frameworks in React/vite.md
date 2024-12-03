<vite_setup>
  <instructions>
    <title>How to Set Up a Basic Vite App</title>
    <description>Initialize a new Vite project for fast and modern web development.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Create a New Vite Project</description>
        <action>
          <command>npm create vite@latest my-vite-app</command>
        </action>
        <details>
          <item>Runs the Vite CLI to scaffold a new project.</item>
          <item>Replace `my-vite-app` with your desired project name.</item>
          <item>Follow the prompts to select your framework (e.g., React, Vue, Svelte).</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Navigate to Your Project Directory</description>
        <action>
          <command>cd my-vite-app</command>
        </action>
      </step>
      <step>
        <number>3</number>
        <description>Install Dependencies</description>
        <action>
          <command>npm install</command>
        </action>
        <details>
          <item>Installs all required dependencies specified in the `package.json` file.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Start the Development Server</description>
        <action>
          <command>npm run dev</command>
        </action>
        <details>
          <item>Launches the development server.</item>
          <item>By default, the application will be accessible at [http://localhost:5173](http://localhost:5173).</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Build for Production</description>
        <action>
          <command>npm run build</command>
        </action>
        <details>
          <item>Bundles the application for production deployment.</item>
          <item>Outputs the production-ready files to the `dist` directory.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Preview the Production Build</description>
        <action>
          <command>npm run preview</command>
        </action>
        <details>
          <item>Serves the production build locally for testing.</item>
          <item>By default, it runs at [http://localhost:4173](http://localhost:4173).</item>
        </details>
      </step>
    </steps>
  </instructions>
  
  <execution>
    <prompt>Execute these steps to set up a Vite application. For more details, refer to the [official Vite documentation](https://vitejs.dev/guide/).</prompt>
  </execution>
</vite_setup>
