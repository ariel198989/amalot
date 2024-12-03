<bun_docs>
  <overview>
    <title>Bun: A Fast All-in-One JavaScript Runtime</title>
    <description>Bun is a modern JavaScript runtime built to provide fast performance, integrated tools, and ease of use for JavaScript and TypeScript development. It serves as an alternative to Node.js with added features and optimizations.</description>
    <use_cases>
      <use_case>
        <name>Web Development</name>
        <description>Bun can run server-side JavaScript, offering high performance for building APIs, web applications, and services.</description>
      </use_case>
      <use_case>
        <name>TypeScript Support</name>
        <description>Native execution of TypeScript files without the need for additional transpilers or configurations.</description>
      </use_case>
      <use_case>
        <name>Package Management</name>
        <description>Bun includes a fast, built-in package manager that simplifies dependency installation and management.</description>
      </use_case>
      <use_case>
        <name>Bundling</name>
        <description>Bun has a built-in bundler to optimize and bundle JavaScript and TypeScript code for production environments.</description>
      </use_case>
      <use_case>
        <name>Testing</name>
        <description>Bun includes an integrated test runner, eliminating the need for third-party testing libraries.</description>
      </use_case>
    </use_cases>
  </overview>

  <features>
    <feature>
      <name>High Performance</name>
      <description>Built on the JavaScriptCore engine, Bun delivers faster execution and lower memory usage compared to Node.js.</description>
    </feature>
    <feature>
      <name>Integrated Toolkit</name>
      <description>Combines runtime, package manager, bundler, and test runner into a single tool.</description>
    </feature>
    <feature>
      <name>Node.js Compatibility</name>
      <description>Supports many Node.js APIs, enabling seamless migration of existing projects.</description>
    </feature>
    <feature>
      <name>Native JSX and TSX Support</name>
      <description>Bun can execute `.tsx` and `.jsx` files directly without additional configurations.</description>
    </feature>
    <feature>
      <name>Web API Support</name>
      <description>Implements Web APIs like `fetch`, `WebSocket`, and `ReadableStream` for a familiar development experience.</description>
    </feature>
  </features>

  <installation>
    <platforms>
      <platform>
        <name>macOS/Linux</name>
        <command>curl -fsSL https://bun.sh/install | bash</command>
      </platform>
      <platform>
        <name>Windows</name>
        <command>powershell -c "irm bun.sh/install.ps1 | iex"</command>
      </platform>
    </platforms>
    <post_install>
      <command>bun --version</command>
      <description>Check if Bun is installed correctly.</description>
    </post_install>
  </installation>

  <getting_started>
    <step>
      <description>Initialize a new project</description>
      <command>bun init</command>
    </step>
    <step>
      <description>Run a JavaScript file</description>
      <command>bun run file.js</command>
    </step>
    <step>
      <description>Install dependencies</description>
      <command>bun install</command>
    </step>
  </getting_started>

  <examples>
    <example>
      <title>Run a Basic Server</title>
      <code>
        import { serve } from "bun";
        serve({
          port: 3000,
          fetch(req) {
            return new Response("Hello, World!");
          },
        });
      </code>
    </example>
  </examples>

  <summary>
    <description>Bun is used for high-performance web development, package management, testing, and application bundling. It simplifies workflows by integrating essential tools into a single runtime, making it an efficient choice for modern JavaScript and TypeScript projects.</description>
  </summary>
</bun_docs>
<bun_docs>
  <title>Bun Documentation</title>
  <url>https://bun.sh/docs</url>
  <description>
    Bun is an all-in-one toolkit for JavaScript and TypeScript applications, designed as a faster, modern replacement for Node.js. It integrates a runtime, package manager, bundler, and test runner into a single executable.
  </description>
  <features>
    <feature>
      <name>Runtime</name>
      <description>Execute JavaScript and TypeScript files with enhanced speed.</description>
    </feature>
    <feature>
      <name>Package Manager</name>
      <description>Manage dependencies faster than traditional package managers like npm or yarn.</description>
    </feature>
    <feature>
      <name>Bundler</name>
      <description>Bundle code for production with built-in support for JavaScript, TypeScript, CSS, and more.</description>
    </feature>
    <feature>
      <name>Test Runner</name>
      <description>Run tests seamlessly with a built-in, high-performance test framework.</description>
    </feature>
  </features>
  <engine>
    <name>JavaScriptCore</name>
    <description>
      Developed by Apple for Safari, JavaScriptCore provides fast startup times and efficient performance for Bun.
    </description>
  </engine>
  <usage>
    <use_case>Executing JavaScript and TypeScript files</use_case>
    <use_case>Managing project dependencies</use_case>
    <use_case>Code bundling for production</use_case>
    <use_case>Running automated tests</use_case>
  </usage>
  <node_compatibility>
    <description>
      Bun is compatible with Node.js APIs and modules, enabling seamless integration into existing projects.
    </description>
  </node_compatibility>
  <links>
    <official_site>
      <url>https://bun.sh</url>
      <title>Official Website</title>
    </official_site>
    <documentation>
      <url>https://bun.sh/docs</url>
      <title>Documentation</title>
    </documentation>
  </links>
</bun_docs>
