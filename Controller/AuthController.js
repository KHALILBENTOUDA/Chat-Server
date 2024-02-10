const { db } = require("../Config/database");
const AppErrorClass = require("../Middlewares/AppErrorClass");
const AsyncHandler = require("../Middlewares/AsyncHandler");
const TokenGenerator = require("../Util/TokenGenerator");
const statusText = require("../Util/statusText");
const slugify = require("slugify");
const bcrypt = require("bcrypt");
const crypto=require('crypto');
const sendVerifyEmail = require("../Util/SendVerifyEmail");

const register = AsyncHandler(async (req, res, next) => {
  const createUserQuery = "INSERT INTO User(name, lastname, email, password, slug) VALUES (?, ?, ?, ?, ?)";
  const validateUserQuery = "SELECT email FROM User WHERE email = ?";
  
  const password = req.body.password;
  const confirmation = req.body.confirmPassword;
  const name = req.body.name;
  const lastname = req.body.lastname;

  // Confirm password
  if (password === confirmation) {
    // Slug
    const slugItems = `${name} ${lastname}`;
    const slug = slugify(slugItems, { lower: true });

    // Check if email already exists
    db.query(validateUserQuery, [req.body.email], (err, results) => {
      if (err) return next(new AppErrorClass(500, err, statusText.ERROR));
      if (results.length > 0) {
        return next(new AppErrorClass(401, 'Sorry, This Email Is Already Exist', statusText.FAIL));
      }

      // Hashing password
      bcrypt.hash(password, 10, async (hashError, hashedPassword) => {
        if (hashError) return next(new AppErrorClass(500, 'Error hashing password', statusText.ERROR));

        const values = [name, lastname, req.body.email, hashedPassword, slug];

        // Insert user into the database
        db.query(createUserQuery, values, async (userInsertError, userInsertResult) => {
          if (userInsertError) return next(new AppErrorClass(500, 'Error inserting user', statusText.ERROR));

          const user_id = userInsertResult.insertId;
          const verificationToken = crypto.randomBytes(20).toString('hex');
          const insertTokenQuery = "INSERT INTO verification_tokens (user_id, token) VALUES (?, ?)";

          // Insert verification token
          db.query(insertTokenQuery, [user_id, verificationToken], (tokenInsertError, tokenInsertResult) => {
            if (tokenInsertError) return next(new AppErrorClass(500, 'Error inserting verification token', statusText.ERROR));
            
            // Send verification email
            const link = `${req.protocol}://localhost:5173/user/${user_id}/verify/${verificationToken}`;
            

            // //
            console.log(link)
            sendVerifyEmail({
              email: req.body.email,
              subject: 'Verify your email address',
              main:`

            

              <main style="margin-top: 2rem;color:white">
              <h1 style="text-gray-700 dark:text-gray-200">Hi ${req.body.name},</h1>
      
              <p style="margin-top: 0.5rem; line-height: 1.5rem;font-weight: 600; font-size: 0.875rem;color:#eee;">
                   Verifiy your email address 
              </p>
      
              <p style="color:#eee;">
                  This code will only be valid for the next 5 minutes. If the code does not work, you can use this login verification link:
              </p>
              
              <button style="padding: 0.5rem 1.5rem; margin-top: 1rem; font-weight: 500; text-transform: capitalize; transition: background-color 0.3s; background-color: #b849eb; border-radius: 20px; border: none; color: white;">
              <a href="${link}" style="color: white; text-decoration: none; font-size: 13px; display: block;">
                Verify email
              </a>
            </button> 
              
              <p style="margin-top: 2rem; color: #ddd;">
                  Thanks, <br>
                  Matcha Team
              </p>
          </main>`
              
            })
              .then(() => {
                console.log('Email sent successfully');
                res.status(201).json({
                  status: statusText.SUCCESS,
                  message: 'An Email has been sent to your account. Please check your email',
                });
              })
              .catch((emailError) => {
                return next(new AppErrorClass(500, 'Error Sending Verification Email, Check Your Network'));
              });
          });
        });
      });
    });
  } else {
    return next(new AppErrorClass(401, 'Confirmation password is not correct', statusText.FAIL));
  }
});

const login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body)
  if (!email || !password) {
    return next(
      new AppErrorClass(401, "Email Or Password are Required", statusText.FAIL)
    );
  }

  // validate email
  // const ValidateUser = "SELECT email from User WHERE email = ?";

  // db.query(ValidateUser,[email],async(err,result)=>{

  // })

  // if (ValidateUser) {
  //   return next(
  //     new AppErrorClass(401, "Sorry This Email Is Exist", statusText.FAIL)
  //   );
  // }




  const results = await new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM User WHERE email = ?",
      [email],
      (error, results) => {
        if (results.length === 0) {
          reject(new AppErrorClass(500,"Sorry This Email Is Not  Existed", statusText.ERORR));
        } else {
          resolve(results[0]);
        }
      }
    );
  });


  //validate the password
  const user = results;
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return next(
      new AppErrorClass(500, "password is not correct", statusText.ERORR)
    );
  }
