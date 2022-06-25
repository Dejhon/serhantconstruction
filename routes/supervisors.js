const { Router } = require('express');
var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

/** THIS BLOCK OF CODE DISPLAYS EMPLOYEE INFORMATION**/
router.get('/', (req, res)=>{
    let sql = `SELECT emp.id AS ID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    dp.name AS Department, sp.first_nm AS Supervisor_FirstName FROM serhantconstruction.employees 
    AS emp JOIN serhantconstruction.departments AS dp ON emp.department_id = dp.id JOIN 
    serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id WHERE sp.first_nm like 
    '%${req.session.username}%'`

    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('employees',{
        title:"Employee Page",
        data: rows
    });
  });
});
/*****************************************************/

/**THIS BLOCK OF CODE ADDS AND DELETES EMPLOYEE INFORMATION**/
router.get('/attendance', (req, res)=>{
  let sql = "SELECT * FROM departments"
      
     conn.query(sql, (err, rows)=>{
      if(err) throw err
      res.render('addEmployees',{
        title: "Add Employee Form",
        data: rows
      });
   });
});     

router.post('/post', (req,res)=>{

    let udata = {
                 user_type_id:2,
                 user_nm: req.body.f_nm,
                 password: req.body.password
                }

    let data = {
                 first_nm: req.body.f_nm,
                 last_nm: req.body.l_nm,
                 department_id: req.body.dept
               }

    let sql = "INSERT INTO employees SET ?"
    let usql = "INSERT INTO users SET ?"
    
    conn.query(sql, data, (err, rows)=>{
        if(err) throw err;
        conn.query(usql, udata, (err, rows)=>{
            if(err) throw err
            res.redirect('/supervisor')
        });
    });
});

router.get('/deleteEmployee/:id', (req, res)=>{
   let sql = `DELETE FROM employees WHERE ID = ${req.params.id}`

   conn.query(sql,(err, rows)=>{
       if(err) throw err
       res.redirect('/supervisor')
   });
});
/*********************************************/

/**THIS BLOCK OF CODE ADDS EMPLOYEE ATTENDANCE INFORMATION**/
router.get('/attendance/:id', (req, res)=>{
      let sql = `SELECT emp.id AS ID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,emp.department_id 
      AS Dep_ID,dp.standard_rate AS Standard, dp.overtime_rate AS Overtime,
      dp.name AS Department, sp.first_nm AS Supervisor_FirstName FROM serhantconstruction.employees 
      AS emp JOIN serhantconstruction.departments AS dp ON emp.department_id = dp.id JOIN 
      serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id WHERE emp.id = ${req.params.id}`

      conn.query(sql, (err, rows)=>{
          if(err) throw err
          res.render('attendance',{
              data: rows[0]
          });
      });
  });
  
  router.post('/attendanceData', (req, res)=>{
      
     let dt = new Date();
     let month = dt.getMonth() +1;
     let year = dt.getFullYear();
     let daysInMonth = new Date(year, month, 0).getDate();
     let dayswork = daysInMonth - req.body.abs_day
    //  let hrsWork = req.body.tot_dats_wrk * 8
    //  let days_abs = daysInMonth - req.body.days_wrk;
  
      let data = {
                   emp_id: req.body.id,
                   pay_start_dt: req.body.st_dt,
                   pay_end_dt: req.body.end_dt,
                   days_absent: req.body.abs_day,
                   total_days_wrk: dayswork,
                   standard_hrs_wrk: req.body.stnd_tm,
                   overtime_hrs_wrk: req.body.over_tm
                 }
      
      let sql = "INSERT INTO attendance SET ?"
      
      conn.query(sql, data, (err, rows)=>{
          if(err) throw err
          // change route to attendance table
          res.redirect("/supervisor");
      });
  });
  
/***********************************************************/

/**THIS BLOCK OF CODE VIEWS, AND EDITS EMPLOYEE'S ATTENDANCE RECORD**/
router.get('/attendanceDets', (req, res)=>{
  let sql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname ,att.id AS ID,
  date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') AS PayEnd, 
  att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays,
  att.standard_hrs_wrk AS StandardHours, att.overtime_hrs_wrk AS
  OvertimeHours, dp.standard_rate AS StandardRate, dp.overtime_rate
  AS OvertimeRate FROM serhantconstruction.attendance AS att JOIN 
  serhantconstruction.employees AS emp ON att.emp_id = emp.id JOIN
  serhantconstruction.departments AS dp ON emp.id = dp.id;`

  conn.query(sql, (err, rows)=>{
    if(err) throw err
    res.render('attendanceTable',{
      data:rows
    });
  });
});

router.get('/attendanceEdit/:id', (req, res)=>{
  let sql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname , att.id AS ID,
  date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') AS PayEnd, 
  att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays,
  att.standard_hrs_wrk AS StandardHours, att.overtime_hrs_wrk AS
  OvertimeHours, dp.standard_rate AS StandardRate, dp.overtime_rate
  AS OvertimeRate FROM serhantconstruction.attendance AS att JOIN 
  serhantconstruction.employees AS emp ON att.emp_id = emp.id JOIN
  serhantconstruction.departments AS dp ON emp.id = dp.id WHERE att.id = ${req.params.id}`

  conn.query(sql, (err, rows)=>{
    if(err) throw err
    res.render('attendanceEdit',{
      data: rows[0]
    });
  });
});

router.post('/attendanceUpdate',(req, res)=>{
    let id = req.body.id;
    let sql = `UPDATE attendance SET overtime_hrs_wrk = ${req.body.new_overtime} WHERE id =${id}`

    conn.query(sql, (err, rows)=>{
      if(err) throw err
      res.redirect('/supervisor/attendanceDets')
    });
});
/********************************************************************/
module.exports = router