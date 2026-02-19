import { NextRequest, NextResponse } from "next/server";

const PLATFORM_BASE =
  process.env.PLATFORM_API_BASE ?? "http://localhost:5068";

type Ctx = { params: Promise<{ path?: string[] }> };

async function handler(req: NextRequest, ctx: Ctx) {
  const { path: pathArr = [] } = await ctx.params;
  const path = pathArr.join("/");

  const url = new URL(req.url);
  const target = `${PLATFORM_BASE}/${path}${url.search}`;

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  // hop-by-hop 헤더 제거 (프록시 안정성)
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const outHeaders = new Headers(res.headers);
  outHeaders.delete("content-encoding");

  return new NextResponse(res.body, { status: res.status, headers: outHeaders });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
