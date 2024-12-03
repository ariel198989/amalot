<nextjs_shadcn_setup>
  <instructions>
    <title>How to Set Up a Basic Next.js ShadCN App in a frontend Folder</title>
    <description>Create a New Next.js ShadCN Project in a Folder Named frontend</description>
    <steps>
      <step>
        <number>1</number>
        <description>Create a New Next.js Project</description>
        <action>
          <command>\npx create-next-app@latest frontend</command>
        </action>
        <details>
          <item>Create a new directory named frontend.</item>
          <item>Install the latest version of Next.js and its dependencies.</item>
          <item>Set up a basic project structure with some initial files in the frontend directory.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Navigate to Your Project Directory</description>
        <action>
          <command>cd frontend</command>
        </action>
      </step>
      <step>
        <number>3</number>
        <description>Install ShadCN CLI</description>
        <action>
          <command>npm install -D @shadcn/ui</command>
        </action>
      </step>
      <step>
        <number>4</number>
        <description>Initialize ShadCN</description>
        <action>
          <command>npx shadcn@latest init</command>
        </action>
      </step>
      <step>
        <number>5</number>
        <description>Configure components.json</description>
        <configuration>
          <question>Which style would you like to use?</question>
          <answer>New York</answer>
          <question>Which color would you like to use as base color?</question>
          <answer>Zinc</answer>
          <question>Do you want to use CSS variables for colors?</question>
          <answer>yes</answer>
        </configuration>
      </step>
      <step>
        <number>6</number>
        <description>Add Button Component</description>
        <action>
          <command>npx shadcn@latest add button</command>
        </action>
      </step>
      <step>
        <number>7</number>
        <description>Start the Development Server</description>
        <action>
          <command>npm run dev</command>
        </action>
      </step>
    </steps>
  </instructions>
  
  <execution>
    <prompt>Execute this please, use a MODULAR APPROACH with codeblocks I Run Please:</prompt>
  </execution>
</nextjs_shadcn_setup>
