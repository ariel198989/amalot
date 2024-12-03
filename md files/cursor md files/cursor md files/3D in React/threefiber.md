<react_three_fiber_setup>
  <instructions>
    <title>Setting Up a Basic React Three Fiber Application</title>
    <description>Create a new React application and integrate React Three Fiber to render 3D graphics.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Initialize a New React Project</description>
        <action>
          <command>npx create-react-app my-r3f-app</command>
        </action>
        <details>
          <item>Creates a new directory named `my-r3f-app`.</item>
          <item>Sets up a new React project with the latest configurations.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Navigate to the Project Directory</description>
        <action>
          <command>cd my-r3f-app</command>
        </action>
      </step>
      <step>
        <number>3</number>
        <description>Install React Three Fiber and Three.js</description>
        <action>
          <command>npm install @react-three/fiber three</command>
        </action>
        <details>
          <item>Installs React Three Fiber, a React renderer for Three.js.</item>
          <item>Installs Three.js, a JavaScript library for 3D graphics.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Set Up the Canvas Component</description>
        <action>
          <code>
            import React from 'react';
            import ReactDOM from 'react-dom';
            import { Canvas } from '@react-three/fiber';

            function App() {
              return (
                &lt;Canvas&gt;
                  {/* 3D content goes here */}
                &lt;/Canvas&gt;
              );
            }

            ReactDOM.render(&lt;App /&gt;, document.getElementById('root'));
          </code>
        </action>
        <details>
          <item>Imports the `Canvas` component from React Three Fiber.</item>
          <item>Wraps your 3D content in the `Canvas` component for rendering.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Add a 3D Object</description>
        <action>
          <code>
            import React from 'react';
            import ReactDOM from 'react-dom';
            import { Canvas } from '@react-three/fiber';

            function Box() {
              return (
                &lt;mesh&gt;
                  &lt;boxGeometry args={[1, 1, 1]} /&gt;
                  &lt;meshStandardMaterial color="orange" /&gt;
                &lt;/mesh&gt;
              );
            }

            function App() {
              return (
                &lt;Canvas&gt;
                  &lt;ambientLight /&gt;
                  &lt;Box /&gt;
                &lt;/Canvas&gt;
              );
            }

            ReactDOM.render(&lt;App /&gt;, document.getElementById('root'));
          </code>
        </action>
        <details>
          <item>Defines a simple box component using `mesh`, `boxGeometry`, and `meshStandardMaterial`.</item>
          <item>Adds the box to the scene inside the `Canvas`.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Start the Development Server</description>
        <action>
          <command>npm start</command>
        </action>
        <details>
          <item>Launches the development server and opens your application in the default browser.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate React Three Fiber into your React project. For more details, refer to the [React Three Fiber Documentation](https://r3f.docs.pmnd.rs/getting-started/introduction).</prompt>
  </execution>
</react_three_fiber_setup>
