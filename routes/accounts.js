var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

router.get('/', (req, res)=>{
    let sql = `SELECT p.id AS pID, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay AS StandardPay, p.overtime_pay AS OvertimePay, p.salary AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id `

    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('allSalaries',{
            data:rows
        })
    })
})

router.get('/payslip/:id', (req, res)=>{
    let sql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay AS StandardPay, p.overtime_pay AS OvertimePay, p.salary AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id WHERE p.id =${req.params.id}`

    conn.query(sql,(err,rows)=>{
        if(err) throw err
        res.render('payslipForm',{
            data:rows[0]
        })
    })
})

router.post('/generate', (req, res)=>{
    let data = {
                 emp_first_nm: req.body.firstname,
                 emp_last_nm: req.body.lastname,
                 paycycle_start: req.body.start,
                 paycycle_end: req.body.end,
                 salary: req.body.salary
    }

    conn.query("INSERT INTO payslip SET ?", data, (err, rows)=>{
        if(err) throw err
        res.redirect('/accountant/')
    })
})

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


router.get('/viewSalaryBreakdown', (req, res)=>{
    res.render("dateRange")
})

router.post('/breakdown',(req, res)=>{
    let Esql = `SELECT emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    date_format(p.pay_start_dt, '%Y-%m-%d') AS PayStart, date_format(p.pay_end_dt, '%Y-%m-%d')
    AS PayEnd, p.standard_pay
    AS StandardPay, p.overtime_pay AS OvertimePay, p.salary AS Salary
    FROM serhantconstruction.payroll AS p JOIN serhantconstruction.employees
    AS emp ON p.employee_id = emp.id WHERE emp.first_nm = '${req.session.username}'
    AND p.pay_start_dt = '${req.body.start_dt}' AND p.pay_end_dt = '${req.body.end_dt}'`

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