//   verify valide token has sand by email

  if(user.is_verified === 0){
      const verificationToken = crypto.randomBytes(20).toString('hex');
      db.query( "SELECT * FROM verification_tokens WHERE user_id = ?",[user.id],(error,results)=>{
            if(error){
                  return next( new AppErrorClass(404,'Invalid select data',statusText.FAIL))   
            }
            if(results){

                  // resend token
                  const insertTokenQuery = "UPDATE verification_tokens SET token = ? WHERE user_id = ?";
                  db.query(insertTokenQuery, [verificationToken,user.id],async (tokenInsertError, tokenVerify) => {
                        if (tokenInsertError) {
                          return next( new AppErrorClass(401,'Error inserting verification toke',statusText.FAIL))   
                        }
                        try{
                          const link =`${req.protocol}://localhost:5173/user/${user.id}/verify/${verificationToken}`
                              await sendVerifyEmail(
                                    {
                                          email:user.email,
                                          subject:'Verifiy your email address',
                                          main:`

                                          <main style="margin-top: 2rem;color:white">
                                          <h2 style="text-gray-700 dark:text-gray-200">Hi ${user.name},</h2>
                                  
                                          <p style="margin-top: 0.5rem; line-height: 1.5rem;font-weight: 600;">
                                               Verifiy your email address 
                                          </p>
                                  
                                          <p style="mt-4 leading-loose text-gray-600 dark:text-gray-300">
                                              This code will only be valid for the next 5 minutes. If the code does not work, you can use this login verification link
                                          </p>
                                          
                                          <button style="padding: 0.5rem 1.5rem; margin-top: 1rem; font-weight: 500; text-transform: capitalize; transition: background-color 0.3s; background-color: #b849eb; border-radius: 20px; border: none; color: white;">
                                          <a href="${link}" style="color: white; text-decoration: none; font-size: 13px; display: block;">
                                            Verify email
                                          </a>
                                        </button>
                                        
                                        
                                          
                                          <p style="margin-top: 2rem; color: #ddd;">
                                              Thanks, <br>
                                              Matcha Team
                                          </p>
                                      </main>
                                      
                                          `
                                    }
                              )
                              console.log(results)
                              res.status(201).json({
                                status: statusText.SUCCESS,
                                message: "An Email has been sent to your account please check your email",
                              });
            
                        }catch(e){

                          return next( new AppErrorClass(401,'Check validate your email',statusText.FAIL))   
                        }
                  })
            }
      })
}else{
  // validate 
  if (user.email && match) {
    const token = TokenGenerator({
      id: user.id,
      email: user.email,
      username: user.name,
      lastname: user.lastname,
      slug:user.slug
    });
    const loginuser={
      user:user.id,
      slug:user.slug,
      name:user.name,
      lastname:user.lastname,
      profilecomplate:user.profilecomplate
    }
    res.status(200).json({
      status: statusText.SUCCESS,
      token:token,
      user:loginuser,
      message: "login successful",
    });
  } else {
    return next(
      new AppErrorClass(
        401,
        "email or password is not correct",
        statusText.ERORR
      )
    );
  }
}

  // add in token and cookie
});

const logout = AsyncHandler(async (req, res, next) => {
  res.clearCookie("token").status(200).json({
    status: statusText.SUCCESS,
    message: "user logged out successfully",
  });
   
});

const VerifyToken=AsyncHandler(async (req,res,next) => {
      const {token} = req.params;
      const findUserQuery = "SELECT user_id FROM verification_tokens WHERE token = ?"; 
      // find user_id  tokenUser
     db.query(findUserQuery,[token],(err,results)=>{
            if(err){
                  return next( new AppErrorClass(401,'Error finding user with the verification token',statusText.ERORR))
            }

            if (results.length === 0) {
                  return next( new AppErrorClass(404,'Invalid verification token or user not found',statusText.FAIL))
            }
            const userId = results[0].user_id;
            // Update the user's verification status

            const updateValide = "UPDATE User SET is_verified = 1 WHERE id = ?";
            db.query(updateValide, [userId], (updateError, updateResults) => {
                  if (updateError) {
                        return next( new AppErrorClass(404,'Error updating user verification status',statusText.FAIL))
                  }


                  // delete the token from the database

                  const deleteTokenQuery = "DELETE FROM verification_tokens WHERE token = ?";
                  db.query(deleteTokenQuery, [token], (deleteError, deleteResults) => {
                  if (deleteError) {
                        return next( new AppErrorClass(404,'Error deleting verification token',statusText.FAIL))
                  }

                  // exwcute the code 
                  res.status(200).json({ status: statusText.SUCCESS, message: 'Email verified successfully' });


                  })
            })
      })
})

