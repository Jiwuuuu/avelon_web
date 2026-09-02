const BACKEND_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  .replace(/\/$/, '');

function requestHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const name of ['accept', 'authorization', 'content-type', 'cookie', 'origin', 'user-agent']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function gateway(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/${path.map(encodeURIComponent).join('/')}${incomingUrl.search}`;
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    for (const name of ['content-type', 'cache-control', 'x-request-id']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const cookies = getSetCookie ? getSetCookie.call(upstream.headers) : [];
    if (cookies.length > 0) {
      cookies.forEach((cookie) => responseHeaders.append('set-cookie', cookie));
    } else {
      const cookie = upstream.headers.get('set-cookie');
      if (cookie) responseHeaders.append('set-cookie', cookie);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Backend gateway] Request failed:', error);
    return Response.json(
      { success: false, error: { code: 'BACKEND_UNAVAILABLE', message: 'Backend unavailable' } },
      { status: 502 },
    );
  }
}

export const GET = gateway;
export const POST = gateway;
export const PUT = gateway;
export const PATCH = gateway;
export const DELETE = gateway;
