var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "localhost",   
    user: "root",    
    password: "root",   
    database: "serhantconstruction"
  });

  conn.connect((err)=> {
    if(!err)
        console.log('Successfully Connected to Serhant Construction Payroll Database');
    else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
    });
    
module.exports = conn;