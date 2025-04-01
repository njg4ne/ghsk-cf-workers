import { OpenAPIRoute } from "chanfana";
import { error } from "console";
import { GitHubAccessToken } from "types";
import { z } from "zod";
// tags: ["OAuth", "GitHub"],
// 		summary: "Exchange GitHub OAuth code for access token without having the client secret.",

export class GitHubOAuthExchange extends OpenAPIRoute {
  schema = {
    tags: ["OAuth", "GitHub"],
    summary:
      "Exchange GitHub OAuth code for access token without having the client secret.",
    request: {
      query: z.object({
        client_id: z.string().nonempty("The client ID is required."),
        code: z.string().nonempty("The code is required."),
        redirect_uri: z
          .string()
          .url()
          .optional()
          .describe(
            "The URL in your application where users are sent after authorization. Strongly recommended to prevent attacks. Checked by GitHub to match the URI from when the code was issued."
          ),
      }),
      headers: z.object({
        accept: z.literal("application/json"),
      }),
      //   body: {
      //     content: {
      //       "application/json": {
      //         schema: GitHubAccessToken,
      //       },
      //     },
      //   },
    },
    responses: {
      "200": {
        description: "Returns the access token as JSON.",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              access_token: z.string().nonempty(),
            }),
          },
        },
      },
      "502": {
        description: "GitHub API error.",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.unknown(),
            }),
          },
        },
      },
      "400": {
        description: "Bad request.",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();
    const searchParams = new URLSearchParams(data.query);
    const env = c.env as Record<string, string>;
    const client_id = searchParams.get("client_id");
    if (!(client_id in env)) {
      return c.json(
        {
          success: false,
          error:
            "This server is not configured to obtain tokens for the requested client.",
        },
        400
      );
    }
    searchParams.append("client_secret", env[client_id]);
    const searchParamsString = searchParams.toString();
    const nextUrl = new URL(
      `https://github.com/login/oauth/access_token?${searchParamsString}`
    );
    const ghResponse = await fetch(nextUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    if (!ghResponse.ok) {
      return c.json(
        {
          success: false,
          error: `GitHub API error: ${ghResponse.statusText}`,
        },
        502
      );
    }
    const ghData = (await ghResponse.json()) as any;
    let hadError = ghData.error !== undefined;
    const access_token = ghData.access_token;
    hadError =
      hadError ||
      z.string().nonempty().safeParse(access_token).success === false;
    if (hadError) {
      return c.json(
        {
          success: false,
          error: ghData || "GitHub API error: no access token returned.",
        },
        502
      );
    }
    return c.json({
      success: true,
      access_token,
    });
  }
}
