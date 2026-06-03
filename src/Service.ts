import * as Crypto from "crypto";

// Source
import * as model from "./Model.js";

let cookieName = "";
let cookieNameCustom = "";
const cookieTokenList: string[] = [];

export const setCookieNameCustom = (value: string): void => {
    cookieNameCustom = value;
};

export const writeCookie = (cookieNameValue: string, response: model.Iresponse): void => {
    cookieName = cookieNameValue;

    const tokenLength = 64;

    const token = Crypto.randomBytes(tokenLength).toString("hex");

    cookieTokenList.push(token);

    response.cookie(cookieName, token, { httpOnly: true, secure: true });
};

export const deleteCookie = (cookieName: string, request: model.Irequest, response: model.Iresponse): void => {
    const cookie = request.cookies[cookieName];

    if (cookie) {
        for (let a = cookieTokenList.length - 1; a >= 0; a--) {
            if (cookieTokenList[a] === cookie) {
                cookieTokenList.splice(a, 1);
            }
        }

        response.cookie(cookieName, "", { expires: new Date(0) });
    }
};

export const authenticationMiddleware = (request: model.Irequest, response: model.Iresponse, next: (error?: Error) => void): void => {
    const authorization = request.headers["authorization"];
    const cookie = request.cookies[cookieName];
    const cookieCustom = cookieNameCustom ? request.headers[cookieNameCustom] : undefined;

    let cookieCustomValue = "";

    if (typeof cookieCustom === "string") {
        const requestCookieCustomSplit = cookieCustom.split(";")[0];

        cookieCustomValue = requestCookieCustomSplit.includes("=") ? requestCookieCustomSplit.split("=")[1].trim() : requestCookieCustomSplit.trim();
    }

    const cookieValue = cookie || cookieCustomValue;

    if (!authorization && cookieValue) {
        let isExists = false;

        for (let a = 0; a < cookieTokenList.length; a++) {
            const cookieToken = cookieTokenList[a];

            if (cookieValue === cookieToken) {
                isExists = true;

                break;
            }
        }

        if (!isExists) {
            response.status(401).send({ response: { stdout: "", stderr: "Unauthorized cookie." } });

            return;
        }
    } else if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
        const token = authorization.substring(7).trim();

        if (!token) {
            response.status(401).send({ response: { stdout: "", stderr: "Unauthorized bearer." } });

            return;
        }
    } else if (typeof authorization === "string" && authorization.startsWith("Basic ")) {
        const credentialSplit = Buffer.from(authorization.split(" ")[1], "base64").toString().split(":");

        if (credentialSplit.length < 2 || credentialSplit[0].trim() === "" || credentialSplit[1].trim() === "") {
            response.status(401).send({ response: { stdout: "", stderr: "Unauthorized basic." } });

            return;
        }
    } else {
        response.status(401).send({ response: { stdout: "", stderr: "Require authorization." } });

        return;
    }

    next();
};
