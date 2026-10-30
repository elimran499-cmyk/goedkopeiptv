/**
 * SSR entry point for the prerender step.
 *
 * Built by Vite as its own Node bundle (`vite build --ssr`) rather than being
 * rendered directly: the components import images and CSS, which Node cannot
 * load on its own. Going through Vite means the prerender sees exactly what the
 * browser bundle sees.
 *
 * `prerenderToNodeStream` waits for Suspense boundaries to settle. This page has
 * none today, but the API costs nothing and will not break when one appears.
 */
import { prerenderToNodeStream } from 'react-dom/static';
import App from './App';

export async function render(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(<App />);
  return new Promise<string>((resolve, reject) => {
    let out = '';
    prelude.setEncoding('utf8');
    prelude.on('data', (c: string) => {
      out += c;
    });
    prelude.on('end', () => resolve(out));
    prelude.on('error', reject);
  });
}
