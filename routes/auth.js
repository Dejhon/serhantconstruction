var express = require('express');
const flash = require('express-flash');
const res = require('express/lib/response');
const conn = require('../lib/db');
var router = express.Router();

router.get('/', (req, res)=>{
    res.render('login',{
        message: req.flash('Message'),
        title: "Login Page"
    });
});

router.post('/login', (req, res)=>{
    username = req.body.name
    password = req.body.password
    conn.query("SELECT user_type_id AS type, user_nm AS user, password AS Secret FROM users WHERE BINARY user_nm = ? AND BINARY password = ?", [username, password], (err, rows)=>{
        if(err) throw err
        if(rows.length <= 0){
            req.flash('Message', "Invalid Credentials")
            res.redirect('/')
        }else if(rows[0].type == 1){
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/accountant');           
        }else if(rows[0].type == 2){
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/supervisor');
        }else if(rows[0].type == 3){
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/worker')
        };       
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(()=>{
        res.redirect('/')
    });
});

module.exports = router