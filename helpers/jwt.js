const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/studentimage(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/collegelogo(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/college(.*)/, methods: ["GET", "POST", "PUT", "OPTIONS"] },
      {
        url: /\/api\/v1\/superAdmin\/login(.*)/,
        methods: ["GET", "POST", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/stream(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/notices(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/caste(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/session(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/course(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/majorSubject(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/minorSubject(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/vocationalSubject(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/student(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/payment(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/transaction(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/document(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      
      { url: /\/api\/v1\/user(.*)/, methods: ["GET", "POST", "OPTIONS"] },
      { url: /\/api\/v1\/modules(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/user\/(.*)\/login/, methods: ["POST", "OPTIONS"] },
      `${api}\/(*)/`,
      // `${api}/user/SuperAdmin/register`,
      `/favicon.ico`
    ],
  });
}

// async function isRevoked(req, token, done) {
//     if (!token.payload.isSuperAdmin) {
//         done(null, true);  // Revoke if not SuperAdmin
//     }
//     done(); // Allow if SuperAdmin
// }

async function isRevoked(req, token) {
  try {
    if (token.payload && token.payload.isSuperAdmin) {
      return false; // Do not revoke access if the user is a SuperAdmin
    } else {
      return true; // Revoke access if the user is not a SuperAdmin
    }
  } catch (error) {
    console.error("Error in isRevoked function:", error);
    return true; // Revoke access if an error occurs as a safe fallback
  }
}
module.exports = authJwt;
