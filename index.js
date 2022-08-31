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
    const employeevillage = req.body.employeevillage
    const employeebarangay = req.body.employeebarangay
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

    const sqlInsert = "INSERT INTO employeeprofile (employeelastname, employeefirstname, employeemiddlename, employeeblock, employeelot, employeestreet, employeevillage, employeebarangay, employeecity, employeeprovince, employeezipcode, employeecontact1, employeecontact2, employeecontact3, employeecontact4, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, employeeidpicture) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
    db.query(sqlInsert,[employeelastname, employeefirstname, employeemiddlename, employeeblock, employeelot, employeestreet, employeevillage, employeebarangay, employeecity, employeeprovince, employeezipcode, employeecontact1, employeecontact2, employeecontact3, employeecontact4, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, employeeidpicture], (err, result) =>{
    })
}) 

app.get('/employeelistpositionhistory/:employeeid', (req, res) => {
    const employeeid = req.params.employeeid;
    const sqlemployeeview = "SELECT * from employeeprofile WHERE employeeid = ?;"
    db.query(sqlemployeeview, employeeid, (err, result) =>{
        res.json(result);
        console.log(result)
    })
})
app.get('/employeelistedit/:employeeid', (req, res) => {
    const employeeid = req.params.employeeid;
    const sqlemployeeview = "SELECT * from employeeprofile WHERE employeeid = ?;"
    db.query(sqlemployeeview, employeeid, (err, result) =>{
        res.json(result);
    })
})
app.put('/employeelistupdate', (req,res) => {
    const employeeid = req.body.employeeid
    const employeelastname = req.body.newemployeelastname
    const employeefirstname = req.body.newemployeefirstname
    const employeemiddlename = req.body.newemployeemiddlename
    const employeeblock = req.body.newemployeeblock
    const employeelot = req.body.newemployeelot
    const employeestreet = req.body.newemployeestreet
    const employeevillage = req.body.newemployeevillage
    const employeebarangay = req.body.newemployeebarangay
    const employeecity = req.body.newemployeecity
    const employeeprovince = req.body.newemployeeprovince
    const employeezipcode = req.body.newemployeezipcode
    const employeecontact1 = req.body.newemployeecontact1
    const employeecontact2 = req.body.newemployeecontact2
    const employeecontact3 = req.body.newemployeecontact3
    const employeecontact4 = req.body.newemployeecontact4
    const employeeeducationalattainment = req.body.newemployeeeducationalattainment
    const employeeposition = req.body.newemployeeposition
    const employeestatus= req.body.newemployeestatus
    const newsqlemployeeupdate = "UPDATE employeeprofile SET employeelastname = ? , employeefirstname = ?, employeemiddlename = ?, employeeblock = ?, employeelot = ?, employeestreet = ?, employeevillage = ?, employeebarangay = ?, employeecity = ?, employeeprovince = ?, employeezipcode = ?, employeecontact1 = ?, employeecontact2 = ?, employeecontact3 = ?, employeecontact4 = ?, employeeeducationalattainment = ?, employeeposition = ?, employeestatus = ? WHERE employeeid = ?";
    db.query(newsqlemployeeupdate, [employeelastname, employeefirstname, employeemiddlename, employeeblock, employeelot, employeestreet, employeevillage, employeebarangay, employeecity, employeeprovince, employeezipcode, employeecontact1, employeecontact2, employeecontact3, employeecontact4, employeeeducationalattainment, employeeposition, employeestatus, employeeid], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/employeeidpicupdate', (req,res) => {
    const employeeid = req.body.employeeid
    const employeeidpicture = req.body.employeeidpicture;
    const newsqlemployeeidpictureupdate = "UPDATE employeeprofile SET employeeidpicture = ? WHERE employeeid = ?";
    db.query(newsqlemployeeidpictureupdate, [employeeidpicture, employeeid], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/employeejobdescriptionupdate', (req,res) => {
    const employeeid = req.body.employeeid
    const employeejobdescription = req.body.employeejobdescription;
    const newsqlemployeejobdescriptionupdate = "UPDATE employeeprofile SET employeejobdescription = ? WHERE employeeid = ?";
    db.query(newsqlemployeejobdescriptionupdate, [employeejobdescription, employeeid], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/plantutilitiessoiltype", (req,res) => {
    const sqlSelectsoiltype = "SELECT * FROM plantutilitiessoiltypeprofiles;"
    db.query(sqlSelectsoiltype, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiessoiltypeadd", (req,res) => {
    const soiltypename = req.body.soiltypename
    const sqlInsertsoiltype = "INSERT INTO plantutilitiessoiltypeprofiles (soiltypename) VALUES (?);"
    db.query(sqlInsertsoiltype,[soiltypename], (err, result) =>{
        console.log(result);
    })
    
})
app.get("/plantutilitiesplantprofile", (req,res) => {
    const sqlSelectplantprofile = "SELECT * FROM plantutilitiesplantprofiles;"
    db.query(sqlSelectplantprofile, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiesplantprofileadd", (req,res) => {
    const plantprofilename = req.body.plantprofilename
    const sqlInsertsplantprofile = "INSERT INTO plantutilitiesplantprofiles (plantprofilename) VALUES (?);"
    db.query(sqlInsertsplantprofile,[plantprofilename], (err, result) =>{
        console.log(result);
    })
    
})
app.get("/plantutilitiesplanttype", (req,res) => {
    const sqlSelectplanttype = "SELECT * FROM plantutilitiesplanttypeprofiles;"
    db.query(sqlSelectplanttype, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiesplanttypeadd", (req,res) => {
    const planttypename = req.body.planttypename
    const sqlInsertplanttype = "INSERT INTO plantutilitiesplanttypeprofiles (planttypename) VALUES (?);"
    db.query(sqlInsertplanttype,[planttypename], (err, result) =>{
        console.log(result);
    })
    
})
app.get("/plantutilitiesotherexpenses", (req,res) => {
    const sqlSelectotherexpenses = "SELECT * FROM plantutilitiesotherexpensesprofiles;"
    db.query(sqlSelectotherexpenses, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiesotherexpensesadd", (req,res) => {
    const otherexpensesname = req.body.otherexpensesname
    const sqlInsertotherexpenses = "INSERT INTO plantutilitiesotherexpensesprofiles (otherexpensesname) VALUES (?);"
    db.query(sqlInsertotherexpenses,[otherexpensesname], (err, result) =>{
        console.log(result);
    })
    
})
app.get("/plantprofile", (req,res) => {
    const sqlSelectplantprofile = "SELECT * FROM plantprofile;"
    db.query(sqlSelectplantprofile, (err, result) =>{
        res.send(result);
    })
})
app.get('/plantprofilesview/:plantprofileid', (req, res) => {
    const plantprofileid = req.params.plantprofileid;
    const sqlplantprofileview = "SELECT * from plantprofile WHERE plantprofileid = ?;"
    db.query(sqlplantprofileview, plantprofileid, (err, result) =>{
        res.json(result);
        console.log(result)
    })
})
app.post("/plantprofileadd", upload.single("image"), (req,res) => {
    const plantprofileplantname = req.body.plantprofileplantname
    const plantprofilecategory = req.body.plantprofilecategory
    const plantprofilescientificname = req.body.plantprofilepscientificname
    const plantprofilevariety = req.body.plantprofilevariety
    const plantprofileplanttype = req.body.plantprofileplanttype
    const plantprofilemonths = req.body.plantprofilemonths
    const plantprofilepicture = req.body.plantprofilepicture
    const plantprofiledescription = req.body.plantprofiledescription
    const plantprofiledisease1 = req.body.plantprofiledisease1
    const plantprofiledisease2 = req.body.plantprofiledisease2
    const plantprofiledisease3 = req.body.plantprofiledisease3
    const plantprofiledisease4 = req.body.plantprofiledisease4
    const plantprofiledisease5 = req.body.plantprofiledisease5
    const sqlInsertplantprofile = "INSERT INTO plantprofile (plantprofileplantname, plantprofilecategory, plantprofilescientificname, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofilepicture, plantprofiledescription, plantprofiledisease1, plantprofiledisease2, plantprofiledisease3, plantprofiledisease4, plantprofiledisease5) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);"
    db.query(sqlInsertplantprofile,[plantprofileplantname, plantprofilecategory, plantprofilescientificname, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofilepicture, plantprofiledescription, plantprofiledisease1, plantprofiledisease2, plantprofiledisease3, plantprofiledisease4, plantprofiledisease5], (err, result) =>{
        console.log(result);
    })
})
app.put("/plantprofileedit", (req,res) => {
    const plantprofileid = req.body.plantprofileid
    const plantprofileplantname = req.body.plantprofileplantname
    const plantprofilecategory = req.body.plantprofilecategory
    const plantprofilescientificname = req.body.plantprofilescientificname
    const plantprofilevariety = req.body.plantprofilevariety
    const plantprofileplanttype = req.body.plantprofileplanttype
    const plantprofilemonths = req.body.plantprofilemonths
    const plantprofiledescription = req.body.plantprofiledescription
    const plantprofiledisease1 = req.body.plantprofiledisease1
    const plantprofiledisease2 = req.body.plantprofiledisease2
    const plantprofiledisease3 = req.body.plantprofiledisease3
    const plantprofiledisease4 = req.body.plantprofiledisease4
    const plantprofiledisease5 = req.body.plantprofiledisease5
    const sqlplantprofileedit= "UPDATE plantprofile SET plantprofileplantname = ?, plantprofilecategory = ?, plantprofilescientificname = ?, plantprofilevariety = ?, plantprofileplanttype = ?, plantprofilemonths = ?, plantprofiledescription = ?, plantprofiledisease1 = ?, plantprofiledisease2 = ?, plantprofiledisease3 = ?, plantprofiledisease4 = ?, plantprofiledisease5 = ? WHERE plantprofileid = ?";
    db.query(sqlplantprofileedit, [plantprofileplantname, plantprofilecategory, plantprofilescientificname, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofiledescription, plantprofiledisease1, plantprofiledisease2, plantprofiledisease3, plantprofiledisease4, plantprofiledisease5, plantprofileid], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/plantprofilepicedit', (req,res) => {
    const plantprofileid = req.body.plantprofileid
    const plantprofilepicture = req.body.plantprofilepicture
    const newsqlplantprofilepicupdate = "UPDATE plantprofile SET plantprofilepicture = ? WHERE plantprofileid = ?";
    db.query(newsqlplantprofilepicupdate, [plantprofilepicture, plantprofileid], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/employeesaccount", (req,res) => {
    const sqlSelectemployeesaccount = "SELECT * FROM employeeprofile INNER JOIN employeeaccounts ON employeeprofile.employeeid = employeeaccounts.employeeaccountid;"
    db.query(sqlSelectemployeesaccount, (err, result) =>{
        res.send(result);
    })
})
app.get("/employeesaccountfilter", (req,res) => {
    const sqlSelectemployeesaccountfilter = "SELECT * FROM employeeprofile WHERE employeeprofile.employeeid NOT IN (SELECT employeeaccounts.employeeaccountid FROM employeeaccounts);"
    db.query(sqlSelectemployeesaccountfilter, (err, result) =>{
        res.send(result);
    })
})
app.get("/employeesaccountedit/:employeeid", (req,res) => {
    const employeeid = req.params.employeeid
    const sqlSelectemployeesaccountedit = "SELECT * FROM employeeprofile INNER JOIN employeeaccounts ON employeeprofile.employeeid = ? AND employeeaccounts.employeeaccountid = ?;"
    db.query(sqlSelectemployeesaccountedit, [employeeid, employeeid], (err, result) =>{
        res.send(result);
        console.log(employeeid)
    })
})
app.put('/employeeaccountupdate', (req,res) => {
    const employeeaccountid = req.body.employeeaccountid
    const newemployeeaccountusername = req.body.newemployeeaccountusername
    const newemployeeaccountpassword = req.body.newemployeeaccountpassword
    const newemployeeaccounttype = req.body.newemployeeaccounttype
    const newsqlemployeeaccountupdate = "UPDATE employeeaccounts SET employeeaccountusername = ? , employeeaccountpassword = ?, employeeaccounttype = ? WHERE employeeaccountid = ?";
    db.query(newsqlemployeeaccountupdate, [newemployeeaccountusername, newemployeeaccountpassword, newemployeeaccounttype, employeeaccountid], (err, result) => {
        if (err) console.log(err);
    });
})
app.post("/employeesaccountadd", (req,res) => {
    const employeeaccountid = req.body.employeeaccountid
    const employeeaccountusername = req.body.employeeaccountusername
    const employeeaccountpassword = req.body.employeeaccountpassword
    const employeeaccounttype = req.body.employeeaccounttype
    const sqlInsertemployeeaccount = "INSERT INTO employeeaccounts (employeeaccountid, employeeaccountusername, employeeaccountpassword, employeeaccounttype) VALUES (?,?,?,?);"
    db.query(sqlInsertemployeeaccount,[employeeaccountid, employeeaccountusername, employeeaccountpassword, employeeaccounttype], (err, result) =>{
        console.log(employeeaccountid)
      console.log(employeeaccountusername)
      console.log(employeeaccountpassword)
      console.log(employeeaccounttype)
    })
    
})

//crud test
app.get("/api/get", (req,res) => {
    const sqlSelect = "SELECT * FROM movie_reviews;"
    db.query(sqlSelect, (err, result) =>{
        res.send(result);
    })
})

app.post("/api/insert", (req,res) => {
    const movieName = req.body.movieName
    const movieReview = req.body.movieReview
    const sqlInsert = "INSERT INTO movie_reviews (movieName, movieReview) VALUES (?,?);"
    db.query(sqlInsert,[movieName, movieReview], (err, result) =>{
        console.log(result);
    })
    
})

app.delete('/api/delete/:movieName', (req,res) => {
    const name = req.params.movieName;
    const sqlDelete = "DELETE from movie_reviews WHERE movieName = ?";
    db.query(sqlDelete, name, (err, result) => {
        if (err) console.log(err);
    });

})

app.put('/api/update', (req,res) => {
    const name = req.body.movieName;
    const review = req.body.movieReview;
    const sqlUpdate = "UPDATE movie_reviews SET movieReview = ? WHERE movieName = ?";
    db.query(sqlUpdate, [review, name], (err, result) => {
        if (err) console.log(err);
    });

})
app.listen(3001, () => {
    console.log("running on port 3001");
})