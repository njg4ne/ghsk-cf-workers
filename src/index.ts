import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { checkOriginMiddleware } from "middlewares/origin";
import { rateLimitMiddleware } from "middlewares/rateLimit";
import { GitHubOAuthExchange } from "./endpoints/oauth/github/codeForToken";

const app = new Hono();
const origin = (o) => {
  let admit = o.startsWith("https://");
  admit &&= o.endsWith("njg4ne.github.io") || o.endsWith("gardella.cc");
  // admit ||= o.startsWith("chrome-extension://");
  return admit ? o : null;
};
const corsOptions = {
  origin,
};
const openapi = fromHono(app, {
  docs_url: "/",
});
app.use("*", cors(corsOptions));
app.use("*", rateLimitMiddleware);
app.use("*", checkOriginMiddleware);

openapi.post("/api/oauth/github/access_token", GitHubOAuthExchange);

export default app;
