const express = require('express');
const app = express();
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'thesis',
});

db.getConnection(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
 })
const upload = multer({ storage: fileStorageEngine});


app.get("/", (req, res) => {
    res.send("hello world")
})

app.listen(3001, () => {
    console.log("running on port 3001");
})
app.get("/employeelist", (req,res) => {
    const sqlSelect = "SELECT * FROM employeeprofile;"
    db.query(sqlSelect, (err, result) =>{
        res.send(result);
    })
})

app.post("/employeelistadd", upload.array('images', 2), (req,res) => {

    const employeelastname = req.body.employeelastname
    const employeefirstname = req.body.employeefirstname
    const employeemiddlename = req.body.employeemiddlename
    const employeeblock = req.body.employeeblock
    const employeelot = req.body.employeelot
    const employeestreet = req.body.employeestreet
    const employeecity = req.body.employeecity
    const employeeprovince = req.body.employeeprovince
    const employeezipcode = req.body.employeezipcode
    const employeecontact1 = req.body.employeecontact1
    const employeecontact2 = req.body.employeecontact2
    const employeecontact3 = req.body.employeecontact3
    const employeecontact4 = req.body.employeecontact4
    const employeeeducationalattainment = req.body.employeeeducationalattainment
    const employeeposition = req.body.employeeposition
    const employeestatus= req.body.employeestatus
    const employeejobdescription = req.body.employeejobdescription
    const employeeidpicture = req.body.employeeidpicture

    const sqlInsert = "INSERT INTO employeeprofile (employeelastname, employeefirstname, employeemiddlename, employeeblock, employeelot, employeestreet, employeecity, employeeprovince, employeezipcode, employeecontact1, employeecontact2, employeecontact3, employeecontact4, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, employeeidpicture) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
    db.query(sqlInsert,[employeelastname, employeefirstname, employeemiddlename, employeeblock, employeelot, employeestreet, employeecity, employeeprovince, employeezipcode, employeecontact1, employeecontact2, employeecontact3, employeecontact4, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, employeeidpicture], (err, result) =>{
        console.log(result);
    })
    
})