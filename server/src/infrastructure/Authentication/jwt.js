const jwt = require("jsonwebtoken");

class JwtService {
  generateAccessToken(userId) {
    return jwt.sign({ userId }, "ACCESS_SECRET", { expiresIn: "15m" });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ userId }, "REFRESH_SECRET", { expiresIn: "7d" });
  }

  verifyToken(token, secret) {
    return jwt.verify(token, secret);
  }
}
