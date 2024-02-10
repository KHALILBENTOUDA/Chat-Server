const AppErrorClass = require("./AppErrorClass");
const statusText = require("../Util/statusText");
const JWT = require("jsonwebtoken");

const LoginVerify = (req, res, next) => {
    const authHeader=req.headers['Authorization'] || req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return next(
          new AppErrorClass(401, "", statusText.FAIL)
        );
      }
      try{
      const currentUser = JWT.verify(token, process.env.JWT_SECRET_KEY)
      req.currentUser=currentUser;
      next()

  }catch(err){
      new AppErrorClass(401, "this token is not valid", statusText.FAIL)
  }
  
};

module.exports = LoginVerify;
