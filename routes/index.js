var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

// router.get('/', (req, res)=>{
//     let sql = `SELECT emp.id AS ID_num, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
//     dp.name AS Department, dp.standard_rate AS standard, dp.overtime_rate AS Overtime
//     FROM employees AS emp JOIN departments AS 
//     dp ON emp.id = dp.id`

//     conn.query(sql, (err, rows)=>{
//         console.log(rows)
//         if(err) throw err
//         res.render('employees',{
//         title:"Admin Page",
//         data: rows
//     });
//   });
// });

// router.get('/add', (req, res)=>{
//     res.render('addEmployees',{
//         title: "Add Employee Form"
//     });
// });

// router.post('/post', (req,res)=>{

//     let udata = {
//                  user_type_id:2,
//                  user_nm: req.body.f_nm,
//                  password: req.body.password
//                 }

//     let data = {
//                  first_nm: req.body.f_nm,
//                  last_nm: req.body.l_nm,
//                  dep_id: req.body.dept
//                }

//     let sql = "INSERT INTO employees SET ?"
//     let usql = "INSERT INTO users SET ?"
    
//     conn.query(sql, data, (err, rows)=>{
//         if(err) throw err;
//         conn.query(usql, udata, (err, rows)=>{
//             if(err) throw err
//             res.redirect('/main')
//         });
//     });
// });

// router.get('/edit/:id', (req, res)=>{
//     let sql = `SELECT emp.id AS ID_num, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
//     dp.name AS Department, dp.standard_rate AS standard, dp.overtime_rate AS Overtime
//     FROM employees AS emp JOIN departments AS 
//     dp ON emp.id = dp.id WHERE emp.id = ${req.params.id}`
//     conn.query(sql, (err, rows)=>{
//         if(err) throw err
//         res.render('attendance',{
//             data: rows[0]
//         });
//     });
// });

// router.post('/pay', (req, res)=>{
    
//    let dt = new Date();
//    let month = dt.getMonth() +1;
//    let year = dt.getFullYear();
//    let daysInMonth = new Date(year, month, 0).getDate();
//    let hrsWork = req.body.tot_dats_wrk * 8
//    let days_abs = daysInMonth - req.body.days_wrk;

//     let data = {
//                  employee_id: req.body.id,
//                  department_id: req.body.dept_id,
//                  pay_start_dt: req.body.st_dt,
//                  end_dt: req.body.end_dt, 
//                  num_hrs: hrsWork,
//                  num_over_tm: req.body.over_tm,
//                  days_abs: days_abs,
//                  tot_days_wrk: req.body.days_wrk,
//                  ovr_tm_hrs: req.body.over_tm
//                }
    
//     let sql = "INSERT INTO payroll SET ?"
    
//     conn.query(sql, data, (err, rows)=>{
//         console.log(maxWorkDays)
//         if(err) throw err
//         res.redirect("/main");
//     });
// });

module.exports = router