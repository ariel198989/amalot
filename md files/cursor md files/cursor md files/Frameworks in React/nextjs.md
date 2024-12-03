<nextjs_installation>
  <instructions>
    <title>Installing Next.js in Your Project</title>
    <description>Set up Next.js, a React framework for building fast and user-friendly web applications.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Ensure Node.js is Installed</description>
        <details>
          <item>Verify that Node.js version 18.18 or later is installed on your system.</item>
          <item>Check the installed version by running:</item>
          <sublist>
            <item><command>node -v</command></item>
          </sublist>
          <item>If not installed, download it from the [official Node.js website](https://nodejs.org/en/download).</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Create a New Next.js Project</description>
        <action>
          <command>npx create-next-app@latest my-next-app</command>
        </action>
        <details>
          <item>Replace `my-next-app` with your desired project name.</item>
          <item>This command initializes a new Next.js project with the latest version.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Navigate to Your Project Directory</description>
        <action>
          <command>cd my-next-app</command>
        </action>
        <details>
          <item>Change into the newly created project directory.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Start the Development Server</description>
        <action>
          <command>npm run dev</command>
        </action>
        <details>
          <item>Launches the Next.js development server.</item>
          <item>By default, the application runs at [http://localhost:3000](http://localhost:3000).</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to set up Next.js in your project. For more detailed information, refer to the [official Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).</prompt>
  </execution>
</nextjs_installation>
