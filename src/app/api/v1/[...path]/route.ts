import type { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
];

function getOrigins(request: Request): {
  publicOrigin: string;
  backendOrigin: URL;
} {
  const requestOrigin = new URL(request.url).origin;
  const configuredPublicOrigin = process.env.ASSET_PASS_PUBLIC_ORIGIN?.trim();
  const configuredBackendOrigin = process.env.ASSET_PASS_BACKEND_ORIGIN?.trim();

  if (process.env.NODE_ENV === "production" && (!configuredPublicOrigin || !configuredBackendOrigin)) {
    throw new Error("The AssetPass API proxy is not configured.");
  }

  const publicOrigin = configuredPublicOrigin
    ? new URL(configuredPublicOrigin).origin
    : requestOrigin;
  const backendOrigin = new URL(configuredBackendOrigin || "http://localhost:3001");

  if (
    publicOrigin !== (configuredPublicOrigin ? configuredPublicOrigin.replace(/\/$/, "") : requestOrigin) ||
    backendOrigin.pathname !== "/" ||
    backendOrigin.search ||
    backendOrigin.hash ||
    backendOrigin.username ||
    backendOrigin.password ||
    (process.env.NODE_ENV === "production" && backendOrigin.protocol !== "https:")
  ) {
    throw new Error("The AssetPass API proxy origin configuration is invalid.");
  }

  if (requestOrigin !== publicOrigin) {
    throw new Error("This application origin is not allowed.");
  }

  return { publicOrigin, backendOrigin };
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  let origins: ReturnType<typeof getOrigins>;

  try {
    origins = getOrigins(request);
  } catch {
    return Response.json({ message: "The API proxy is unavailable." }, { status: 503 });
  }

  const suppliedOrigin = request.headers.get("origin");
  if (suppliedOrigin && suppliedOrigin !== origins.publicOrigin) {
    return Response.json({ message: "Untrusted request origin." }, { status: 403 });
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ message: "Cross-site requests are not allowed." }, { status: 403 });
  }

  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0 || path.some((part) => !part || part === "." || part === "..")) {
    return Response.json({ message: "Invalid API path." }, { status: 400 });
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `/api/v1/${path.map((part) => encodeURIComponent(part)).join("/")}${incomingUrl.search}`,
    origins.backendOrigin,
  );

  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
  headers.set("origin", origins.publicOrigin);
  headers.set("accept", request.headers.get("accept") ?? "application/json");

  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > 1_048_576) {
      return Response.json({ message: "Request body is too large." }, { status: 413 });
    }
    body = await request.arrayBuffer();
    if (body.byteLength > 1_048_576) {
      return Response.json({ message: "Request body is too large." }, { status: 413 });
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstream.headers);
    for (const name of HOP_BY_HOP_HEADERS) responseHeaders.delete(name);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.set("Cache-Control", "no-store");

    const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const setCookies = typeof getSetCookie === "function" ? getSetCookie.call(upstream.headers) : [];
    if (setCookies.length > 0) {
      responseHeaders.delete("set-cookie");
      for (const cookie of setCookies) responseHeaders.append("set-cookie", cookie);
    }

    const noBody = request.method === "HEAD" || upstream.status === 204 || upstream.status === 304;
    return new Response(noBody ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ message: "The AssetPass API could not be reached." }, { status: 502 });
  }
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
