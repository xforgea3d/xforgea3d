export function GET() {
   return new Response('google-site-verification: google82b818a8be551f2e.html', {
      headers: { 'Content-Type': 'text/html' },
   })
}
