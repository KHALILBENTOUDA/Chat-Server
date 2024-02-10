const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const statusText = require("../Util/statusText");


const getAllInterests=AsyncHandler(async(req,res,next)=>{
      const sql=`SELECT * FROM interests`
      db.query(sql,(err,results)=>{
            if(err){
                  return next( new AppErrorClass(401, "User info not send", statusText.FAIL))
            }
            if(results.length >0){
                  res.status(200).json({
                        status:statusText.SUCCESS,
                        results
                  })
            }else{
                  res.status(200).json({
                        status:statusText.SUCCESS,
                        messsage:'no interestes available'
                  })
            }
            
      })
})
module.exports ={
      getAllInterests
}