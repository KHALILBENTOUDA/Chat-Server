const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const statusText = require("../Util/statusText");


const editProfile = AsyncHandler(async (req, res, next) => {
      req.body.pictures = req.file.filename;
      const {id}=req.params;
      const sql_Emage_Update = 'UPDATE  pictures SET picture_url= ?  WHERE user_id =? AND is_profile_picture=1';
      db.query(sql_Emage_Update,[req.body.pictures,id],(err,results)=>{
            console.error(err);
            if(err) return new AppErrorClass(500,err, statusText.FAIL)
            res.status(201).json({
                  status:statusText.SUCCESS,
                  data:req.body.pictures
            })
      })
})


const editCover=AsyncHandler(async(req,res,next)=>{
      req.body.pictures = req.file.filename;
      const {id}=req.params;
      const sql_Emage_Update = `
      UPDATE pictures
      SET Covers = ?
      WHERE user_id = ? AND pictures.is_profile_picture=1;
    `;
      db.query(sql_Emage_Update,[req.body.pictures,id],(err,results)=>{

            if(err) return new AppErrorClass(500,err, statusText.FAIL)

            res.status(201).json({
                  status:statusText.SUCCESS,
                  data:req.body.pictures
            })
      })
})

const insertPostEmage=AsyncHandler(async(req,res,next)=>{
      req.body.pictures = req.file.filename;
      const {id}=req.params;
      const sql_Emage_Update = `
      INSERT INTO pictures (user_id, Posts,is_profile_picture)
      VALUES (?,?,3);`;
      db.query(sql_Emage_Update,[id,req.body.pictures],(err,results)=>{
            if(err) return new AppErrorClass(500,err, statusText.FAIL)
            res.status(201).json({
                  status:statusText.SUCCESS,
                  data:req.body.pictures
            })
      })
})

const getAppPostsEmages=AsyncHandler(async(req,res,next)=>{
      const {id}=req.params;
      const sql_Emage_Update = `
      SELECT Posts FROM pictures WHERE user_id = ? AND is_profile_picture=3  ;
    `;
      db.query(sql_Emage_Update,[id],(err,results)=>{
            if(err) return new AppErrorClass(500,err, statusText.FAIL)
            res.status(201).json({
                  status:statusText.SUCCESS,
                  data:results
            })
      })
})




module.exports ={
      editProfile,
      editCover,
      insertPostEmage,
      getAppPostsEmages
}

