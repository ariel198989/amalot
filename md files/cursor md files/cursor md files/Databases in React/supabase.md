<supabase_integration>
  <instructions>
    <title>Integrating Supabase into Your React Project</title>
    <description>Enhance your React application with Supabase, an open-source Firebase alternative that provides a suite of backend services, including a Postgres database, authentication, storage, and real-time capabilities.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Create a Supabase Project</description>
        <details>
          <item>Visit the [Supabase Dashboard](https://supabase.com/dashboard) and sign in to your account.</item>
          <item>Click on "New Project" and follow the prompts to set up your project.</item>
          <item>After creation, note your project's URL and API keys from the settings; you'll need these for configuration.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Install Supabase JavaScript Client</description>
        <action>
          <command>npm install @supabase/supabase-js</command>
        </action>
        <details>
          <item>Installs the Supabase client library for JavaScript, enabling interaction with Supabase services from your React application.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Initialize Supabase Client</description>
        <action>
          <code>
            import { createClient } from '@supabase/supabase-js';

            const supabaseUrl = 'https://your-project.supabase.co';
            const supabaseAnonKey = 'your-anon-key';

            const supabase = createClient(supabaseUrl, supabaseAnonKey);
          </code>
        </action>
        <details>
          <item>Replace `'https://your-project.supabase.co'` with your actual Supabase project URL.</item>
          <item>Replace `'your-anon-key'` with your project's anonymous API key.</item>
          <item>Creates a Supabase client instance to interact with your project's backend services.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Set Up Authentication (Optional)</description>
        <details>
          <item>Supabase offers built-in authentication with support for email/password, OAuth providers, and more.</item>
          <item>Refer to the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) for detailed setup instructions.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Interact with the Database</description>
        <action>
          <code>
            async function fetchData() {
              const { data, error } = await supabase
                .from('your-table')
                .select('*');

              if (error) console.error('Error fetching data:', error);
              else console.log('Data:', data);
            }
          </code>
        </action>
        <details>
          <item>Replace `'your-table'` with the name of your database table.</item>
          <item>Fetches all records from the specified table and logs them to the console.</item>
          <item>Handles potential errors during the fetch operation.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Explore Additional Features</description>
        <details>
          <item>Supabase provides real-time subscriptions, storage for files, and serverless functions.</item>
          <item>Refer to the [Supabase Documentation](https://supabase.com/docs) for comprehensive guides and API references.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate Supabase into your React project. For more details, refer to the [Supabase Documentation](https://supabase.com/docs).</prompt>
  </execution>
</supabase_integration>
