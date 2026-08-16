import {
    ENDPOINTS
} from "../config/api.config";


/* =========================================================
   BASIC HELPERS
========================================================= */

function isObject(value) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


/* =========================================================
   UNWRAP API DATA

   Supports:

   {
       success: true,
       data: ...
   }
========================================================= */

export function unwrapData(payload) {

    if (
        isObject(payload) &&
        "data" in payload
    ) {

        return payload.data;

    }


    return payload;

}


/* =========================================================
   EXTRACT LIST

   IMPORTANT:

   This version supports many Django response shapes:

   [
       ...
   ]

   {
       data: [...]
   }

   {
       results: [...]
   }

   {
       data: {
           results: [...]
       }
   }

   {
       data: {
           saved_algorithms: [...]
       }
   }

   {
       data: {
           algorithms: [...]
       }
   }

   {
       data: {
           documentation_sections: [...]
       }
   }
========================================================= */

export function extractList(
    payload,
    preferredKeys = []
) {

    const commonKeys = [

        ...preferredKeys,

        "results",
        "items",
        "list",
        "records",
        "objects",

        "algorithms",
        "saved_algorithms",
        "saved",

        "my_algorithms",

        "documentation",
        "documentation_sections",
        "documents",
        "sections",

        "topics",
        "users",

        "data"

    ];


    const visited =
        new Set();


    const findArray =
        (
            value,
            depth = 0
        ) => {

            if (
                depth > 7
            ) {

                return null;

            }


            if (
                Array.isArray(value)
            ) {

                return value;

            }


            if (
                !isObject(value)
            ) {

                return null;

            }


            if (
                visited.has(value)
            ) {

                return null;

            }


            visited.add(value);


            /* =============================================
               CHECK IMPORTANT KEYS FIRST
            ============================================= */

            for (
                const key
                of commonKeys
            ) {

                if (
                    !(key in value)
                ) {

                    continue;

                }


                const child =
                    value[key];


                if (
                    Array.isArray(child)
                ) {

                    return child;

                }


                if (
                    isObject(child)
                ) {

                    const nested =
                        findArray(
                            child,
                            depth + 1
                        );


                    if (nested) {

                        return nested;

                    }

                }

            }


            /* =============================================
               LAST FALLBACK

               Search nested objects only.
            ============================================= */

            for (
                const child
                of Object.values(value)
            ) {

                if (
                    !isObject(child)
                ) {

                    continue;

                }


                const nested =
                    findArray(
                        child,
                        depth + 1
                    );


                if (nested) {

                    return nested;

                }

            }


            return null;

        };


    return (
        findArray(payload) ??
        []
    );

}


/* =========================================================
   API ERROR MESSAGE
========================================================= */

export function getApiErrorMessage(
    payload,
    fallback = "Request failed."
) {

    if (!payload) {

        return fallback;

    }


    if (
        typeof payload === "string"
    ) {

        return (
            payload ||
            fallback
        );

    }


    if (
        payload.message
    ) {

        return String(
            payload.message
        );

    }


    if (
        payload.detail
    ) {

        return String(
            payload.detail
        );

    }


    const errors =

        payload.errors ??

        payload;


    if (
        errors &&
        typeof errors === "object"
    ) {

        for (
            const value
            of Object.values(errors)
        ) {

            if (
                Array.isArray(value) &&
                value.length > 0
            ) {

                return value
                    .map(String)
                    .join(" ");

            }


            if (
                typeof value ===
                "string"
            ) {

                return value;

            }


            if (
                value &&
                typeof value ===
                "object"
            ) {

                const nested =
                    getApiErrorMessage(
                        value,
                        ""
                    );


                if (nested) {

                    return nested;

                }

            }

        }

    }


    return fallback;

}


/* =========================================================
   PARSE RESPONSE
========================================================= */

export async function parseResponse(
    response
) {

    if (
        response.status === 204
    ) {

        return {};

    }


    const text =
        await response.text();


    if (!text) {

        return {};

    }


    try {

        return JSON.parse(
            text
        );

    }
    catch {

        return {
            message:
                text
        };

    }

}


