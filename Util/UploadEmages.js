const multer=require('multer')
const AppErrorClass = require('../Middlewares/AppErrorClass')
const statusText = require("../Util/statusText");

const uploadFunction=(folder,name)=>{
    

    const diskStorage=multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,`uploads/${folder}`)
        },
        filename:function(req,file,cb){
            const ext=file.mimetype.split('/')[1];
            const fileName=`${name}-${Date.now()}.${ext}`
            cb(null,fileName)
        }
    })

    const filefilter=(req,file,cb)=>{
        const imageType=file.mimetype.split('/')[0];
        if(imageType =='image'){
            return cb(null,true)
        }else{
            return cb(new AppErrorClass('this file is not image',statusText.FAIL,400),false)
        }
    }
    const  upload=multer({
        storage:diskStorage,
        filefilter
    })

    return upload

}
module.exports = uploadFunction