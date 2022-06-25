var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

router.get('/',(req, res)=>{
    res.render('paycycle')
})

router.post('/viewpay', (req, res)=>{

    let Esql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay
    AS StandardPay, p.overtime_pay AS OvertimePay, p.salary AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id WHERE emp.first_nm = '${req.session.username}'
    AND p.pay_start_dt = '${req.body.start_dt}' AND p.pay_end_dt = '${req.body.end_dt}'`

    let Asql = `SELECT att.id AS ID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(att.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(att.pay_end_dt, '%Y-%m-%d') AS PayEnd, 
    att.days_absent AS DaysAbsent, att.total_days_wrk AS TotalDays, att.standard_hrs_wrk AS StandardHours, 
    att.overtime_hrs_wrk AS OvertimeHours, dp.standard_rate AS StandardRate, dp.overtime_rate AS OvertimeRate,
    sp.first_nm AS Supervisor FROM serhantconstruction.attendance AS att JOIN serhantconstruction.employees AS
    emp ON att.emp_id = emp.id JOIN serhantconstruction.departments AS dp ON emp.department_id= dp.id JOIN 
    serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id WHERE emp.first_nm = '${req.session.username}'
    AND att.pay_start_dt = '${req.body.start_dt}' AND att.pay_end_dt = '${req.body.end_dt}'`

    conn.query(Esql, (err, Erows)=>{
        if(err) throw err
        conn.query(Asql, (err, Arows)=>{
            if(err) throw err
            res.render('salaryAnalysis',{
                Edata: Erows,
                Adata: Arows
            })
        })
    })

})

module.exports = router