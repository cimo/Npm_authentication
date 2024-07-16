import * as Crypto from "crypto";

// Source
import * as Interface from "./Interface";

let cookieName = "";
const cookieTokenList: string[] = [];

export const writeCookie = (cookieNameValue: string, response: Interface.Iresponse) => {
    cookieName = cookieNameValue;

    const tokenLength = 64;

    const token = Crypto.randomBytes(tokenLength).toString("hex");

    cookieTokenList.push(token);

    response.cookie(cookieName, token, { httpOnly: true, secure: true });
};

export const authenticationMiddleware = (request: Interface.Irequest, response: Interface.Iresponse, next: Interface.Tnext) => {
    const requestAuthorization = request.headers["authorization"] as string | undefined;
    const requestCookie = request.cookies[cookieName];

    if (!requestAuthorization && requestCookie) {
        let isExists = false;

        for (const cookieToken of cookieTokenList) {
            if (requestCookie === cookieToken) {
                isExists = true;

                break;
            }
        }

        if (!isExists) {
            return response.status(401).send({ response: { stdout: "", stderr: "Unauthorized cookie." } });
        }
    } else if (requestAuthorization && requestAuthorization.startsWith("Bearer ") && requestCookie) {
        if (requestAuthorization.substring(7) !== requestCookie) {
            return response.status(401).send({ response: { stdout: "", stderr: "Unauthorized bearer." } });
        }
    } else if (requestAuthorization && requestAuthorization.startsWith("Basic ") && !requestCookie) {
        const credentialSplit = Buffer.from(requestAuthorization.split(" ")[1], "base64").toString().split(":");

        if (credentialSplit[0].trim() === "" || credentialSplit[1].trim() === "") {
            return response.status(401).send({ response: { stdout: "", stderr: "Unauthorized basic." } });
        }
    } else {
        return response.status(401).send({ response: { stdout: "", stderr: "Request parameter missing." } });
    }

    next();
};
