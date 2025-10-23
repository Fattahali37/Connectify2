const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const auth = req.headers["authorization"];
    const token = auth && auth.split(" ")[1];
    if (!token)
      return res.status(401).send({
        sucess: false,
        message: "Unauthorised",
      });
    
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    
    // If it's admin token, skip user status check
    if (decoded.isAdmin) {
      req.user = decoded;
      return next();
    }
    
    // Check if user exists and is not blocked
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.status === 'blocked') {
      return res.status(403).send({
        success: false,
        message: "Your account has been blocked by the admin",
        isBlocked: true
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send(err);
  }
};
