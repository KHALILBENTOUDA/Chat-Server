const JWT = require('jsonwebtoken')
module.exports=(pylouds)=>{
      const token=JWT.sign(
            pylouds,
            process.env.JWT_SECRET_KEY,
            {expiresIn:process.env.TIME_TO_LOGOUT}
      )
      return token;
}