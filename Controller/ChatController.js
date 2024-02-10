
const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const statusText = require("../Util/statusText");



const creatChat=AsyncHandler(async(req,res,next)=>{
      const sender=req.body.sender;
      const resever=req.body.resever;
      const chatData={
            members:JSON.stringify([sender,resever])
      }

//      const sql_create_chat = 'INSERT INTO Chat (members) VALUES (?)'
     // for Railway

     const sql_create_chat = 'INSERT INTO Chat (members) VALUES (?)'

     const sql_getChat ='SELECT * FROM Chat WHERE JSON_CONTAINS(members, ?) AND JSON_CONTAINS(members, ?);'
     const value_chat = [chatData.members]


     db.query(sql_create_chat,value_chat,(err,result)=>{
      console.error(err)
      if(err) return new AppErrorClass(500, err, statusText.FAIL)
      db.query(sql_getChat,[sender,resever],(err,result)=>{
            if(err) return new AppErrorClass(500,err, statusText.FAIL)
                  res.status(200).json({
                        status:statusText.SUCCESS,
                        chat:result
                  })
      
           })
     
      })
})

const userChat=AsyncHandler(async(req,res,next)=>{
      const user_id=req.params.user_id;
      const sql_UserChat ='SELECT * FROM Chat WHERE JSON_CONTAINS(members,?)'
      const value_chat =[user_id]

     db.query(sql_UserChat,value_chat,(err,result)=>{
      if(err) return new AppErrorClass(500,err, statusText.FAIL)
      
      res.status(200).json({
            status:statusText.SUCCESS,
            chat:result,
            code:200
      })

     })
})

const findChat=AsyncHandler(async(req,res,next)=>{
      const first_id=req.params.first_id;
      const second_id=req.params.second_id;
      const sql_UserChat ='SELECT * FROM Chat WHERE JSON_CONTAINS(members, ?) AND JSON_CONTAINS(members, ?);'
      const value_chat =[first_id,second_id]
     db.query(sql_UserChat,value_chat,(err,result)=>{
      if(err) return new AppErrorClass(500,err, statusText.FAIL)
      res.status(200).json({
            status:statusText.SUCCESS,
            chat:result
      })

     })
})



module.exports ={
      creatChat,
      userChat,
      findChat
}
