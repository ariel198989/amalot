<spline_integration>
  <instructions>
    <title>Getting Started with Spline</title>
    <description>Spline is a web-based collaborative design platform that simplifies the creation of interactive 3D experiences. Learn how to integrate Spline scenes into a React application.</description>
    <features>
      <feature>
        <title>Real-Time Collaboration</title>
        <description>Multiple users can work simultaneously on a 3D scene, fostering teamwork and instant feedback.</description>
      </feature>
      <feature>
        <title>Intuitive Design Tools</title>
        <description>Spline uses a 2D approach to 3D design, making it accessible compared to traditional 3D modeling software.</description>
      </feature>
      <feature>
        <title>Web-Based Accessibility</title>
        <description>Runs directly in the browser, eliminating the need for installations.</description>
      </feature>
      <feature>
        <title>Interactive 3D Content</title>
        <description>Create interactive 3D content that can be embedded into websites or web applications.</description>
      </feature>
    </features>
    <steps>
      <step>
        <number>1</number>
        <description>Create a New File</description>
        <details>
          <item>Click the "+" icon next to your name or press the "New File" button under "My Files".</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Understand the Interface</description>
        <details>
          <item>Tab Bar: Displays your opened files.</item>
          <item>Toolbar: Quick access to common objects, transform options, and special modes.</item>
          <item>Left Sidebar: Shows your scene's layers or objects (Outliner).</item>
          <item>Right Sidebar: Displays the Property Panels for selected objects.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Control the Camera</description>
        <details>
          <item>Orbit: Use Option/Alt + Click & Drag.</item>
          <item>Zoom: Scroll or use Cmd/Ctrl + Scroll.</item>
          <item>Pan: Press Space + Click & Drag.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Export Your Scene</description>
        <details>
          <item>Click the Export button in Spline and select the "Spline Viewer" option.</item>
          <item>Copy the provided embed code.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Embed in React</description>
        <action>
          <code>
            <![CDATA[
            import React from 'react';

            const SplineEmbed = () => {
              return (
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<iframe src="YOUR_EMBED_URL" frameborder="0" width="100%" height="100%"></iframe>`,
                  }}
                />
              );
            };

            export default SplineEmbed;
            ]]>
          </code>
        </action>
        <details>
          <item>Replace "YOUR_EMBED_URL" with the URL provided by Spline.</item>
        </details>
      </step>
    </steps>
    <references>
      <reference>
        <title>Spline Documentation</title>
        <url>https://docs.spline.design/doc</url>
      </reference>
    </references>
  </instructions>
</spline_integration>
