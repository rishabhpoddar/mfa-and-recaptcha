import ThirdPartyEmailPassword from "supertokens-node/recipe/thirdpartyemailpassword";
import Passwordless from "supertokens-node/recipe/passwordless";
import Session from "supertokens-node/recipe/session";
import { TypeInput } from "supertokens-node/types";
import Dashboard from "supertokens-node/recipe/dashboard";
import MultiFactorAuth from "supertokens-node/recipe/multifactorauth";
import AccountLinking from "supertokens-node/recipe/accountlinking";
import EmailVerification from "supertokens-node/recipe/emailverification";
import axios from "axios";
import supertokens from "supertokens-node";

export function getApiDomain() {
    const apiPort = process.env.REACT_APP_API_PORT || 3001;
    const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
    return apiUrl;
}

export function getWebsiteDomain() {
    const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
    const websiteUrl = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
    return websiteUrl;
}

export const SuperTokensConfig: TypeInput = {
    supertokens: {
        // this is the location of the SuperTokens core.
        connectionURI: "https://st-dev-9eb23380-fef7-11ee-80d0-0f2cbfaf8a04.aws.supertokens.io",
        apiKey: "JlI2rudCXdIzKrVDEudCh2QOIO",
    },
    appInfo: {
        appName: "SuperTokens Demo App",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
    },
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        ThirdPartyEmailPassword.init({
            override: {
                functions: (originalImplementation) => {
                    return {
                        ...originalImplementation,
                        emailPasswordSignUp: async function (input) {
                            let existingUsers = await supertokens.listUsersByAccountInfo(input.tenantId, {
                                email: input.email
                            });
                            if (existingUsers.length === 0) {
                                // this means this email is new so we allow sign up
                                return originalImplementation.emailPasswordSignUp(input);
                            }
                            return {
                                status: "EMAIL_ALREADY_EXISTS_ERROR"
                            }
                        },
                        thirdPartySignInUp: async function (input) {
                            let existingUsers = await supertokens.listUsersByAccountInfo(input.tenantId, {
                                email: input.email
                            });
                            if (existingUsers.length === 0) {
                                // this means this email is new so we allow sign up
                                return originalImplementation.thirdPartySignInUp(input);
                            }
                            if (existingUsers.find(u =>
                                u.loginMethods.find(lM => lM.hasSameThirdPartyInfoAs({
                                    id: input.thirdPartyId,
                                    userId: input.thirdPartyUserId
                                }) && lM.recipeId === "thirdparty") !== undefined)) {
                                // this means we are trying to sign in with the same social login. So we allow it
                                return originalImplementation.thirdPartySignInUp(input);
                            }
                            // this means that the email already exists with another social or email password login method, so we throw an error.
                            throw new Error("Cannot sign up as email already exists");
                        }
                    }
                },
                apis: (originalImplementation) => {
                    return {
                        ...originalImplementation,
                        thirdPartySignInUpPOST: async function (input) {
                            try {
                                return await originalImplementation.thirdPartySignInUpPOST!(input);
                            } catch (err: any) {
                                if (err.message === "Cannot sign up as email already exists") {
                                    // this error was thrown from our function override above.
                                    // so we send a useful message to the user
                                    return {
                                        status: "GENERAL_ERROR",
                                        message: "Seems like you already have an account with another method. Please use that instead."
                                    }
                                }
                                throw err;
                            }
                        }
                    }
                }
            },
            signUpFeature: {
                formFields: [
                    {
                        id: "recaptcha",
                        validate: async (value) => {
                            if (value === "") {
                                return "Captcha is required";
                            }
                            const url = `https://www.google.com/recaptcha/api/siteverify?secret=${"6LfNb8EpAAAAAIdXKZB8_yF45HAKmGZVn3Nc77hG"}&response=${value}`;

                            let axiosResponse = await axios({
                                method: "post",
                                url,
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            })
                            let jsonResponse = axiosResponse.data;
                            console.log("Recaptcha response from Google: ", jsonResponse)
                            if (!jsonResponse.success) {
                                return "Captcha is invalid";
                            }
                        }
                    }
                ]
            },
            providers: [
                // We have provided you with development keys which you can use for testing.
                // IMPORTANT: Please replace them with your own OAuth keys for production use.
                {
                    config: {
                        thirdPartyId: "google",
                        clients: [
                            {
                                clientId: "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
                                clientSecret: "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",
                            },
                        ],
                    },
                },
                {
                    config: {
                        thirdPartyId: "github",
                        clients: [
                            {
                                clientId: "467101b197249757c71f",
                                clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd",
                            },
                        ],
                    },
                },
                {
                    config: {
                        thirdPartyId: "apple",
                        clients: [
                            {
                                clientId: "4398792-io.supertokens.example.service",
                                additionalConfig: {
                                    keyId: "7M48Y4RYDL",
                                    privateKey:
                                        "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
                                    teamId: "YWQCXGJRJL",
                                },
                            },
                        ],
                    },
                },
                {
                    config: {
                        thirdPartyId: "twitter",
                        clients: [
                            {
                                clientId: "4398792-WXpqVXRiazdRMGNJdEZIa3RVQXc6MTpjaQ",
                                clientSecret: "BivMbtwmcygbRLNQ0zk45yxvW246tnYnTFFq-LH39NwZMxFpdC",
                            },
                        ],
                    },
                },
            ],
        }),
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
            flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
        }),
        EmailVerification.init({
            mode: "REQUIRED",
        }),
        AccountLinking.init({
            shouldDoAutomaticAccountLinking: async () => ({
                shouldAutomaticallyLink: true,
                shouldRequireVerification: true,
            }),
        }),
        MultiFactorAuth.init({
            firstFactors: ["thirdparty", "emailpassword"],
            override: {
                functions: (oI) => ({
                    ...oI,
                    getMFARequirementsForAuth: () => [
                        {
                            oneOf: [
                                MultiFactorAuth.FactorIds.OTP_EMAIL,
                                MultiFactorAuth.FactorIds.OTP_PHONE,
                            ],
                        },
                    ],
                }),
            },
        }),
        Session.init(),
        Dashboard.init(),
    ],
};