const ComplateProfile = AsyncHandler(async (req, res, next) => {
  const{gender,biography,profileComplete,age}=req.body
  const id = req.params.id;


  req.body.pictures = req.file.filename;
  
  const sql_Emage = 'INSERT INTO pictures (user_id, picture_url, is_profile_picture) VALUES (?, ?, ?)';
  const sql_Emage_Update = 'UPDATE  pictures SET picture_url= ?  WHERE user_id =?';
  const sql_Profile = 'UPDATE User SET gender_id = ?, biography = ?, profilecomplate = ? ,birthdate=? WHERE id = ?';
  const sql_check_avatar='SELECT picture_url  FROM pictures WHERE user_id =? AND is_profile_picture = ?'
  	
  // inert user
  db.query(sql_Profile,[gender,biography,'1',age,id],(err,results)=>{
    if(err) 
    {
      return next( new AppErrorClass(401,'Internal server',statusText.FAIL))   
    }
  })

  // check if email exist or not


  db.query(sql_check_avatar,[id,1],(err,results)=>{
    if(err) 
    {
      return next( new AppErrorClass(401,'Internal server',statusText.FAIL))   
    }

    if(results.length > 0){
      db.query(sql_Emage_Update,[req.body.pictures,id],(err,results)=>{
        if(err) 
        {
          return next( new AppErrorClass(401,'Internal server',statusText.FAIL))   
        }
        res.status(200).json({
          status:statusText.SUCCESS,
          message:'emage updated successfully'
        })
      })
    }else{
      db.query(sql_Emage,[id,req.body.pictures,1],(err,results)=>{
        if(err) 
        {
          return next( new AppErrorClass(401,'Internal server',statusText.FAIL))   
        }
        res.status(200).json({
          status:statusText.SUCCESS,
          message:'emage added successfully'
        })
      })
    }
    
  })
});

