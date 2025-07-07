import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//! How JWT Works

// ✅ First, there are two types of server: stateful and stateless.
// ✅ Stateful servers use sessions to authenticate users.
// ✅ They store user sessions in memory or a database (this is called "maintaining state").
// ✅ When a user makes a request, the server checks the session to identify the user.

// ✅ Stateless servers do NOT store session data.
// ✅ Each request must carry everything the server needs to know — no memory is used between requests.
// ✅ For stateless servers, we use JWT (JSON Web Tokens).

// ✅ JWT is a method to authenticate users using tokens.
// ✅ Each JWT token has three parts:

// ✅ 1. Header – contains the algorithm used for signing (e.g., HS256) and the token type (usually "JWT").
// ✅ 2. Payload – contains user-related data (e.g., user ID, token expiration time, etc).
// ✅ 3. Signature – this is the most important part.
// 🔧 The signature is created using:
//     HMAC_SHA256(Base64Url(header) + "." + Base64Url(payload), secretKey)
// ✅ The secret key is known only to the server and should never be shared.

// ✅ The final token looks like:
//     <Base64Url-encoded Header>.<Base64Url-encoded Payload>.<Signature>
// ✅ When a user logs in, the server creates this token and stores it in the user's cookies.
// 🔧 Correction: The **signature is not encrypted**, just hashed (you can't reverse a hash).
// ✅ The header and payload are Base64Url-encoded, so they are readable (not encrypted).
// ✅ The token is just a string separated by dots (.)

// ✅ Now, when the user revisits the website:
// ✅ 1. The browser sends the JWT (usually in a cookie or Authorization header).
// ✅ 2. The server extracts the token and splits it into header, payload, and signature.
// ✅ 3. The server Base64-decodes the header and payload.
// ✅ 4. It then re-generates the signature using the header + payload + the secret key.
// ✅ 5. If the regenerated signature matches the one in the token, the token is valid.
// ✅    Otherwise, the token is invalid or tampered with, and the user must log in again.

// ✅ This process makes JWT a secure and stateless way to authenticate users.

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 604800000, // 7 days in milliseconds
    httpOnly: true, // Can’t be read by JavaScript (XSS protection)
    sameSite: "strict", // Only send cookie for same-site requests (CSRF protection)
    secure: process.env.NODE_ENV !== "development", // Only send over HTTPS in production
  });

  return token;
};
