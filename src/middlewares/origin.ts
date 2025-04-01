import { MiddlewareHandler } from "hono";

export const checkOriginMiddleware: MiddlewareHandler = async (c, next) => {
  const allowOrigin = c.res.headers.get("access-control-allow-origin");
  // console.log("CORS found Origin:", allowOrigin);
  if (!allowOrigin) {
    // console.error("Origin header is missing");
    return c.json({}, 404);
  }
  await next();
};
