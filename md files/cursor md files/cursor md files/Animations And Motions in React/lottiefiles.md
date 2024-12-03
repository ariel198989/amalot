<dotLottie_integration>
  <instructions>
    <title>Integrating Lottie Animations with dotLottie-react in React</title>
    <description>
      A step-by-step guide to integrate Lottie animations into your React application using the dotLottie-react component.
    </description>
    <steps>
      <step>
        <number>1</number>
        <description>Install the dotLottie-react Package</description>
        <action>
          <command>npm install @lottiefiles/dotlottie-react</command>
        </action>
        <details>
          <item>Installs the dotLottie-react package as a dependency in your React project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Use the DotLottieReact Component</description>
        <action>
          <code>
            import React from 'react';
            import { DotLottieReact } from '@lottiefiles/dotlottie-react';

            const App = () => {
              return (
                &lt;DotLottieReact
                  src="path/to/animation.lottie"
                  loop
                  autoplay
                /&gt;
              );
            };

            export default App;
          </code>
        </action>
        <details>
          <item>Replace "path/to/animation.lottie" with the path to your .lottie animation file.</item>
          <item>The `loop` prop ensures the animation repeats continuously.</item>
          <item>The `autoplay` prop starts the animation automatically.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Run the Application</description>
        <action>
          <command>npm start</command>
        </action>
        <details>
          <item>Starts the development server and allows you to preview the integrated animation in your React app.</item>
        </details>
      </step>
    </steps>
  </instructions>
  <execution>
    <prompt>
      Use this XML guide to integrate and render Lottie animations seamlessly in your React project.
    </prompt>
  </execution>
</dotLottie_integration>
