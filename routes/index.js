var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

router.get('/', (req, res)=>{
    let sql = "SELECT emp.id AS ID_num, emp.first_nm AS Firstname, emp.last_nm AS Lastname, dp.name AS Department FROM employees AS emp JOIN departments AS dp ON emp.id = dp.id"

    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('index',{
        title:"Admin Page",
        data: rows
    });
  });
});

router.get('/add', (req, res)=>{
    res.render('addEmployees',{
        title: "Add Employee Form"
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
                 dep_id: req.body.dept
               }

    let sql = "INSERT INTO employees SET ?"
    let usql = "INSERT INTO users SET ?"
    
    conn.query(sql, data, (err, rows)=>{
        if(err) throw err;
        conn.query(usql, udata, (err, rows)=>{
            if(err) throw err
            res.redirect('/main')
        });
    });
});

router.get('/edit/:id', (req, res)=>{
    let sql = `SELECT * FROM employees WHERE id = ${req.params.id}`
    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('attendance',{
            data: rows[0]
        });
    });
});

router.post('/pay', (req, res)=>{

    let data = {
                 em_id: req.body.id,
                //  department_id: req.body.dept_id,
                 date: req.body.dt,
                 days_abs: req.body.abs_day,
                 wrk_hrs: req.body.stnd_tm,
                 ovr_tm_hrs: req.body.over_tm,
               }
    
    let sql = "INSERT INTO attendance SET ?"
    
    conn.query(sql, data, (err, rows)=>{
        if(err) throw err
        res.redirect("/main");
    });
});

router.get("/attendance", (req, res)=>{
    
})

// router.get('/payroll', (req, res)=>{
//     let sql = `SELECT emp.first_nm As Firstname, emp.last_nm AS Lastname, d.name AS Department,
//     date_format(p.date, '%Y-%d-%m') AS Date, p.num_hrs AS StandardHours, p.num_over_tm AS OvertimeHours, 
//     p.days_abs AS DaysAbsent,p.id AS PID FROM serhantconstruction.payroll AS p JOIN 
//     serhantconstruction.employees AS emp ON p.employee_id = emp.id JOIN
//     serhantconstruction.departments AS d ON p.department_id = d.id;`

//     conn.query(sql, (err, rows)=>{
//         if(err) throw err
//         res.render('payroll',{
//             title: "Payroll",
//             data: rows
//         });
//     });
// });

// router.get('/employee', (req, res)=>{
//     let sql = `SELECT emp.first_nm As Firstname, emp.last_nm AS Lastname, d.name AS Department,
//     date_format(p.date, '%Y-%d-%m') AS Date, p.num_hrs AS StandardHours, p.num_over_tm AS OvertimeHours, 
//     p.days_abs AS DaysAbsent,p.id AS PID FROM serhantconstruction.payroll AS p JOIN 
//     serhantconstruction.employees AS emp ON p.employee_id = emp.id JOIN
//     serhantconstruction.departments AS d ON p.department_id = d.id WHERE p.employee_id = ${req.body.emp_id}`

//     conn.query(sql, (err, rows)=>{
//         if(err) throw err
//         res.render('empPayroll',{
//             data:rows[0]
//         })
//     })
// })


module.exports = router