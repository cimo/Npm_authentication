# Authentication

Authentication middleware. Light, fast and secure.
Write with native Typescript code and no dependencies is used.

## Pack

1. npm run pack
2. Copy the file "package_name-x.x.x.tgz" in the project root folder.
3. In the "package.json" file insert: "@cimo/package_name": "file:package_name-x.x.x.tgz"

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

app.get("/login", (_, response: Express.Response) => {
    Ca.writeCookie("xxx_authentication", response);

    response.json({ stdout: "Token created." });
});

app.get("/profile", Ca.authenticationMiddleware, (_, response: Express.Response) => {
    response.json({ stdout: "Authentication ok." });
});

app.get("/logout", (request: Express.Request, response: Express.Response) => {
    Ca.removeCookie("xxx_authentication", request, response);

    response.json({ stdout: "Token removed." });
});

...

```
