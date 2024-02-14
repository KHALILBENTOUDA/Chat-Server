const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");

const statusText = require("../Util/statusText");


const createNotification = AsyncHandler(async (req, res, next) => {
      const { sender_id, receiver_id, content } = req.body;
      
      if(sender_id !==receiver_id){
      // Check if a notification with the same sender_id, receiver_id, and content exists
      const checkNotificationSql = 'SELECT * FROM notifications WHERE sender_id = ? AND receiver_id = ? AND content = ?';
      db.query(checkNotificationSql, [sender_id, receiver_id, content], (err, result) => {
        if (err) return new AppErrorClass(500, err, statusText.FAIL);
        if (result.length > 0) {
          // If a notification exists, remove it
          const deleteNotificationSql = 'DELETE FROM notifications WHERE sender_id = ? AND receiver_id = ? AND content = ?';
          db.query(deleteNotificationSql, [sender_id, receiver_id, content], (err, result) => {
            if (err) return new AppErrorClass(500, err, statusText.FAIL);
            // Insert the new notification
            insertNotification();
          });
        } else {
          // If no existing notification, directly insert the new one
          insertNotification();
        }
      });
    
      function insertNotification() {
        const insertSql = 'INSERT INTO notifications (sender_id, receiver_id, content) VALUES (?, ?, ?)';
        const getNotificationsSql = 'SELECT * FROM notifications WHERE receiver_id = ?';
    
        db.query(insertSql, [sender_id, receiver_id, content], (err, result) => {
          if (err) return new AppErrorClass(500, err, statusText.FAIL);
    
          db.query(getNotificationsSql, [receiver_id], (err, result) => {
            if (err) return new AppErrorClass(500, err, statusText.FAIL);
            
            res.status(201).json({
              status: statusText.SUCCESS,
              notification: result
            });
          });
        });
      }
    }
    });
    

const getNotifications=AsyncHandler(async(req,res,next)=>{
      const {receiver_id } = req.body;
      const getNotificatons = 'SELECT * FROM notifications WHERE receiver_id = ? AND is_Read = 0  ORDER BY is_Read ASC';
            db.query(getNotificatons,[receiver_id], (err, result) => {
            if (err) return new AppErrorClass(500, err, statusText.FAIL);
            res.status(201).json({ 
                  status:statusText.SUCCESS,
                  notification:result
             });

      });
})

const isReadnotification=AsyncHandler(async(req,res,next)=>{
      const {id} = req.body;
      const getNotificatons = 'UPDATE notifications SET is_Read = 1  WHERE id = ? ';
            db.query(getNotificatons,[id], (err, result) => {
              console.error(err);
            if (err) return new AppErrorClass(500, err, statusText.FAIL);

            res.status(201).json({ 
                  status:statusText.SUCCESS,
                  is_Read:true,
             });
      });
})



module.exports ={
      createNotification,
      getNotifications,
      isReadnotification
}

