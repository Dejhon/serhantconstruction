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
     let maxWorkHrs = 160;
     overtimeHrs = 0;

     if(req.body.stnd_tm > maxWorkHrs){
        overtimeHrs = req.body.stnd_tm - maxWorkHrs;
     }
    //  let hrsWork = req.body.tot_dats_wrk * 8
    //  let days_abs = daysInMonth - req.body.days_wrk;
  
      let data = {
                   emp_id: req.body.id,
                   pay_start_dt: req.body.st_dt,
                   pay_end_dt: req.body.end_dt,
                   days_absent: req.body.abs_day,
                   total_days_wrk: dayswork,
                   standard_hrs_wrk: req.body.stnd_tm,
                   overtime_hrs_wrk: overtimeHrs
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
  let sql = `SELECT att.id AS ID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
  date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') AS PayEnd, 
  att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays, att.standard_hrs_wrk AS StandardHours, 
  att.overtime_hrs_wrk AS OvertimeHours, dp.standard_rate AS StandardRate, dp.overtime_rate AS OvertimeRate,
  sp.first_nm AS Supervisor FROM serhantconstruction.attendance AS att JOIN serhantconstruction.employees AS
  emp ON att.emp_id = emp.id JOIN serhantconstruction.departments AS dp ON emp.department_id= dp.id JOIN 
  serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id WHERE sp.first_nm = '${req.session.username}'`

  conn.query(sql, (err, rows)=>{
    if(err) throw err
    res.render('attendanceTable',{
      data:rows
    });
  });
});

router.get('/attendanceEdit/:id', (req, res)=>{
  let sql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname, att.id AS ID,
  date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') AS PayEnd, 
  att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays, att.standard_hrs_wrk AS StandardHours, 
  att.overtime_hrs_wrk AS OvertimeHours, dp.standard_rate AS StandardRate, dp.overtime_rate AS OvertimeRate 
  FROM serhantconstruction.attendance AS att JOIN serhantconstruction.employees AS emp ON att.emp_id = emp.id 
  JOIN serhantconstruction.departments AS dp ON emp.department_id = dp.id WHERE att.id = ${req.params.id}`

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

/**THIS BLOCK OF CODE CALCULATE SALARY FOR EMPLPYEES**/
router.get('/pay/:id', (req, res)=>{
     let sql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname, att.id AS ID,
     date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') 
     AS PayEnd,att.emp_id AS empID, att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays, att.standard_hrs_wrk 
     AS StandardHours, att.overtime_hrs_wrk AS OvertimeHours,dp.name AS Department, dp.standard_rate AS StandardRate,
     dp.overtime_rate AS OvertimeRate FROM serhantconstruction.attendance AS att JOIN
     serhantconstruction.employees AS emp ON att.emp_id = emp.id JOIN serhantconstruction.departments 
     AS dp ON emp.department_id = dp.id WHERE att.id = ${req.params.id}`

     conn.query(sql, (err, rows)=>{
      if(err) throw err
      res.render('empSalary', {
        data:rows
      })
    });
});

router.post('/payroll', (req, res)=>{

  let standardPay = ((req.body.stnd_rt * req.body.stnd_hrs) * req.body.totalDays).toFixed(2);
  let overtimePay = ((req.body.over_rt * req.body.overtime_hrs) * req.body.totalDays).toFixed(2);
  let salary = (parseInt(standardPay) + parseInt(overtimePay)).toFixed(2)
  let data = {
               employee_id: req.body.emp_id,
               pay_start_dt: req.body.start_dt,
               pay_end_dt: req.body.end_dt,
               standard_pay: standardPay,
              //  overtime_pay: overtimePay,
               salary: salary
             }

    conn.query("INSERT INTO payroll SET ?", data, (err, rows)=>{
      if(err) throw err
      res.redirect('/supervisor')
    })
})
/*****************************************************/

/**THIS BLOCK OF CODE DISPLAYS SALARY FOR ALL EMPLOYEES WITH A PARTICULAR DEPARTMENT**/
router.get('/salary', (req, res)=>{
  let sql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname, sp.first_nm AS Supervisor, 
  dp.name AS department, date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, 
  date_format(p.pay_end_dt, '%Y-%m-%d') AS PayEnd, p.standard_pay AS StandardPay,
  p.overtime_pay AS OvertimePay, p.salary AS Salary FROM serhantconstruction.payroll AS p 
  JOIN serhantconstruction.employees  AS emp ON p.employee_id = emp.id JOIN 
  serhantconstruction.departments AS dp ON emp.department_id = dp.id JOIN 
  serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id WHERE sp.first_nm = '${req.session.username}'`

  conn.query(sql, (err, rows)=>{
    if(err) throw err
    res.render('salaries',{
      data:rows
    })
  })

})

/*************************************************************************************/
module.exports = router