const mysql=require('mysql2')
const db=mysql.createConnection({
    host:  process.env.DB_HOST,
    user:  process.env.DB_USER,
     password: process.env.DB_PASS,
    port:  process.env.DB_PORT,
     database: process.env.DB_NAME,
      
     charset: 'utf8mb4',
  })
  db.connect((err)=>{
      if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
      }
      console.log('connecting to MySQL')
  })
module.exports = {db}





