<rive_react_integration>
  <instructions>
    <title>How to Use Rive Animations in React with State Machines</title>
    <description>Integrate Rive .riv files and control animations using state machines in a React application.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Rive for React</description>
        <action>
          <command>npm install @rive-app/react-canvas</command>
        </action>
        <details>
          <item>Install the Rive React package for using Rive animations in your application.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Load the Rive Component</description>
        <action>
          <code>
            import { Rive } from '@rive-app/react-canvas';
          </code>
        </action>
        <details>
          <item>Import the Rive component to use in your React components.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Load a .riv File with a State Machine</description>
        <action>
          <code>
            const riveParams = {
              src: 'path-to-animation-file.riv',
              stateMachines: 'StateMachineName',
              autoplay: true,
            };
          </code>
        </action>
        <details>
          <item>Specify the path to your .riv file and the state machine name.</item>
          <item>Enable autoplay for automatic playback.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Render the Animation</description>
        <action>
          <code>
            const MyAnimation = () => (
              &lt;Rive {...riveParams} style={{ width: '500px', height: '500px' }} /&gt;
            );
          </code>
        </action>
        <details>
          <item>Use the Rive component to render the animation in your React component.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Control State Machine Inputs</description>
        <action>
          <code>
            import { useRive } from '@rive-app/react-canvas';

            const MyInteractiveAnimation = () => {
              const { rive, RiveComponent } = useRive({
                src: 'path-to-animation-file.riv',
                stateMachines: 'StateMachineName',
                autoplay: true,
              });

              const triggerEvent = () => {
                if (rive) {
                  rive.sendInput('InputName', true);
                }
              };

              return (
                &lt;div&gt;
                  &lt;RiveComponent /&gt;
                  &lt;button onClick={triggerEvent}&gt;Trigger Animation&lt;/button&gt;
                &lt;/div&gt;
              );
            };
          </code>
        </action>
        <details>
          <item>Use `useRive` hook to control state machine inputs like triggers or boolean values.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Customize Layout and Styling</description>
        <details>
          <item>Use inline styles or external CSS to customize the layout of your Rive animations.</item>
          <item>Example: Set width and height for the animation container.</item>
        </details>
      </step>
    </steps>
  </instructions>
  
  <execution>
    <prompt>Execute this please, ensuring all file paths and state machine names match your assets.</prompt>
  </execution>
</rive_react_integration>
