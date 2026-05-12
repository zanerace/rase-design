type NitroViteServices = Record<string, { fetch: (req: Request) => Response | Promise<Response> }>;

function getNitroSsrService(): NitroViteServices[string] | undefined {
  const g = globalThis as typeof globalThis & { __nitro_vite_envs__?: NitroViteServices };
  return g.__nitro_vite_envs__?.["ssr"];
}

/** Nitro forwards `/**` here. TanStack's client bundle is a virtual module, so Nitro does not splice
 *  `<!--ssr-outlet-->` for production; delegating to the SSR service fixes the empty HTML shell. */
export default async function nitroTanStackRenderer(event: {
  req: Request;
}): Promise<Response> {
  const ssr = getNitroSsrService();
  if (!ssr?.fetch) {
    return new Response("SSR bundle not available.", {
      status: 501,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return ssr.fetch(event.req);
}
