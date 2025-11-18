export async function GET() {
  return Response.json({
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    allEnv: Object.keys(process.env).filter(key => key.startsWith('NEXTAUTH'))
  });
}
