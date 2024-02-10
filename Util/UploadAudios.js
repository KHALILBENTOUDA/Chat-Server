const multer=require('multer')

const uploadAudios=(folder,name)=>{
    


    const Storage=multer.diskStorage({
   
        destination:function(req,file,cb){
            cb(null,`Uploads/${folder}`)
        },
        filename:function(req,file,cb){
            const ext=file.originalname.split('.')[1];
            const fileName=`${name}-${Date.now()}.${ext}`
            cb(null,fileName)
        }
    })


    const  upload=multer({
      Storage
    })

    return upload

}
module.exports = uploadAudios