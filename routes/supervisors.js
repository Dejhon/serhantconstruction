var express = require('express');
const flash = require('express-flash');
const { redirect } = require('express/lib/response');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

router.get('/', (req, res)=>{
    let sql = `SELECT emp.id AS ID_num, emp.first_nm AS Firstname, emp.last_nm AS Lastname,
    dp.name AS Department, dp.standard_rate AS standard, dp.overtime_rate AS Overtime,
    sp.first_nm AS Supervisor_Firstname, sp.last_nm AS Supervisor_Lastname FROM 
    serhantconstruction.employees AS emp JOIN serhantconstruction.departments AS dp ON emp.id
    = dp.id JOIN serhantconstruction.supervisors AS sp ON dp.spvsr_id = sp.id`

    conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('employees',{
        title:"Employee Page",
        data: rows
    });
  });
});

module.exports = router