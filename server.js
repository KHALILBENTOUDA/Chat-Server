require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("node:path");
const cors = require("cors");
const io = require('socket.io')(8800, {
    cors: {
      origin: "http://localhost:5173",
    }
  });
  
const http = require('http');
const AuthRoutes = require("./Routes/authRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const LocationRoutes = require("./Routes/LocationRoutes");
const UserInterest = require("./Routes/InterstRoutes");
const notificationRoute = require("./Routes/notificationRoutes");
const MessageRoutes = require("./Routes/MessageRoutes");
const ViewRoutes = require("./Routes/viewRoutes");
const UserRoutes = require("./Routes/UserRoutes");
const EmagesRoutes = require("./Routes/EmageRoutes");
const statusText = require("./Util/statusText");
const AppErrorClass = require("./Middlewares/AppErrorClass");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;


let activeUsers = [];
io.on("connection", (socket) => {
  socket.on('new_user', (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id
      });
    }
    io.emit('get_users', activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit('get_users', activeUsers);
  });

  socket.on('typing',(data)=>{
    socket.broadcast.emit('typin_status',{...data,status:data})
  });

  socket.on('stop_typing',()=>{
    socket.broadcast.emit('typin_status_stop',{status:false})
  });

  socket.on('sendMessage', (data) => {
    const { resiverId } = data; // Assuming you have a 'message' property
    const user = activeUsers.find((user) => user.userId === resiverId);
    if (user) {
      io.to(user.socketId).emit('recieve-message',{...data,created_at:new Date(),isRead:false});
    } else {
    }
  });
});

// Middleware setup
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Routes setup
app.use('/api/v1',AuthRoutes)
app.use('/api/v1/user',UserRoutes)
app.use('/api/v1/chat',ChatRoutes)
app.use('/api/v1/intrestes',UserInterest)
app.use('/api/v1/location',LocationRoutes)
app.use('/api/v1/message',MessageRoutes)
app.use('/api/v1/view',ViewRoutes)
app.use('/api/v1/Emages',EmagesRoutes)
app.use('/api/v1/notification',notificationRoute)
app.use('/uploads',express.static(path.join(__dirname, 'uploads')))

// Routes not found 
app.all('*',(req,res,next)=>{
  next(new AppErrorClass(404,'Page Not Found',statusText.FAIL))
})

// Error handling middleware
app.use((error,req,res,next)=>{
  const statusText=error.statusText || "error"
  const status=error.status || 500
  res.status(status).json({
      status: statusText,
      message:error.message,
      code:status,
  })
})

// Start server
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection Error :", err);
  server.close(() => {
    console.error("Server shut down due to unhandled rejection.");
    process.exit(1);
  });
});
