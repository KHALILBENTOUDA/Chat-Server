const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const statusText = require("../Util/statusText");


const createView = AsyncHandler(async (req, res, next) => {
      const { Viewer, Visiter } = req.body;
      const getView = 'SELECT * FROM view WHERE Viewer=? AND Visiter=?';
      const insertView = 'INSERT INTO view (Visiter, Viewer) VALUES (?, ?)';
      try {
            if(Viewer !== Visiter){
             db.query(getView, [Viewer, Visiter],async(err,results)=>{

  
        
            if (results.length === 0) {
              // Insert view
              await new Promise((resolve, reject) => {
                db.query(insertView, [Visiter, Viewer], (err, result) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(result);
                  }
                });
              });
        
              res.status(201).json({
                status: statusText.SUCCESS,
              });
            } else {
              // Viewer already visited
              return res.status(200).json({
                status: statusText.SUCCESS,
                message: 'Viewer has already visited.',
              });
            }
      });
}
          } catch (error) {
            return next(new AppErrorClass(500, error.message, statusText.FAIL));
          }
})


// const createView = AsyncHandler( async (req, res, next) => {
//       const { Viewer, Visiter } = req.body;
//       const getView = 'SELECT * FROM view WHERE Viewer=? AND Visiter=?';
//       const insertView = 'INSERT INTO view (Visiter, Viewer) VALUES (?, ?)';
      
//       try {
//         if (Viewer !== Visiter) {
//           const [results] = await db.query(getView, [Viewer, Visiter]);
//             console.log(results)
//           if (results.length === 0) {
//             await db.query(insertView, [Visiter, Viewer]);
//             res.status(201).json({
//               status: statusText.SUCCESS,
//             });
//           }
//         }
//       } catch (error) {
//         return next(new AppErrorClass(500, error.message, statusText.FAIL));
//     });
    


const getAllUsersView=AsyncHandler(async(req,res,next)=>{
      const {Viewer} = req.body;
      const getNotificatons = 'SELECT Visiter  FROM view  WHERE Viewer=?';
            db.query(getNotificatons,[Viewer], (err, result) => {
            if (err) return new AppErrorClass(500, err, statusText.FAIL);
                  res.status(200).json({ 
                        status:statusText.SUCCESS,
                        allViwed:result
                   });


      });
})




module.exports ={
      createView,
      getAllUsersView
}

