# GitHub Secret Keeper for Cloudflare Workers

This is a fork of https://github.com/HenrikJoreteg/github-secret-keeper designed for cloudflare workers instead of Heroku/Express.

The endpoint uses query parameters like GitHub but unlike HenrikJoreteg. Rate limiting uses the query string to rate limit one request per 10 seconds by default.

The architecture is a Cloudflare Worker with OpenAPI 3.1 using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono).


## Get started

1. Sign up for [Cloudflare Workers](https://workers.dev). The free tier is more than enough for most use cases.
2. Clone this project and install dependencies with `npm i`

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. For more information read the [chanfana documentation](https://chanfana.pages.dev/) and [Hono documentation](https://hono.dev/docs).

## Development

1. Run `npx wrangler dev` to start a local instance of the API.
2. Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.
4. The app runs out of `index.ts` 

## Deployment

1. Have a Cloudflare account
2. Use `npx wrangler login` to login to Cloudflare
3. Use `npx wrangler deploy` to deploy to Cloudflare
4. Visit the Cloudflare dashboard to tweak settings:
   - add secrets in the form of client_id=client_secret for your GitHub OAuth apps
   - change the worker's name
   - add any extra custom domains (note that more than one level of subdomain may require extra SSL certificates) such as `ghsk.your.domain`
