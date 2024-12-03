<momentjs_installation>
  <instructions>
    <title>Installing Moment.js in Your Project</title>
    <description>Integrate Moment.js, a JavaScript library for parsing, validating, manipulating, and formatting dates and times.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Moment.js via npm</description>
        <action>
          <command>npm install moment --save</command>
        </action>
        <details>
          <item>Installs Moment.js and adds it to your project's dependencies.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Use Moment.js in Your Project</description>
        <action>
          <code>
            const moment = require('moment');
            // or for ES6 modules
            import moment from 'moment';

            const now = moment();
            console.log(now.format('MMMM Do YYYY, h:mm:ss a'));
          </code>
        </action>
        <details>
          <item>Imports Moment.js into your JavaScript file.</item>
          <item>Creates a Moment object representing the current date and time.</item>
          <item>Formats and logs the date and time as "November 27th 2024, 2:13:02 am".</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Consider Modern Alternatives</description>
        <details>
          <item>Moment.js is now in maintenance mode and not recommended for new projects.</item>
          <item>Explore modern alternatives like [Luxon](https://moment.github.io/luxon/) or the native [JavaScript Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) for date and time manipulation.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate Moment.js into your project. For more details, refer to the [official Moment.js documentation](https://momentjs.com/docs/).</prompt>
  </execution>
</momentjs_installation>
