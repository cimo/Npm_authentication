# Authentication

Authentication middleware. Light, fast and secure.

## Publish

1. npm run build
2. npm login --auth-type=legacy
3. npm publish --auth-type=legacy --access public

## Installation

1. Link for npm package -> https://www.npmjs.com/package/@cimo/authentication

## Server - Example with "NodeJs Express"

-   Server.ts

```
...

import { Ca } from "@cimo/authentication";

...

app.use(CookieParser());

...

app.get("/login", (_request: Express.Request, response: Express.Response) => {
    Ca.generateCookie("ms_at_authentication", response);

    response.json({ stdout: "Token generated." });
});

app.get("/profile", Ca.authenticationMiddleware, (_request: Express.Request, response: Express.Response) => {
    response.json({ stdout: "Authentication ok." });
});

...

```
