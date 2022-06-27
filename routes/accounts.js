var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

/**THIS BLOCK OF CODE VIEWS EMPLOYEES**/
router.get('/', (req, res)=>{
    let sql = `SELECT emp.id AS ID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    dp.name AS Department, sp.first_nm AS Supervisor_FirstName FROM serhantconstruction.employees 
    AS emp JOIN serhantconstruction.departments AS dp ON emp.department_id = dp.id JOIN 
    serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id `

    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('viewAttendance',{
        title:"Employee Page",
        data: rows
    });
  });
});
/*********************************************************************/

/**THIS BLOCK OF CODE VIEW EMPLOYESS ATTENDACE BY ID**/
router.get('/attendance/:id', (req, res)=>{
    let sql = `SELECT att.id AS ID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
        date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') AS PayEnd, 
        att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays, att.standard_hrs_wrk AS StandardHours, 
        att.overtime_hrs_wrk AS OvertimeHours, dp.standard_rate AS StandardRate, dp.overtime_rate AS OvertimeRate,
        sp.first_nm AS Supervisor FROM serhantconstruction.attendance AS att JOIN serhantconstruction.employees AS
        emp ON att.emp_id = emp.id JOIN serhantconstruction.departments AS dp ON emp.department_id= dp.id JOIN 
        serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id WHERE emp.id = ${req.params.id}`
      
        conn.query(sql, (err, rows)=>{
          if(err) throw err
          res.render('viewAttendanceId',{
            data:rows[0]
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
     let maxWorkHrs = 160;
     overtimeHrs = 0;

     if(req.body.stnd_hrs > maxWorkHrs){
        overtimeHrs = parseInt(req.body.stnd_hrs - maxWorkHrs);
     }

    let id = req.body.id;
    let sql = `UPDATE attendance SET days_absent = ${req.body.days_abs},standard_hrs_wrk =${req.body.stnd_hrs}, overtime_hrs_wrk=${overtimeHrs} WHERE id =${id}`

    conn.query(sql, (err, rows)=>{
      if(err) throw err
      res.redirect('/accountant')
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
              overtime_pay: overtimePay,
              salary: salary
            };

let payslip = {
    emp_first_nm: req.body.f_nm,
    emp_last_nm:req.body.l_nm,
    paycycle_start: req.body.start_dt,
    paycycle_end: req.body.end_dt,
    salary: salary
}

   conn.query("INSERT INTO payroll SET ?", data, (err, rows)=>{
     if(err) throw err
     conn.query("INSERT INTO payslip SET?", payslip, (err,rows)=>{
        if(err) throw err
        res.redirect('/accountant')
     })
   })
})
/*****************************************************/

/**THIS ROUTE SEARCHES FOR EMPLOYEE PAY SLIP**/
router.get('/search', (req, res)=>{
    res.render('slipSearch')
})


router.post('/slips', (req, res)=>{
let sql=`SELECT  ps.emp_first_nm AS Firstname, ps.emp_last_nm AS Lastname,
date_format(ps.paycycle_start, '%Y-%m-%d') CycleStart, date_format(ps.paycycle_end, '%Y-%m-%d') AS CycleEnd, ps.salary 
AS Salary FROM serhantconstruction.payslip AS ps WHERE ps.emp_first_nm LIKE '%${req.body.f_nm}%'
AND ps.emp_last_nm LIKE '%${req.body.l_nm}%'`

    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('slip',{
            data:rows
        })
    })
})
/*********************************************/

/**THIS BLOCK GIVES SALARY BREAKDOWN USING AGGREGATE FUNCTIONS**/
router.get('/viewSalaryBreakdown', (req, res)=>{
    res.render("dateRange")
})

router.post('/breakdown',(req, res)=>{
    let maxsql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay
    AS StandardPay, p.overtime_pay AS OvertimePay, max(p.salary) AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id WHERE p.pay_start_dt = '${req.body.start_dt}'
    AND p.pay_end_dt = '${req.body.end_dt}'`

    let minsql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay
    AS StandardPay, p.overtime_pay AS OvertimePay, min(p.salary) AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id WHERE p.pay_start_dt = '${req.body.start_dt}'
    AND p.pay_end_dt = '${req.body.end_dt}'`

    let total =`SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay
    AS StandardPay, p.overtime_pay AS OvertimePay, sum(p.salary) AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id WHERE p.pay_start_dt = '${req.body.start_dt}'
    AND p.pay_end_dt = '${req.body.end_dt}'`

    conn.query(maxsql, (err, maxrows)=>{
        if(err) throw err
        conn.query(minsql, (err, minrows)=>{
            if(err) throw err
            conn.query(total, (err, Trows)=>{
                if(err) throw err
                res.render('breakdown',{
                    maxData:maxrows,
                    minData:minrows,
                    total: Trows
                });
            });
        });
    });
});
/**********************************************************/

module.exports = router