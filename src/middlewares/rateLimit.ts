import { MiddlewareHandler } from "hono";

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  // const ipAddress = c.req.header("cf-connecting-ip") || "";
  const searchParams = c.req.query();
  const urlSearchParams = new URLSearchParams(searchParams);
  const key = `?${urlSearchParams.toString() || "params=none"}`;
  const rateLimit = await c.env.RATE_LIMITER.limit({ key });
  const { success } = rateLimit;
  const { limitVal, epoch, period } = await c.env.RATE_LIMITER;
  const details = {
    limit: `${limitVal} request`,
    period: `${period} seconds`,
    key,
  };
  if (!success) {
    return c.json({ error: "Rate limit exceeded", details }, 429);
  }
  await next();
};
