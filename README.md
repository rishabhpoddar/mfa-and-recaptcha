# Example app with MFA and Google reCAPTCHA

## Features:
- Login with social or email password
- MFA with SMS or email OTP
- Google reCAPTCHA
- Support for JWTs and opaque tokens (via access token blacklisting)
- User impersonation
- Reset password flow
- Session refreshing
- User management dashboard


## Setup
1. Clone the repo

2. Install dependencies: 

```bash
cd backend && npm install
```

```bash
cd frontend && npm install
```

3. Start the app

```bash
# in the root of the project
npm run start
```

This will start the node backend on `http://localhost:3001` and the react frontend on `http://localhost:3000`.

## Different flows

### Email password login with OTP email as second factor
- Email: rishabh@supertokens.com
- Password: abcd1234

### Email password login with OTP SMS as second factor
- Email: rishabh+2@supertokens.com
- Password: abcd1234