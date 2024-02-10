const AsyncHandler = require("../Middlewares/AsyncHandler");
const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const statusText = require("../Util/statusText");
const getUserLoaciton=AsyncHandler(async(req,res,next)=>{
      const {latitude,longitude,user_id,UserShoies}=req.body
      const KEY ='e23d3b2dbcff4fb4af2564f67bcd0f34'
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${KEY}&q=${latitude}+${longitude}&pretty=1`);
      const data = await response.json();
      const InsertOrupdateUserQuery =`
      INSERT INTO location (user_id, country, city, neighborhood, latitude, longitude,UserShoies)
      VALUES (?, ?, ?, ?, ?, ?,?)
      ON DUPLICATE KEY UPDATE
        country = VALUES(country),
        city = VALUES(city),
        neighborhood = VALUES(neighborhood),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        UserShoies=VALUES(UserShoies);
    `;



    if (data.results && data.results.length > 0) {
          const locationDetails = {
                country: data.results[0].components.country,
                city: data.results[0].components.city,
                neighborhood: data.results[0].components.neighbourhood,
                latitude:latitude ,
                longitude: longitude,
            };      
                  const locationValues=[user_id,locationDetails.country, locationDetails.city, locationDetails.neighborhood,latitude,longitude,UserShoies]
                  db.query(InsertOrupdateUserQuery,locationValues,(err,results)=>{  
                        if(err) return next( new AppErrorClass(500, 'error inssrting location record of user ', statusText.ERORR))
                        db.query('SELECT * FROM location WHERE user_id =?',[user_id],(err,results)=>{
                              if(err) return next( new AppErrorClass(500, 'error select localisation ', statusText.ERORR))
                              res.status(201).json({
                                    status:statusText.SUCCESS,
                                    data:results      
                              })
                        })
                       
                  })
      }else {
             res.status(404).json({ error: 'Location details not found' });
      }

     
})
module.exports ={
      getUserLoaciton
}

