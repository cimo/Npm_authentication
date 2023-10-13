import * as Crypto from "crypto";

// Source
import * as Interface from "./Interface";

let cookieName = "";

export const setCookieName = (value: string) => {
    cookieName = value;
};

export const authenticationMiddleware = (request: Interface.Irequest, response: Interface.Iresponse, next: Interface.Inext) => {
    const authorization = request.headers["authorization"] as string | undefined;
    const authentication = request.cookies[cookieName] as string | undefined;

    if (!authorization && (!authentication || authentication.trim() === "")) {
        return response.status(401).send({ response: { stdout: "", stderr: "Unauthenticated" } });
    } else if (authorization) {
        if (authorization && authorization.startsWith("Bearer ")) {
            if (authorization.substring(7) !== authentication) {
                return response.status(401).send({ response: { stdout: "", stderr: "Unauthorized" } });
            }
        } else if (authorization && authorization.startsWith("Basic ")) {
            const credentialSplit = Buffer.from(authorization.split(" ")[1], "base64").toString().split(":");

            if (credentialSplit[0].trim() === "" || credentialSplit[1].trim() === "") {
                return response.status(401).send({ response: { stdout: "", stderr: "Unauthorized" } });
            }
        }
    }

    next();
};

export const generateCookie = (response: Interface.Iresponse) => {
    const tokenLength = 64;

    const encrypted = Crypto.randomBytes(tokenLength).toString("hex");

    response.cookie(cookieName, encrypted, { httpOnly: true, secure: true });

    return encrypted;
};