/* =========================================================
   STORAGE
========================================================= */

function preferredStorage() {

    return (
        localStorage.getItem(
            "remember_me"
        ) === "true"
            ? localStorage
            : sessionStorage
    );

}


export function getStoredAccessToken() {

    const preferred =
        preferredStorage();


    const secondary =
        preferred === localStorage
            ? sessionStorage
            : localStorage;


    return (

        preferred.getItem(
            "access_token"
        ) ||

        secondary.getItem(
            "access_token"
        )

    );

}


export function getStoredRefreshToken() {

    const preferred =
        preferredStorage();


    const secondary =
        preferred === localStorage
            ? sessionStorage
            : localStorage;


    return (

        preferred.getItem(
            "refresh_token"
        ) ||

        secondary.getItem(
            "refresh_token"
        )

    );

}


export function storeAccessToken(
    access
) {

    if (!access) {
        return;
    }


    preferredStorage()
        .setItem(
            "access_token",
            access
        );

}


/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

export async function refreshStoredAccessToken() {

    const refresh =
        getStoredRefreshToken();


    if (!refresh) {

        throw new Error(
            "Session expired. Please log in again."
        );

    }


    const response =
        await fetch(
            ENDPOINTS.REFRESH,
            {
                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({
                        refresh
                    })
            }
        );


    const payload =
        await parseResponse(
            response
        );


    const data =
        unwrapData(
            payload
        ) ?? payload;


    const access =

        data?.access ??

        payload?.access;


    if (
        !response.ok ||
        !access
    ) {

        throw new Error(

            getApiErrorMessage(
                payload,
                "Session expired. Please log in again."
            )

        );

    }


    storeAccessToken(
        access
    );


    return access;

}


/* =========================================================
   BUILD FETCH OPTIONS
========================================================= */

function buildRequestOptions(
    method,
    token,
    body,
    headers
) {

    const finalHeaders = {
        ...headers
    };


    if (token) {

        finalHeaders.Authorization =
            `Bearer ${token}`;

    }


    let requestBody;


    if (
        body !== undefined &&
        body !== null
    ) {

        if (
            body instanceof FormData
        ) {

            requestBody =
                body;

        }
        else if (
            typeof body ===
            "string"
        ) {

            requestBody =
                body;


            if (
                !finalHeaders[
                "Content-Type"
                ]
            ) {

                finalHeaders[
                    "Content-Type"
                ] =
                    "application/json";

            }

        }
        else {

            requestBody =
                JSON.stringify(
                    body
                );


            if (
                !finalHeaders[
                "Content-Type"
                ]
            ) {

                finalHeaders[
                    "Content-Type"
                ] =
                    "application/json";

            }

        }

    }


    return {

        method,

        headers:
            finalHeaders,

        ...(
            requestBody !==
                undefined
                ? {
                    body:
                        requestBody
                }
                : {}
        )

    };

}


/* =========================================================
   MAIN API REQUEST

   Automatically refreshes access token on 401.
========================================================= */

export async function apiRequest(
    url,
    {
        method = "GET",
        body,
        headers = {},
        auth = true,
        retryOn401 = true
    } = {}
) {

    let token =
        auth
            ? getStoredAccessToken()
            : null;


    let response =
        await fetch(
            url,
            buildRequestOptions(
                method,
                token,
                body,
                headers
            )
        );


    /* =====================================================
       TOKEN EXPIRED
    ===================================================== */

    if (
        auth &&
        response.status === 401 &&
        retryOn401
    ) {

        token =
            await refreshStoredAccessToken();


        response =
            await fetch(
                url,
                buildRequestOptions(
                    method,
                    token,
                    body,
                    headers
                )
            );

    }


    const payload =
        await parseResponse(
            response
        );


    if (!response.ok) {

        const error =
            new Error(

                getApiErrorMessage(
                    payload,
                    `Request failed (${response.status}).`
                )

            );


        error.status =
            response.status;


        error.payload =
            payload;


        throw error;

    }


    return payload;

}