const Interests = AsyncHandler(async (req, res, next) => {

  try {
    const interst_id = JSON.parse(req.body.inter);

    const user_id = req.params.id;
    const sql_user_interest = 'INSERT IGNORE INTO user_interests (user_id, interest_id) VALUES (?, ?)';
    const promises = [];

    interst_id.forEach((ele) => {
      const inter_value = [user_id, ele];
      const queryPromise = new Promise((resolve, reject) => {
        db.query(sql_user_interest, inter_value, (err, result) => {
          if (err) {
  
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      promises.push(queryPromise);
    });

    // Wait for all queries to complete
    await Promise.all(promises);

    res.status(200).json({
      status: statusText.SUCCESS,
    });
  } catch (err) {
    return next(new AppErrorClass(401, 'error save interests', statusText.FAIL));
  }
});

const resetpassword =AsyncHandler(async(req,res,next) => {
  const {email} = req.body;

  
  const  sql_user='SELECT * FROM User WHERE email = ?';
  const  sql_otp='INSERT INTO otp (user_id, otp, otp_expiry) VALUES (?, ?, ?)';
  const value_user=[email];

  db.query(sql_user,value_user,(err,results)=>{
    if(err) return next(new AppErrorClass(500,err.message,statusText.ERORR))

    if(results.length === 0) return  next(new AppErrorClass(400,'User Not Found!',statusText.FAIL))

    // generate otp forn user
    const user_Id = results[0].id;
    const otp = Math.floor(100000+Math.random()*900000)
    const otp_expiry=new Date();
    otp_expiry.setMinutes(otp_expiry.getMinutes() + 5);
    const value_otp=[user_Id,otp,otp_expiry]

    db.query(sql_otp,value_otp,async(err,insetResules)=>{
       if(err) return next(new AppErrorClass(500,'Error Insert OTP',statusText.ERORR))

       await sendVerifyEmail({
        email:email,
        subject: 'Password Reset Code',
        message: `Your new Code is: ${otp}`,
       })

       res.status(200).json({
        status:statusText.SUCCESS,
        message:'Password reset initiated successfully'
       })
    });
  });
});

const updatepassword = AsyncHandler(async (req, res, next) => {
  const { otp, email, newPassword, confirmNewPassword } = req.body;
  const sqlOTP = 'SELECT * FROM otp WHERE user_id = ? AND otp = ? AND otp_expiry > NOW()';
  const sqlUser = 'SELECT * FROM User WHERE email = ?';
  const sqlUpdate = 'UPDATE User SET password = ? WHERE id = ?';
  const sqlDeleteOTP = 'DELETE FROM otp WHERE user_id = ?';
  const valueUser = [email];

  // check if user
  db.query(sqlUser, valueUser, (err, results) => {
    if (err) return next(new AppErrorClass(400,err, statusText.FAIL));
    if (results.length === 0) return next(new AppErrorClass(400, 'User Not Found!', statusText.FAIL));
    const userId = results[0].id;
    const valueOTP = [userId, otp];

    // verify OTP
    db.query(sqlOTP, valueOTP, async (err, otpResults) => {
      if (otpResults.length === 0) return next(new AppErrorClass('Invalid or expired Code', 400)); 
      // matching the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const valuePass = [hashedNewPassword, userId];

      // update the password
      db.query(sqlUpdate, valuePass, (err, updateResults) => {
        if (updateResults.affectedRows === 0) {
          return next(new AppErrorClass(400, 'Failed to update password', statusText.FAIL));
        }

        const valueDeleteOTP = [otpResults[0].id];
        // delete OTP
        db.query(sqlDeleteOTP, valueDeleteOTP, (err, deleteResults) => {
          if (deleteResults.affectedRows === 0) {
            return next(new AppErrorClass(400, 'Failed to delete OTP', statusText.FAIL));
          }
          res.status(200).json({
            status: statusText.SUCCESS,
            message: 'Password updated successfully',
          });
        });
      });
    });
  });
});

const updateUserprofile = AsyncHandler(async (req, res, next) => {
  const { name, lastname, birthdate, gender, biography } = req.body;
  const userId = req.params.id;

  // Constructing the SQL query dynamically based on the provided data
  const updateFields = [];
  const updateValues = [];

  if (name) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }

  if (lastname) {
    updateFields.push('lastname = ?');
    updateValues.push(lastname);
  }

  if (birthdate) {
    updateFields.push('birthdate = ?');
    updateValues.push(birthdate);
  }

  if (gender) {
    updateFields.push('gender_id = ?');
    updateValues.push(gender);
  }

  if (biography) {
    updateFields.push('biography = ?');
    updateValues.push(biography);
  }

  // Slug generation
  const slugItems = `${name || ''} ${lastname || ''}`;
  const slug = slugify(slugItems, { lower: true });

  // Adding slug to the fields and values
  updateFields.push('slug = ?');
  updateValues.push(slug);

  // The final SQL query
  const updateUserQuery = `
    UPDATE User
    SET
      ${updateFields.join(', ')}
    WHERE
      id = ?
  `;

  const finalValues = [...updateValues, userId];

  db.query(updateUserQuery, finalValues, (err, results) => {
    if (err) return next(new AppErrorClass(400, err, statusText.FAIL));

    res.status(200).json({
      status: statusText.SUCCESS,
      message: 'Your profile updated successfully',
    });
  });
});
 


module.exports = {
  register,
  login,
  logout,
  VerifyToken,
  ComplateProfile,
  Interests,
  updatepassword,
  resetpassword,
  updateUserprofile
};


// SELECT
// User.id,
// User.email,
// User.name,
// User.lastname,
// gender.gender_name,
// GROUP_CONCAT(interests.interest_name) AS user_interests,
// pictures.picture_url,
// pictures.is_profile_picture,
// User.is_verified
// FROM
// User
// JOIN
// gender ON gender.gender_id = User.gender_id
// LEFT JOIN
// user_interests ON User.id = user_interests.user_id
// LEFT JOIN 
// interests ON user_interests.interest_id = interests.interest_id
// LEFT JOIN
// pictures ON User.id = pictures.user_id
// GROUP BY
// User.id;




// db.query(CreateUser, values, (userInsertError, userInsertResult) => {
//       if (userInsertError) {
//         console.error(userInsertError);
//         return res.status(500).json({ error: 'Error inserting user' });
//       }
    
//       const user_id = userInsertResult.insertId;
    
//       const verificationToken = crypto.randomBytes(20).toString('hex');
//       const insertTokenQuery = "INSERT INTO verification_tokens (user_id, token) VALUES (?, ?)";
    
//       db.query(insertTokenQuery, [user_id, verificationToken], async (tokenInsertError, tokenInsertResult) => {
//         if (tokenInsertError) {
//           console.error(tokenInsertError);
//           return res.status(500).json({ error: 'Error inserting verification token' });
//         }
    
//         try {
//           const message = `Click the following link to verify your email: ${req.protocol}://${req.get('host')}/api/v1/${user_id}/verify/${verificationToken}`;
    
//           await sendVerifyEmail({
//             email: req.body.email,
//             subject: 'Verify your email address',
//             message: message,
//           });
    
//           console.log('Email sent successfully');
//           res.status(201).json({
//             status: statusText.SUCCESS,
//             message: 'An email has been sent to your account. Please check your email.',
//           });
//         } catch (emailError) {
//           console.error(emailError);
//           return next(new AppErrorClass(500, 'Error sending verification email'));
//         }
//       });
//     });
    

