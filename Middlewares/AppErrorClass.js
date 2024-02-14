class AppErrorClass extends Error{
      constructor(status,message,statusTest){
            super();
            this.status = status;
            this.message = message;
            this.statusTest = statusTest;
      }
}
module.exports = AppErrorClass;