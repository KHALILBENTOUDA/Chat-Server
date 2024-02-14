const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const statusText = require("../Util/statusText");

const createMessage = AsyncHandler(async (req, res, next) => {
      const { chat_id, sender_id, text } = req.body;
 

      if(text){

            if (!text.trim()) {
                  return res.status(400).json({
                      status: statusText.FAIL,
                      message: 'Message cannot be empty.',
                  });
              }
          
              const insertSql = `INSERT INTO Message(chat_id, sender_id, text) VALUES (?, ?, ?)`;
              const selectSql = `SELECT * FROM Message WHERE message_id = LAST_INSERT_ID()`;
          
              const values = [chat_id, sender_id, text];
              db.query(insertSql, values, (err, result) => {
                  if (err) return new AppErrorClass(500, err, statusText.FAIL);
                  // Perform a select query to get the inserted data
                  db.query(selectSql, (err, insertedData) => {

                      if (err) return new AppErrorClass(500, err, statusText.FAIL);
                      res.status(201).json({
                          status: statusText.SUCCESS,
                          data: insertedData,
                      });
                  });
              });
      }else{
            req.body.image = req.file.filename;
            insertSql = `INSERT INTO Message(chat_id, sender_id, image) VALUES (?, ?, ?)`;
            selectSql = `SELECT * FROM Message WHERE message_id = LAST_INSERT_ID()`;
            values = [chat_id, sender_id, req.body.image];

            db.query(insertSql, values, (err, result) => {


                  if (err) return new AppErrorClass(500, err, statusText.FAIL);
                    
                  // Perform a select query to get the inserted data
                  db.query(selectSql, (err, insertedData) => {
   

                      if (err) return new AppErrorClass(500, err, statusText.FAIL);
                      res.status(201).json({
                          status: statusText.SUCCESS,
                          data: insertedData,
                      });
                  });
              });

      }
     
  });
   
   
const getAllmessages=AsyncHandler(async(req,res,next)=>{
      const chat_id = req.params.chat_id;
      const sql=`SELECT * FROM Message WHERE chat_id=?`;
      const value=[chat_id];
      db.query(sql,value,(err,result)=>{
            if(err) return new AppErrorClass(500, err, statusText.FAIL)
            res.status(200).json({
                  status:statusText.SUCCESS,
                  messages:result,
            })
      })
})


const sendNotification = AsyncHandler(async (req, res, next) => {
      const { chat_id, sender_id, text, receiver_id,image } = req.body;
       db.query('INSERT INTO ChatNotification (chat_id, sender_id, text, receiver_id,image) VALUES (?, ?, ?, ?,?)',[chat_id, sender_id, text, receiver_id,image],(err,results)=>{
        if(err) return next(new AppErrorClass(500, err, statusText.FAIL))
        res.status(200).json({
            status:statusText.SUCCESS,
          });
       }
 );
})

const getNotification = AsyncHandler(async (req, res, next) => {
    const {receiver_id,chat_id} = req.params
    const sql=`SELECT * FROM ChatNotification WHERE receiver_id = ? AND chat_id = ? AND is_Read=0  ORDER BY created_at DESC `;
    const sql_last_Read = `SELECT * FROM ChatNotification WHERE receiver_id = ? AND chat_id = ?  ORDER BY created_at DESC LIMIT 1`;
    const value=[receiver_id,chat_id];
    db.query(sql,value,(err,result)=>{
          if(err) return next(new AppErrorClass(500, err, statusText.FAIL))
          db.query(sql_last_Read, value, (lastReadErr, lastReadResult) => {
            if (lastReadErr) return next(new AppErrorClass(500, lastReadErr, statusText.FAIL));

            res.status(200).json({
                status: statusText.SUCCESS,
                notification: result,
                lastReadNotification: lastReadResult[0] // Assuming lastReadResult will return only one record
            });
        });
    })
})

const isReadMessage = AsyncHandler(async (req, res, next) => {
      const {chat_id ,receiver_id } =req.body
      const sql=`UPDATE ChatNotification SET is_Read=1 WHERE  chat_id= ? AND receiver_id= ?`;
      const value=[chat_id ,receiver_id ];
      db.query(sql,value,(err,result)=>{
            if(err) return next(new AppErrorClass(500, err, statusText.FAIL))
                  res.status(200).json({
                        status:statusText.SUCCESS,
                  })
      })
  })


module.exports ={
      createMessage,
      getAllmessages,
      getNotification,
      sendNotification,
      isReadMessage
}





