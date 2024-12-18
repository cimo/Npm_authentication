import * as Crypto from "crypto";

// Source
import * as Model from "./Model";

let cookieName = "";
const cookieTokenList: string[] = [];

export const writeCookie = (cookieNameValue: string, response: Model.Iresponse): void => {
    cookieName = cookieNameValue;

    const tokenLength = 64;

    const token = Crypto.randomBytes(tokenLength).toString("hex");

    cookieTokenList.push(token);

    response.cookie(cookieName, token, { httpOnly: true, secure: true });
};

export const removeCookie = (cookieName: string, request: Model.Irequest, response: Model.Iresponse): void => {
    const requestCookie = request.cookies[cookieName];

    if (requestCookie) {
        for (let a = 0; a < cookieTokenList.length; a++) {
            if (cookieTokenList[a] === requestCookie) {
                cookieTokenList.splice(a, 1);
                a--;
            }
        }

        response.cookie(cookieName, "", { expires: new Date(0) });
    }
};

export const authenticationMiddleware = (request: Model.Irequest, response: Model.Iresponse, next: Model.Tnext): void => {
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
            response.status(401).send({ response: { stdout: "", stderr: "Unauthorized cookie." } });

            return;
        }
    } else if (requestAuthorization && requestAuthorization.startsWith("Bearer ") && requestCookie) {
        if (requestAuthorization.substring(7) !== requestCookie) {
            response.status(401).send({ response: { stdout: "", stderr: "Unauthorized bearer." } });

            return;
        }
    } else if (requestAuthorization && requestAuthorization.startsWith("Basic ") && !requestCookie) {
        const credentialSplit = Buffer.from(requestAuthorization.split(" ")[1], "base64").toString().split(":");

        if (credentialSplit[0].trim() === "" || credentialSplit[1].trim() === "") {
            response.status(401).send({ response: { stdout: "", stderr: "Unauthorized basic." } });

            return;
        }
    } else {
        response.status(401).send({ response: { stdout: "", stderr: "Request parameter missing." } });

        return;
    }

    next();
};
