"use client";

export default function DebugEnv() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#000', color: '#0f0' }}>
      <h1>Environment Variables Debug</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>NEXT_PUBLIC_API_URL:</h2>
        <p style={{ color: process.env.NEXT_PUBLIC_API_URL ? '#0f0' : '#f00', fontSize: '18px' }}>
          {process.env.NEXT_PUBLIC_API_URL || '❌ NOT SET (undefined)'}
        </p>
        
        <h2>NEXTAUTH_URL:</h2>
        <p style={{ fontSize: '18px' }}>
          {process.env.NEXTAUTH_URL || '❌ NOT SET'}
        </p>
        
        <h2>All NEXT_PUBLIC_ variables:</h2>
        <pre style={{ background: '#222', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(
            Object.keys(process.env)
              .filter(key => key.startsWith('NEXT_PUBLIC_'))
              .reduce((obj, key) => {
                obj[key] = process.env[key];
                return obj;
              }, {}),
            null,
            2
          )}
        </pre>
        
        <h2>Test API Connection:</h2>
        <button
          onClick={async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
            console.log('Testing API URL:', apiUrl);
            try {
              const res = await fetch(`${apiUrl}/weatherforecast`);
              const data = await res.json();
              alert(`✅ Success! API is working.\n\nResponse: ${JSON.stringify(data, null, 2)}`);
            } catch (err) {
              alert(`❌ Error: ${err.message}\n\nAPI URL used: ${apiUrl}`);
            }
          }}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}

