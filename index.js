const express = require('express');
const app = express();
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { parse } = require('path');

app.use(
    cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200
  }))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
// for session
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
	secret: 'secret',
	resave: true,
    cookie: { maxAge: oneDay },
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
let un, at //for username and account type
/*const db = mysql.createPool({
    host: '192.168.254.111',
    user: 'rjatalo',
    password: 'root',
    database: 'farmsys',
    port:3306
}); */
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'farmsys',
});
db.getConnection(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
/*const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
 })*/
const upload = multer({storage:multer.memoryStorage()});
app.post("/logout", (req, res) => {
    req.session.loggedin = false
    req.session.username = ""
    un = ""
    at = ""
})
app.post("/auth", (req,res) => {
    const username = req.body.username
    const pass = req.body.pass
    const status = "Active"
    const sqlInsert = "SELECT * FROM employee_accounts WHERE username = ? AND pass = ? AND account_status = ?;"
    un = ""
    at = ""
    var unl
    db.query(sqlInsert,[username, pass, status], (err, result) =>{
        console.log("reso: ",result, result.length);
        unl = result.length
        console.log(unl)
        if (err) console.log(err)
        if(unl != 0){
            req.session.loggedin = true;
            req.session.username = username;
            un = req.session.username
            at = result[0].account_type
            //res.redirect('/');
            res.send(un)            
            console.log("at", at)
        }
        res.end();
    })
})

app.get("/", (req, res) => {
    if (req) {
		res.send(un);
        console.log("username", un)
        console.log("account type", at)
	} else {
		res.send('Please login to view this page!');
	}
    var today = new Date()
    console.log("today: ", today)
	res.end();
})
app.get("/atype", (req, res) => {
    if (req) {
		res.send(at);
        console.log("username", un)
        console.log("account type", at)
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
})


app.get("/employeelist", (req,res) => {
    const sqlSelect = "SELECT * FROM employees;"
    db.query(sqlSelect, (err, result) =>{
        res.send(result);
    })
})


app.post("/employeelistadd", upload.single('profileImg'), async function (req,res) {
    const employeename = req.body.employeename
    const employeeblock = req.body.employeeblock
    const employeelot = req.body.employeelot
    const employeestreet = req.body.employeestreet
    const employeebarangay = req.body.employeebarangay
    const employeecity = req.body.employeecity
    const employeeprovince = req.body.employeeprovince
    const employeezipcode = req.body.employeezipcode
    const employeecontact = req.body.employeecontact
    const employeeeducationalattainment = req.body.employeeeducationalattainment
    const employeeposition = req.body.employeeposition
    const employeestatus= req.body.employeestatus
    const employeejobdescription = req.body.employeejobdescription
    const employeeidpicture = req.file.buffer.toString('base64')
    var emp_id
    const sqlInsertemployee = "INSERT INTO employees (emp_name, contact_num, educational_attainment, emp_pos, emp_status, job_desc, id_pic) VALUES (?,?,?,?,?,?,?);"
    const sqlInsertemployeeaddress = "INSERT INTO address (emp_id, block, lot, street, barangay, city, province, zipcode) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertemployeeposition = "INSERT INTO employee_position_history (emp_id, emp_position, emp_status) VALUES (?,?,?);"
    function addemployee(){
        return new Promise ((resolve, reject) => {
            db.query(sqlInsertemployee,[employeename, employeecontact, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, employeeidpicture], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result.insertId);
                  }
            })
        })
    }
    emp_id = await addemployee();
    console.log(emp_id)
    db.query(sqlInsertemployeeaddress,[emp_id, employeeblock, employeelot, employeestreet, employeebarangay, employeecity, employeeprovince, employeezipcode], (err, result) =>{
        if (err) console.log(err);
    })
    db.query(sqlInsertemployeeposition,[emp_id, employeeposition, employeestatus], (err, result) =>{
        if (err) console.log(err);
    })
}) 

app.get('/employeelistpositionhistory/:employeeid', (req, res) => {
    const employeeid = req.params.employeeid;
    const sqlemployeeview = "SELECT * from employees WHERE emp_id = ?;"
    db.query(sqlemployeeview, employeeid, (err, result) =>{
        res.json(result);
        console.log(result)
    })
})
app.get('/employeelistpositionhistorydata/:employeeid', (req, res) => {
    const employeeid = req.params.employeeid;
    const sqlemployeeview = "SELECT * from employee_position_history WHERE emp_id = ? ORDER BY date_given DESC ;"
    db.query(sqlemployeeview, employeeid, (err, result) =>{
        res.json(result);
        console.log(result)
    })
})
app.get('/employeelistedit/:employeeid', (req, res) => {
    const employeeid = req.params.employeeid;
    const sqlemployeeview = "SELECT * from employees WHERE emp_id = ?;"
    db.query(sqlemployeeview, employeeid, (err, result) =>{
        res.json(result);
    })
})
app.get('/employeelisteditaddress/:employeeid', (req, res) => {
    const employeeid = req.params.employeeid;
    const sqlemployeeaddress = "SELECT * from address WHERE emp_id = ?;"
    db.query(sqlemployeeaddress, employeeid, (err, result) =>{
        res.json(result);
    })
})
app.put('/employeelistupdate', async function (req,res) {
    const emp_id = req.body.emp_id
    const employeename = req.body.employeename
    const employeeblock = req.body.employeeblock
    const employeelot = req.body.employeelot
    const employeestreet = req.body.employeestreet
    const employeebarangay = req.body.employeebarangay
    const employeecity = req.body.employeecity
    const employeeprovince = req.body.employeeprovince
    const employeezipcode = req.body.employeezipcode
    const employeecontact = req.body.employeecontact
    const employeeeducationalattainment = req.body.employeeeducationalattainment
    const employeeposition = req.body.employeeposition
    const employeestatus= req.body.employeestatus
    const employeejobdescription= req.body.employeejobdescription
    const newsqlemployeeupdate = "UPDATE employees SET emp_name = ?, contact_num = ?, educational_attainment = ?, emp_pos = ?, emp_status = ?, job_desc = ? WHERE emp_id = ?";
    const newsqlemployeeaddress = "UPDATE address SET block = ?, lot = ?, street = ?, barangay = ?, city = ?, province = ?, zipcode= ? WHERE emp_id = ?";
    const sqlInsertemployeeposition = "INSERT INTO employee_position_history (emp_id, emp_position, emp_status) VALUES (?,?,?);"
    const sqlcheckposhistory = "SELECT * FROM employee_position_history WHERE emp_id = ? ORDER BY date_given DESC LIMIT 1;"
    var oldpos, oldstatus
    db.query(newsqlemployeeupdate, [employeename, employeecontact, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, emp_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlemployeeaddress, [employeeblock, employeelot, employeestreet, employeebarangay, employeecity, employeeprovince, employeezipcode, emp_id], (err, result) => {
        if (err) console.log(err);
    });
    function getpos(){
        return new Promise ((resolve, reject) => {
            db.query(sqlcheckposhistory,[emp_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].emp_position);
                  }
            })
        })
    }
    function getstatus(){
        return new Promise ((resolve, reject) => {
            db.query(sqlcheckposhistory,[emp_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].emp_status);
                  }
            })
        })
    }
    oldpos = await getpos();
    oldstatus = await getstatus();
    if (oldpos != employeeposition || oldstatus != employeestatus) {
        db.query(sqlInsertemployeeposition,[emp_id, employeeposition, employeestatus], (err, result) =>{
            if (err) console.log(err);
        })
    }
})
app.put('/employeeidpicupdate', upload.single('profileImg'), (req,res) => {
    const employeeid = req.body.employeeid
    const employeeidpicture = req.file.buffer.toString('base64');
    const newsqlemployeeidpictureupdate = "UPDATE employees SET id_pic = ? WHERE emp_id = ?";
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
        console.log(result.insertId);
        res.json({ insertId: result.insertId })
    })
})
app.get("/plantutilitiesunitsofmeasurement", (req,res) => {
    const sqlSelectunits = "SELECT * FROM plantutilitiesunitofmeasurement;"
    db.query(sqlSelectunits, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiesunitsofmeasurementadd", (req,res) => {
    const unit_name = req.body.unit_name
    const sqlInsertunits = "INSERT INTO plantutilitiesunitofmeasurement (unit_name) VALUES (?);"
    db.query(sqlInsertunits,[unit_name], (err, result) =>{
        console.log(result);
        console.log(result.insertId);
        res.json({ insertId: result.insertId })
    })
})
app.get("/plantutilitiespaymentmethod", (req,res) => {
    const sqlSelectpm = "SELECT * FROM plantutilitiespaymentmethod;"
    db.query(sqlSelectpm, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiespaymentmethodadd", (req,res) => {
    const paymentmethod_name = req.body.paymentmethod_name
    const sqlInsertpm = "INSERT INTO plantutilitiespaymentmethod (paymentmethod_name) VALUES (?);"
    db.query(sqlInsertpm,[paymentmethod_name], (err, result) =>{
        console.log(result);
        console.log(result.insertId);
        res.json({ insertId: result.insertId })
    })
})
app.get("/plantutilitiesitemcategory", (req,res) => {
    const sqlSelectic = "SELECT * FROM plantutilitiesitemcategory;"
    db.query(sqlSelectic, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantutilitiesitemcategoryadd", (req,res) => {
    const itemcategory_name = req.body.itemcategory_name
    const sqlInsertic = "INSERT INTO plantutilitiesitemcategory (itemcategory_name) VALUES (?);"
    db.query(sqlInsertic,[itemcategory_name], (err, result) =>{
        console.log(result);
        console.log(result.insertId);
        res.json({ insertId: result.insertId })
    })
})
app.get("/plantprofile", (req,res) => {
    const sqlSelectplantprofile = "SELECT * FROM plant_profile;"
    db.query(sqlSelectplantprofile, (err, result) =>{
        res.send(result);
    })
})
app.get('/plantprofilesview/:plantprofileid', (req, res) => {
    const plantprofileid = req.params.plantprofileid;
    const sqlplantprofileview = "SELECT * from plant_profile WHERE plant_id = ?;"
    db.query(sqlplantprofileview, plantprofileid, (err, result) =>{
        res.json(result);
    })
})
app.post("/plantprofileadd", upload.single('profileImg'), (req,res) => {
    const plantprofileplantname = req.body.plantprofileplantname
    const plantprofilecategory = req.body.plantprofilecategory
    const plantprofilescientificname = req.body.plantprofilepscientificname
    const plantprofilevariety = req.body.plantprofilevariety
    const plantprofileplanttype = req.body.plantprofileplanttype
    const plantprofilemonths = req.body.plantprofilemonths
    const plantprofilepicture = req.file.buffer.toString('base64')
    const plantprofiledescription = req.body.plantprofiledescription
    const sqlInsertplantprofile = "INSERT INTO plant_profile (plant_name, sci_name, category, variety, plant_type, num_of_mon_to_harvest, img, plant_desc) VALUES (?,?,?,?,?,?,?,?);"
    db.query(sqlInsertplantprofile,[plantprofileplantname, plantprofilescientificname, plantprofilecategory, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofilepicture, plantprofiledescription], (err, result) =>{
        
        if(err) console.log(err)
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
    const sqlplantprofileedit= "UPDATE plant_profile SET plant_name = ?, sci_name = ?, category = ?, variety = ?, plant_type = ?, num_of_mon_to_harvest = ?, plant_desc = ? WHERE plant_id = ?";
    db.query(sqlplantprofileedit, [plantprofileplantname, plantprofilescientificname, plantprofilecategory, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofiledescription, plantprofileid], (err, result) => {
        if (err) console.log(err);
        console.log(plantprofileid)
        console.log(plantprofileplantname)
        console.log(plantprofilecategory)
        console.log(plantprofilescientificname)
        console.log(plantprofilevariety)
        console.log(plantprofileplanttype)
        console.log(plantprofilemonths)
        console.log(plantprofiledescription)
    });
})
app.put('/plantprofilepicedit', upload.single('profileImg'), (req,res) => {
    const plant_id = req.body.plant_id
    const img = req.file.buffer.toString('base64')
    const newsqlplantprofilepicupdate = "UPDATE plant_profile SET img = ? WHERE plant_id = ?";
    db.query(newsqlplantprofilepicupdate, [img, plant_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/plantprofilediseaselist/:plant_id", (req,res) => {
    const plant_id = req.params.plant_id
    const sqlInsertplantdiseaselist = "SELECT * from plant_possible_disease WHERE plant_id = ?;"
    db.query(sqlInsertplantdiseaselist,[plant_id], (err, result) =>{
        res.json(result);
    })
})
app.get("/plantprofilediseaseinfo/:disease_id", (req,res) => {
    const disease_id = req.params.disease_id
    const sqlInsertplantdiseaselist = "SELECT * from plant_possible_disease WHERE disease_id = ?;"
    db.query(sqlInsertplantdiseaselist,[disease_id], (err, result) =>{
        res.json(result);
    })
})
app.post("/plantprofilediseaseadd", (req,res) => {
    const plant_id = req.body.plant_id
    const diseases = req.body.diseases
    const sqlInsertplantdisease = "INSERT INTO plant_possible_disease (plant_id, diseases) VALUES (?,?);"
    db.query(sqlInsertplantdisease,[plant_id, diseases], (err, result) =>{
        if (err) console.log(err);
    })
})
app.put('/plantprofilediseaseedit', (req,res) => {
    const diseases = req.body.diseases
    const disease_id = req.body.disease_id
    const newsqlplantdiseaseupdate = "UPDATE plant_possible_disease SET diseases = ? WHERE disease_id = ?";
    db.query(newsqlplantdiseaseupdate, [diseases, disease_id], (err, result) => {
        if (err) console.log(err);
        console.log("des: ",diseases)
        console.log("id: ",disease_id)
    });
})
app.get("/employeesaccount", (req,res) => {
    const status = "Active"
    const sqlSelectemployeesaccount = "SELECT * FROM employees INNER JOIN employee_accounts ON employees.emp_id = employee_accounts.emp_id WHERE account_status = ?;"
    db.query(sqlSelectemployeesaccount, status, (err, result) =>{
        res.send(result);
    })
})
app.get("/employeesaccountinactive", (req,res) => {
    const status = "Inactive"
    const sqlSelectemployeesaccount = "SELECT * FROM employees INNER JOIN employee_accounts ON employees.emp_id = employee_accounts.emp_id WHERE account_status = ?;"
    db.query(sqlSelectemployeesaccount, status, (err, result) =>{
        res.send(result);
    })
})
app.get("/employeesaccountfilter", (req,res) => {
    const blank = ""
    const sqlSelectemployeesaccountfilter = "SELECT * FROM employees WHERE employees.emp_id NOT IN (SELECT employee_accounts.emp_id FROM employee_accounts WHERE employee_accounts.emp_id != ?);"
    db.query(sqlSelectemployeesaccountfilter, blank,(err, result) =>{
        res.send(result);
    })
})
app.get("/employeesaccountedit/:employeeid", (req,res) => {
    const employeeid = req.params.employeeid
    const sqlSelectemployeesaccountedit = "SELECT * FROM employees INNER JOIN employee_accounts ON employees.emp_id = ? AND employee_accounts.emp_id = ?;"
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
    const newstatus = req.body.newstatus
    const newsqlemployeeaccountupdate = "UPDATE employee_accounts SET username = ? , pass = ?, account_type = ?, account_status = ? WHERE emp_id = ?";
    db.query(newsqlemployeeaccountupdate, [newemployeeaccountusername, newemployeeaccountpassword, newemployeeaccounttype, newstatus, employeeaccountid], (err, result) => {
        if (err) console.log(err);
    });
})
app.post("/employeesaccountadd", (req,res) => {
    const employeeaccountid = req.body.employeeaccountid
    const employeeaccountusername = req.body.employeeaccountusername
    const employeeaccountpassword = req.body.employeeaccountpassword
    const employeeaccounttype = req.body.employeeaccounttype
    const sqlInsertemployeeaccount = "INSERT INTO employee_accounts (emp_id, username, pass, account_type) VALUES (?,?,?,?);"
    db.query(sqlInsertemployeeaccount,[employeeaccountid, employeeaccountusername, employeeaccountpassword, employeeaccounttype], (err, result) =>{
        res.send(result)
    })
    
})
app.post("/farmpprofileadd", upload.array("profileImg", 3), async function (req,res)  {
    //farm
    const farm_name = req.body.farm_name
    const size = req.body.size
    var farm_id
    //owner
    const owner_name = req.body.owner_name
    const owner_type = req.body.owner_type
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const educational_attainment = req.body.educational_attainment
    const position = req.body.position
    const job_desc = req.body.job_desc
    var owner_id
    //farm contact
    const farm_contact_person_name = req.body.farm_contact_person_name
    const farm_position = req.body.farm_position
    const farm_contact_info_contact_num = req.body.farm_contact_info_contact_num
    const farm_contact_info_contact_email = req.body.farm_contact_info_contact_email
    //farm address
    const block = req.body.block
    const lot = req.body.lot
    const street = req.body.street
    const barangay = req.body.barangay
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    //owner address
    const owner_block = req.body.owner_block
    const owner_lot = req.body.owner_lot
    const owner_street = req.body.owner_street
    const owner_barangay = req.body.owner_barangay
    const owner_city = req.body.owner_city
    const owner_province = req.body.owner_province
    const owner_zipcode = req.body.owner_zipcode
    //social
    const img_map = req.files[0].buffer.toString('base64')
    const google_map = req.files[1].buffer.toString('base64')
    const org_chart = req.files[2].buffer.toString('base64')
    const sqlInsertfarmprofile = "INSERT INTO farm (farm_name, size) VALUES (?,?);"
    const sqlInsertownerprofile = "INSERT INTO owners (farm_id, owner_name, owner_type, contact_num, contact_email, educational_attainment, position, job_desc) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertfarmcontact = "INSERT INTO contact_info (farm_id, contact_person_name, position, contact_num, contact_email) VALUES (?,?,?,?,?);"
    const sqlInsertfarmadress = "INSERT INTO address (farm_id, block, lot, street, barangay, city, province, zipcode) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertfarmsocial = "INSERT INTO social_info (farm_id, img_map, google_map, org_chart) VALUES (?,?,?,?);"
    const sqlInsertowneradress = "INSERT INTO address (owner_id, block, lot, street, barangay, city, province, zipcode) VALUES (?,?,?,?,?,?,?,?);"
    function addfarm(){
        return new Promise ((resolve, reject) => {
            db.query(sqlInsertfarmprofile,[farm_name, size], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result.insertId);
                  }
            })
        })
    }
    function addowner(){
        return new Promise ((resolve, reject) => {
            db.query(sqlInsertownerprofile,[farm_id, owner_name, owner_type, contact_num, contact_email, educational_attainment, position, job_desc], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result.insertId);
                  }
            })
        })
    }
    farm_id = await addfarm();
    owner_id = await addowner();
    db.query(sqlInsertfarmcontact,[farm_id, farm_contact_person_name, farm_position, farm_contact_info_contact_num, farm_contact_info_contact_email], (err, result) =>{
        console.log(result)
    })
    db.query(sqlInsertfarmadress,[farm_id, block, lot, street, barangay, city, province, zipcode], (err, result) =>{
    })
    db.query(sqlInsertfarmsocial,[farm_id, img_map, google_map, org_chart], (err, result) =>{
        if(err) console.log(err)
    })
    db.query(sqlInsertowneradress,[owner_id, owner_block, owner_lot, owner_street, owner_barangay, owner_city, owner_province, owner_zipcode], (err, result) =>{
    })
})
app.get("/farmlist", (req,res) => {
    const sqlSelectfarm = "SELECT * FROM farm;"
    db.query(sqlSelectfarm, (err, result) =>{
        res.send(result);
        if (err) console.log(err)
    })
})
app.get('/farmprofileidget/:farm_id', (req, res) => {
    const farm_id = req.params.farm_id;
    const sqlfarmprofileidget = "SELECT * from farm WHERE farm_id = ?;"
    db.query(sqlfarmprofileidget, farm_id, (err, result) =>{
        res.json(result);
    })
})
app.get('/farmprofilepcicsget/:farm_id', (req, res) => {
    const farm_id = req.params.farm_id;
    const sqlfarmprofilepicsget = "SELECT * from social_info WHERE farm_id = ?;"
    db.query(sqlfarmprofilepicsget, farm_id, (err, result) =>{
        res.json(result);
    })
})
app.get("/ownerlist/:farm_id", (req,res) => {
    const farm_id = req.params.farm_id;
    const sqlSelectownerwithfarm = "SELECT * FROM owners WHERE farm_id = ?;"
    db.query(sqlSelectownerwithfarm, farm_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/farmaddress/:farm_id", (req,res) => {
    const farm_id = req.params.farm_id;
    const sqlSelectfarmaddress = "SELECT * FROM address WHERE farm_id = ?;"
    db.query(sqlSelectfarmaddress, farm_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/owneraddress/:farm_id", (req,res) => {
    const farm_id = req.params.farm_id;
    const sqlSelectowneraddress = "SELECT address.owner_id, address.lot, address.city, address.province, address.zipcode, address.block, address.barangay, address.street FROM address INNER JOIN owners ON address.owner_id = owners.owner_id INNER JOIN farm ON owners.farm_id = farm.farm_id WHERE farm.farm_id = ?;"
    db.query(sqlSelectowneraddress, farm_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/farmcontact/:farm_id", (req,res) => {
    const farm_id = req.params.farm_id;
    const sqlSelectfarmcontact = "SELECT * FROM contact_info WHERE farm_id = ?;"
    db.query(sqlSelectfarmcontact, farm_id, (err, result) =>{
        res.send(result);
        console.log(result)
    })
})
app.get('/ownerprofileidget/:owner_id', (req, res) => {
    const owner_id = req.params.owner_id;
    const sqlownerprofileidget = "SELECT * FROM owners WHERE owner_id = ?;"
    db.query(sqlownerprofileidget, owner_id, (err, result) =>{
        res.json(result);
    })
})
app.get('/owneraddressidget/:owner_id', (req, res) => {
    const owner_id = req.params.owner_id;
    const sqlowneraddressidget = "SELECT * FROM address WHERE owner_id = ?;"
    db.query(sqlowneraddressidget, owner_id, (err, result) =>{
        res.json(result);
    })
})
app.post('/ownersadd', async function (req,res) {
    const farm_id = req.body.farm_id;
    const owner_name = req.body.owner_name
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const owner_type = req.body.owner_type
    const educational_attainment = req.body.educational_attainment
    const position = req.body.position
    const job_desc = req.body.job_desc
    const block = req.body.block
    const lot = req.body.lot
    const street = req.body.street
    const barangay = req.body.barangay
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const sqlInsertownerprofile = "INSERT INTO owners (farm_id, owner_name, owner_type, contact_num, contact_email, educational_attainment, position, job_desc) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertowneradress = "INSERT INTO address (owner_id, block, lot, street, barangay, city, province, zipcode) VALUES (?,?,?,?,?,?,?,?);"
    function addowner(){
        return new Promise ((resolve, reject) => {
            db.query(sqlInsertownerprofile,[farm_id, owner_name, owner_type, contact_num, contact_email, educational_attainment, position, job_desc], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result.insertId);
                  }
            })
        })
    }
    owner_id = await addowner();
    db.query(sqlInsertowneradress,[owner_id, block, lot, street, barangay, city, province, zipcode], (err, result) =>{
    })
})
app.put('/farmupdate', (req,res) => {
    const farm_id = req.body.farm_id
    const farm_name = req.body.farm_name
    const size = req.body.size
    const block = req.body.block
    const lot = req.body.lot
    const street = req.body.street
    const barangay = req.body.barangay
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const contact_person_name = req.body.contact_person_name
    const position = req.body.position
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const newsqlfarmupdate = "UPDATE farm SET farm_name = ?, size = ? WHERE farm_id = ?";
    const newsqlfarmaddressupdate = "UPDATE address SET block = ?, lot = ? , street = ?, barangay = ?, city = ?, province = ? , zipcode = ? WHERE farm_id = ?";
    const newsqlfarmcontactupdate = "UPDATE contact_info SET contact_person_name = ? , position = ?, contact_num = ?, contact_email = ? WHERE farm_id = ?";
    db.query(newsqlfarmupdate, [farm_name, size, farm_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlfarmaddressupdate, [block, lot, street, barangay, city, province, zipcode, farm_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlfarmcontactupdate, [contact_person_name, position, contact_num, contact_email, farm_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/farmimgmapupdate',upload.single('profileImg'), (req,res) => {
    const farm_id = req.body.farm_id;
    const img_map = req.file.buffer.toString('base64')
    const sqlUpdate = "UPDATE social_info SET img_map = ? WHERE farm_id = ?";
    db.query(sqlUpdate, [img_map, farm_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/farmgooglemapupdate',upload.single('profileImg'), (req,res) => {
    const farm_id = req.body.farm_id;
    const google_map = req.file.buffer.toString('base64')
    const sqlUpdate = "UPDATE social_info SET google_map = ? WHERE farm_id = ?";
    db.query(sqlUpdate, [google_map, farm_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/farmorgchartupdate',upload.single('profileImg'), (req,res) => {
    const farm_id = req.body.farm_id;
    const org_chart = req.file.buffer.toString('base64')
    const sqlUpdate = "UPDATE social_info SET org_chart = ? WHERE farm_id = ?";
    db.query(sqlUpdate, [org_chart, farm_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.put('/ownersupdate', (req,res) => {
    const owner_id = req.body.owner_id
    const owner_name = req.body.owner_name
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const owner_type = req.body.owner_type
    const educational_attainment = req.body.educational_attainment
    const position = req.body.position
    const job_desc = req.body.job_desc
    const block = req.body.block
    const lot = req.body.lot
    const street = req.body.street
    const barangay = req.body.barangay
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const newsqlownerupdate = "UPDATE owners SET owner_name = ? , contact_num = ?, contact_email = ?, owner_type = ? , educational_attainment = ?, position = ?, job_desc = ? WHERE owner_id = ?";
    const newsqlowneraddressupdate = "UPDATE address SET block = ?, lot = ? , street = ?, barangay = ?, city = ?, province = ? , zipcode = ? WHERE owner_id = ?";
    db.query(newsqlownerupdate, [owner_name, contact_num, contact_email, owner_type, educational_attainment, position, job_desc, owner_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlowneraddressupdate, [block, lot, street, barangay, city, province, zipcode, owner_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/plantbatchlist/:batch_status", (req,res) => {
    const batch_status = req.params.batch_status;
    const sqlSelectbatch = "SELECT * FROM plant_batch INNER JOIN plant_profile ON plant_batch.plant_id = plant_profile.plant_id INNER JOIN farm_areas ON plant_batch.area_id=farm_areas.area_id WHERE plant_batch.batch_status = ?;"
    db.query(sqlSelectbatch, batch_status, (err, result) =>{
        res.send(result);
    })
})
app.get("/harvestbatchlist/:batch_status", (req,res) => {
    const batch_status = req.params.batch_status;
    const sqlSelectbatch = "SELECT * FROM batch_harvest INNER JOIN plant_batch ON batch_harvest.batch_id = plant_batch.batch_id INNER JOIN plant_profile ON plant_batch.plant_id=plant_profile.plant_id WHERE batch_harvest.batch_status = ?;"
    db.query(sqlSelectbatch, batch_status, (err, result) =>{
        res.send(result);
        if (err) console.log(err)
    })
})
app.get("/plantbatchlistlatestinfo", (req,res) => {
    const sqlSelectbatchlatestinfo = "SELECT * FROM plant_monitoring WHERE activities_id IN ( SELECT MAX(activities_id) FROM plant_monitoring GROUP BY batch_id);"
    db.query(sqlSelectbatchlatestinfo, (err, result) =>{
        res.send(result);
    })
})
app.get("/plantbatchlatestinfo/:batch_id", (req,res) => {
    const batch_id = req.params.batch_id
    const sqlSelectbatchlatestinfo = "SELECT * FROM plant_monitoring WHERE activities_id IN ( SELECT MAX(activities_id) FROM plant_monitoring GROUP BY batch_id) AND batch_id = ?;"
    db.query(sqlSelectbatchlatestinfo, batch_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/plantbatchinfo/:batch_id", (req,res) => {
    const batch_id = req.params.batch_id;
    const sqlSelectbatchinfo = "SELECT * FROM plant_batch INNER JOIN farm_areas ON plant_batch.area_id=farm_areas.area_id WHERE batch_id = ?;"
    db.query(sqlSelectbatchinfo,batch_id, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantbatchadd", async function (req,res) {
    const plantid = req.body.plantid
    const area_id = req.body.area_id
    const batchstatus = req.body.batchstatus
    const periodstart = req.body.periodstart
    var periodend
    const quantity = req.body.quantity
    const sqlInsertplantbatch= "INSERT INTO plant_batch (plant_id, area_id, batch_status, farm_period_start, expected_harvest_period, quantity) VALUES (?,?,?,?,?,?);"
    const sqlSelectplantprofile = "SELECT * FROM plant_profile WHERE plant_id = ?;"
    var months
    
    function getMonth(){
        return new Promise ((resolve, reject) => {
            db.query(sqlSelectplantprofile,[plantid], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].num_of_mon_to_harvest);
                  }
            })
        })
    }
    months = await getMonth()
    months = parseInt(months)
    //periodend = periodstart.setMonth(periodstart.getMonth()+months);
    let newmonths = new Date (periodstart)
    let monthint = newmonths.getMonth()
    monthint = parseInt(monthint)
    let another = monthint + months
    periodend = new Date(newmonths.setMonth(another))
    db.query(sqlInsertplantbatch,[plantid, area_id, batchstatus, periodstart, periodend, quantity], (err, result) =>{
        console.log(result);
    })
})
app.put('/plantbatchedit', (req,res) => {
    const batch_id = req.body.batch_id
    const area_id = req.body.area_id
    const batch_status = req.body.batch_status
    const newsqlplantbatchupdate = "UPDATE plant_batch SET area_id = ?, batch_status = ?  WHERE batch_id = ?";
    db.query(newsqlplantbatchupdate, [area_id, batch_status, batch_id], (err, result) => {
        if (err) console.log(err);
        console.log(batch_id)
        console.log(batch_status)
    });
})
app.p
app.post("/harvestcalendarmonitoringadd", (req,res) => {
    const batch_id = req.body.batch_id
    const plant_stage = req.body.plant_stage
    const date_from = req.body.date_from
    const date_to = req.body.date_to
    const survival_rate = req.body.survival_rate
    const remarks = req.body.remarks
    const curr_height = req.body.curr_height
    const curr_width = req.body.curr_width
    const quantity = req.body.quantity
    const act_increment = req.body.act_increment
    const sqlInsertplantharvestcalendarmonitoring= "INSERT INTO plant_monitoring (batch_id, plant_stage, date_from, date_to, survival_rate, remarks, curr_height, curr_width, quantity, act_increment) VALUES (?,?,?,?,?,?,?,?,?,?);"
    db.query(sqlInsertplantharvestcalendarmonitoring,[batch_id, plant_stage, date_from, date_to, survival_rate, remarks, curr_height, curr_width, quantity, act_increment], (err, result) =>{
        if (err) console.log(err)
    })
})
app.get('/harvestcalendar/:batch_id', (req, res) => {
    const batch_id = req.params.batch_id;
    const sqlharvestcalendarview = "SELECT * FROM plant_monitoring WHERE batch_id = ?;"
    db.query(sqlharvestcalendarview, batch_id, (err, result) =>{
        res.json(result);
    })
})
app.get("/harvestmonitoring/:batch_id", (req,res) => {
    const batch_id = req.params.batch_id;
    const sqlSelectharvestmonitoring = "SELECT * FROM plant_monitoring WHERE batch_id = ? ORDER BY act_increment DESC LIMIT 1;"
    db.query(sqlSelectharvestmonitoring,batch_id, (err, result) =>{
        res.send(result);
        if(err) console.log(err)
    })
})
app.get("/harvestmonitoringevent/:batch_id/:act_increment", (req,res) => {
    const batch_id = req.params.batch_id;
    const act_increment = req.params.act_increment;
    const sqlSelectharvestmonitoring = "SELECT * FROM plant_monitoring WHERE batch_id = ? and act_increment = ? ORDER BY act_increment DESC LIMIT 1;"
    db.query(sqlSelectharvestmonitoring,[batch_id, act_increment], (err, result) =>{
        res.send(result);
    })
})
app.get("/harvestinputdiseases/:batch_id", (req,res) => {
    const batch_id = req.params.batch_id;
    const sqlSelectbatchdiseases = "SELECT disease_id, diseases, quantity FROM plant_possible_disease INNER JOIN plant_batch ON plant_possible_disease.plant_id=plant_batch.plant_id WHERE plant_batch.batch_id = ?;"
    db.query(sqlSelectbatchdiseases, batch_id, (err, result) =>{
        res.send(result);
    })
})
app.post("/harvestinputdiseasesadd", (req,res) => {
    const disease_id = req.body.disease_id
    const activities_id = req.body.activities_id
    const act_increment = req.body.act_increment
    const num_of_plants_affected = req.body.num_of_plants_affected
    const date_occured = req.body.date_occured
    const disease_desc = req.body.disease_desc
    const dis_status = req.body.dis_status
    const sqlInsertharvestdiseases= "INSERT INTO plant_actual_disease (disease_id, activities_id, act_increment, num_of_plants_affected, date_occured, disease_desc, dis_status) VALUES (?,?,?,?,?,?,?);"
    db.query(sqlInsertharvestdiseases,[disease_id, activities_id, act_increment, num_of_plants_affected, date_occured, disease_desc, dis_status], (err, result) =>{
        if (err) console.log(err)
    })
})
app.get('/harvestdiseaseslist/:batch_id', (req, res) => {
    const batch_id = req.params.batch_id;
    const sqlharvestdiseaseslist = "SELECT disease_act_id, num_of_plants_affected, date_occured, date_cured, disease_desc, dis_status, batch_id FROM plant_actual_disease INNER JOIN plant_monitoring ON plant_actual_disease.activities_id=plant_monitoring.activities_id WHERE plant_monitoring.batch_id = ?;"
    db.query(sqlharvestdiseaseslist, batch_id, (err, result) =>{
        res.json(result);
    })
})

app.get('/harvestdiseasesinfo/:disease_act_id', (req, res) => {
    const disease_act_id = req.params.disease_act_id;
    const sqlharvestdiseaseinfo = "SELECT * FROM plant_actual_disease WHERE disease_act_id = ?;"
    db.query(sqlharvestdiseaseinfo, disease_act_id, (err, result) =>{
        res.json(result);
    })
})
app.put('/harvestdiseaseupdate', (req,res) => {
    const disease_act_id = req.body.disease_act_id
    const num_of_plants_affected = req.body.num_of_plants_affected
    var date_cured = req.body.date_cured
    const disease_desc = req.body.disease_desc
    const dis_status = req.body.dis_status
    const newsqlharvestdiseaseupdate = "UPDATE plant_actual_disease SET num_of_plants_affected = ?, date_cured = ?, disease_desc = ?, dis_status = ? WHERE disease_act_id = ?";
    if (dis_status == "Active"){
        date_cured = ""
    }
    else if (dis_status == "Cured"){
        date_cured = date_cured
    }
    db.query(newsqlharvestdiseaseupdate, [num_of_plants_affected, date_cured, disease_desc, dis_status, disease_act_id], (err, result) => {
        if (err) console.log(err);
        console.log("status: ",dis_status)
        console.log("desc: ",disease_desc)
    });
})
app.post("/harvestinputmortalities", async function (req,res){
    const activities_id = req.body.activities_id
    const batch_id = req.body.batch_id
    var quantity_loss = req.body.quantity_loss
    const date = req.body.date
    var oldquanti, newquanti, quanti2, survival_rate
    const sqlInsertharvestmortalities= "INSERT INTO mortalities (activities_id, batch_id, quantity_loss, date) VALUES (?,?,?,?);"
    const sqlInsertharvestquantityupdate = "UPDATE plant_monitoring SET quantity = ?  WHERE activities_id = ?";
    const sqlInsertharvestsurvivalupdate = "UPDATE plant_monitoring SET survival_rate = ?  WHERE activities_id = ?";
    const sqlselectactivity = "SELECT * FROM plant_monitoring WHERE activities_id = ?";
    const sqlselectbatch = "SELECT * FROM plant_batch WHERE batch_id = ?";
    db.query(sqlInsertharvestmortalities,[activities_id, batch_id, quantity_loss, date], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
    function getinfo(){
        return new Promise ((resolve, reject) => {
            db.query(sqlselectactivity,[activities_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    function getinfo2(){
        return new Promise ((resolve, reject) => {
            db.query(sqlselectbatch,[batch_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    oldquanti = await getinfo();
    oldquanti = parseFloat(oldquanti)
    quantity_loss = parseFloat(quantity_loss)
    newquanti = oldquanti - quantity_loss
    db.query(sqlInsertharvestquantityupdate,[newquanti, activities_id], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
    quanti2 = await getinfo2()
    quanti2 = parseFloat(quanti2)
    survival_rate = ((newquanti / quanti2) * 100)
    db.query(sqlInsertharvestsurvivalupdate,[survival_rate, activities_id], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
        console.log("q2: ", quanti2)
        console.log("survival_rate: ", survival_rate)
    })

})
app.get('/harvestmortalitiesinfo/:batch_id', (req, res) => {
    const batch_id = req.params.batch_id;
    const sqlharvestmortalitiesinfo = "SELECT * FROM mortalities WHERE batch_id = ?;"
    db.query(sqlharvestmortalitiesinfo, batch_id, (err, result) =>{
        res.json(result);
    })
})
app.get('/harvestactivitiesinfo/:activities_id', (req, res) => {
    const activities_id = req.params.activities_id;
    const sqlharvestactivitiesinfo = "SELECT * FROM plant_activities INNER JOIN employees ON plant_activities.emp_id=employees.emp_id WHERE activities_id = ?;"
    db.query(sqlharvestactivitiesinfo, activities_id, (err, result) =>{
        res.json(result);
        if (err) console.log(err)
    })
})
app.post("/harvestinputactivity", (req,res) => { //TO BE EDIT WITH INVENTORY CONNECTION
    const activities_id = req.body.activities_id
    const emp_id = req.body.emp_id
    const activity = req.body.activity
    const report = req.body.report
    const sqlInsertharvestactivity= "INSERT INTO plant_activities (activities_id, emp_id, activity, report) VALUES (?,?,?,?);"
    db.query(sqlInsertharvestactivity,[activities_id, emp_id, activity, report], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
})
app.post("/harvestbatchinput",upload.single('profileImg'), (req,res) => {
    const batch_id = req.body.batch_id
    const batch_img = req.file.buffer.toString('base64')
    const date_harvested = req.body.date_harvested
    const batch_quality = req.body.batch_quality
    const remarks = req.body.remarks
    const batch_status = req.body.batch_status
    const sqlInsertharvestbatch = "INSERT INTO batch_harvest (batch_id, batch_img, date_harvested, batch_quality, remarks, batch_status) VALUES (?,?,?,?,?,?);"
    //const sqlInsertharveststatusupdate = "UPDATE plant_batch SET batch_status = ?  WHERE batch_id = ?";
    db.query(sqlInsertharvestbatch,[batch_id, batch_img, date_harvested, batch_quality, remarks, batch_status], (err, result) =>{
        console.log(result);
        if(err) console.log(err)
    })
    /*db.query(sqlInsertharveststatusupdate, [batch_status, batch_id], (err, result) => {
        console.log(batch_id)
        console.log(batch_status)
        if(err) console.log(err)
    });*/
})
app.get('/harvestinventoryonsalebatches', (req, res) => {
    const sqlharvestonsaleinfo = "SELECT * FROM batch_harvest;"
    db.query(sqlharvestonsaleinfo, (err, result) =>{
        res.json(result);
    })
})
app.get('/harvestinventoryonsalebatchesinfo/:harvest_id', (req, res) => {
    const harvest_id = req.params.harvest_id;
    const sqlharvestonsaleinfo = "SELECT * FROM batch_harvest WhERE harvest_id = ?;"
    db.query(sqlharvestonsaleinfo,harvest_id, (err, result) =>{
        res.json(result);
    })
})
app.post("/harvestinputvariations", (req,res) => {
    const harvest_id = req.body.harvest_id
    const a_grade = req.body.a_grade
    const a_quantity_harvested = req.body.a_quantity_harvested
    const a_units = req.body.a_units
    const a_price_per_unit = req.body.a_price_per_unit
    const b_grade = req.body.b_grade
    const b_quantity_harvested = req.body.b_quantity_harvested
    const b_units = req.body.b_units
    const b_price_per_unit = req.body.b_price_per_unit
    const c_grade = req.body.c_grade
    const c_quantity_harvested = req.body.c_quantity_harvested
    const c_units = req.body.c_units
    const c_price_per_unit = req.body.c_price_per_unit
    const d_grade = req.body.d_grade
    const d_quantity_harvested = req.body.d_quantity_harvested
    const d_units = req.body.d_units
    const d_price_per_unit = req.body.d_price_per_unit
    const batch_status = req.body.batch_status
    const batch_id = req.body.batch_id
    const var_status = "Active"
    const sqlInsertvariations = "INSERT INTO batch_quantity_variations (harvest_id, grade, quantity_harvested, units, price_per_unit, var_status) VALUES (?,?,?,?,?,?);"
    //const sqlInsertharveststatusupdate = "UPDATE plant_batch SET batch_status = ?  WHERE batch_id = ?";
    const sqlInsertharveststatusupdateinharvest = "UPDATE batch_harvest SET batch_status = ?  WHERE harvest_id = ?";
    if (a_quantity_harvested, a_units, a_price_per_unit != ""){
        db.query(sqlInsertvariations,[harvest_id, a_grade, a_quantity_harvested, a_units, a_price_per_unit, var_status], (err, result) =>{
            console.log(result);
        })
    }
    if (b_quantity_harvested, b_units, b_price_per_unit != ""){
        db.query(sqlInsertvariations,[harvest_id, b_grade, b_quantity_harvested, b_units, b_price_per_unit, var_status], (err, result) =>{
            console.log(result);
        })
    }
    if (c_quantity_harvested, c_units, c_price_per_unit != ""){
        db.query(sqlInsertvariations,[harvest_id, c_grade, c_quantity_harvested, c_units, c_price_per_unit, var_status], (err, result) =>{
            console.log(result);
        })
    }
    if (d_quantity_harvested, d_units, d_price_per_unit != ""){
        db.query(sqlInsertvariations,[harvest_id, d_grade, d_quantity_harvested, d_units, d_price_per_unit, var_status], (err, result) =>{
            console.log(result);
        })
    }
    /*db.query(sqlInsertharveststatusupdate, [batch_status, batch_id], (err, result) => {
        console.log(batch_id)
        console.log(batch_status)
    }); */
    db.query(sqlInsertharveststatusupdateinharvest, [batch_status, harvest_id], (err, result) => {
        console.log(batch_id)
        console.log(batch_status)
    });
})
app.get('/harvestvariationsinfo/:harvest_id/:var_status', (req, res) => {
    const harvest_id = req.params.harvest_id;
    const var_status = req.params.var_status;
    const sqlharvestvariationsinfo = "SELECT * FROM batch_quantity_variations WHERE harvest_id = ? and var_status = ?;"
    db.query(sqlharvestvariationsinfo, [harvest_id, var_status], (err, result) =>{
        res.json(result);
    })
})
app.get('/harvestvariationslist/:var_status', (req, res) => {
    const var_status = req.params.var_status;
    const sqlharvestvariationslist = "SELECT * FROM batch_quantity_variations INNER JOIN batch_harvest ON batch_quantity_variations.harvest_id=batch_harvest.harvest_id INNER JOIN plant_batch ON batch_harvest.batch_id=plant_batch.batch_id INNER JOIN plant_profile ON plant_batch.plant_id=plant_profile.plant_id WHERE var_status = ?;"
    db.query(sqlharvestvariationslist, var_status, (err, result) =>{
        res.json(result);
    })
})
app.post("/iteminventoryadd", (req,res) => {
    const supply_name = req.body.supply_name
    const category = req.body.category
    const units = req.body.units
    const perishability = req.body.perishability
    const re_order_lvl = req.body.re_order_lvl
    const description = req.body.description
    const quantity = req.body.quantity
    const sqlInsertiteminventory= "INSERT INTO supplies (category, supply_name, units, description, perishability, re_order_lvl, quantity) VALUES (?,?,?,?,?,?,?);"
    db.query(sqlInsertiteminventory,[category, supply_name, units, description, perishability, re_order_lvl, quantity], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
})
app.get('/iteminventory', (req, res) => {
    const sqliteminfo = "SELECT * FROM supplies;"
    db.query(sqliteminfo, (err, result) =>{
        res.json(result);
    })
})
app.get('/iteminventoryinfo/:supply_id', (req, res) => {
    const supply_id = req.params.supply_id
    const sqliteminfo = "SELECT * FROM supplies WHERE supply_id = ?;"
    db.query(sqliteminfo, supply_id, (err, result) =>{
        res.json(result);
        if (err) console.log (err)
    })
})
app.put('/iteminventoryupdate', (req,res) => {
    const supply_id = req.body.supply_id
    const supply_name = req.body.supply_name
    const category = req.body.category
    const units = req.body.units
    const perishability = req.body.perishability
    const re_order_lvl = req.body.re_order_lvl
    const description = req.body.description
    const newsqlitemupdate = "UPDATE supplies SET supply_name = ?, category = ?, units = ?, perishability = ?, re_order_lvl = ?, description = ? WHERE supply_id = ?";
    db.query(newsqlitemupdate, [supply_name, category, units, perishability, re_order_lvl, description, supply_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.post('/suppliersadd', async function (req,res) {
    const company_name = req.body.company_name;
    const contact_person_name = req.body.contact_person_name
    const position = req.body.position
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const block = req.body.block
    const lot = req.body.lot
    const street = req.body.street
    const barangay = req.body.barangay
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    var supplier_id
    const sqlsupplierprofile = "INSERT INTO supplier_profile (company_name) VALUES (?);"
    const sqlInsertsupplieradress = "INSERT INTO address (supplier_id, block, lot, street, barangay, city, province, zipcode) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertsuppliercontact = "INSERT INTO contact_info (supplier_id, contact_person_name, position, contact_num, contact_email) VALUES (?,?,?,?,?);"
    function addsupplier(){
        return new Promise ((resolve, reject) => {
            db.query(sqlsupplierprofile,[company_name], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result.insertId);
                  }
            })
        })
    }
    supplier_id = await addsupplier();
    db.query(sqlInsertsupplieradress,[supplier_id, block, lot, street, barangay, city, province, zipcode], (err, result) =>{
        if(err) console.log(err)
    })
    db.query(sqlInsertsuppliercontact,[supplier_id, contact_person_name, position, contact_num, contact_email], (err, result) =>{
        if(err) console.log(err)
    })
})
app.get('/supplierslist', (req, res) => {
    const sqlsuppliersinfo = "SELECT * FROM supplier_profile;"
    db.query(sqlsuppliersinfo, (err, result) =>{
        res.json(result);
    })
})
app.get('/addresslist', (req, res) => {
    const sqladdressinfo = "SELECT * FROM address;"
    db.query(sqladdressinfo, (err, result) =>{
        res.json(result);
    })
})
app.get('/contactinfolist', (req, res) => {
    const sqlcontactinfo = "SELECT * FROM contact_info;"
    db.query(sqlcontactinfo, (err, result) =>{
        res.json(result);
    })
})
app.get('/suppliersinfo/:supplier_id', (req, res) => {
    const supplier_id = req.params.supplier_id
    const sqlsuppliersinfo = "SELECT * FROM supplier_profile WHERE supplier_id = ?;"
    db.query(sqlsuppliersinfo, supplier_id,  (err, result) =>{
        res.json(result);
    })
})
app.get('/addressinfo/:supplier_id', (req, res) => {
    const supplier_id = req.params.supplier_id
    const sqladdressinfo = "SELECT * FROM address WHERE supplier_id = ?;"
    db.query(sqladdressinfo, supplier_id, (err, result) =>{
        res.json(result);
    })
})
app.get('/contactinfoinfo/:supplier_id', (req, res) => {
    const supplier_id = req.params.supplier_id
    const sqlcontactinfoinfo = "SELECT * FROM contact_info WHERE supplier_id = ?;"
    db.query(sqlcontactinfoinfo, supplier_id, (err, result) =>{
        res.json(result);
    })
})
app.put('/suppliersupdate', (req,res) => {
    const supplier_id = req.body.supplier_id
    const company_name = req.body.company_name;
    const contact_person_name = req.body.contact_person_name
    const position = req.body.position
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const block = req.body.block
    const lot = req.body.lot
    const street = req.body.street
    const barangay = req.body.barangay
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const newsqlsupplier = "UPDATE supplier_profile SET company_name = ? WHERE supplier_id = ?";
    const newsqlsupplieraddress = "UPDATE address SET block = ?, lot = ?, street = ?, barangay = ?, city = ?, province = ?, zipcode = ? WHERE supplier_id = ?";
    const newsqlsuppliercontactinfo = "UPDATE contact_info SET contact_person_name = ?, position = ?, contact_num = ?, contact_email = ? WHERE supplier_id = ?";
    db.query(newsqlsupplier, [company_name, supplier_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlsupplieraddress, [block, lot, street, barangay, city, province, zipcode, supplier_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlsuppliercontactinfo, [contact_person_name, position, contact_num, contact_email, supplier_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.post("/purchaseorderadd", (req,res) => {
    const supply_id = req.body.supply_id
    const supplier_id = req.body.supplier_id
    const quantity = req.body.quantity
    const units = req.body.units
    const price_per_unit = req.body.price_per_unit
    const total_payment = req.body.total_payment
    const status = req.body.status
    const sqlInsertpurchaseorder= "INSERT INTO purchase_order (supply_id, supplier_id, po_quantity, units, price_per_unit, total_payment, status) VALUES (?,?,?,?,?,?,?);"
    db.query(sqlInsertpurchaseorder,[supply_id, supplier_id, quantity, units, price_per_unit, total_payment, status], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
})
app.get('/purchaseorderlistinfo/:status', (req, res) => {
    const status = req.params.status
    const sqlpolistinfo = "SELECT * FROM purchase_order INNER JOIN supplies ON purchase_order.supply_id=supplies.supply_id INNER JOIN supplier_profile ON purchase_order.supplier_id=supplier_profile.supplier_id WHERE status= ?;"
    db.query(sqlpolistinfo, status, (err, result) =>{
        res.json(result);
    })
})
app.get('/purchaseorderinfo/:po_id', (req, res) => {
    const po_id = req.params.po_id
    const sqlpoinfo = "SELECT * FROM purchase_order WHERE po_id = ?;"
    db.query(sqlpoinfo, po_id, (err, result) =>{
        res.json(result);
        if (err) console.log (err)
    })
})
app.put('/purchaseorderupdate', (req,res) => {
    const po_id = req.body.po_id
    const quantity = req.body.quantity
    const units = req.body.units
    const price_per_unit = req.body.price_per_unit
    const total_payment = req.body.total_payment
    const status = req.body.status
    const newsqlpoupdate = "UPDATE purchase_order SET po_quantity = ?, units = ?, price_per_unit = ?, total_payment = ?, status = ? WHERE po_id = ?";
    db.query(newsqlpoupdate, [quantity, units, price_per_unit, total_payment, status, po_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get('/purchaseorderinfogroup/:supplier_id/:status', (req, res) => {
    const supplier_id = req.params.supplier_id
    const status = req.params.status
    const sqlpogrpinfo = "SELECT * FROM purchase_order INNER JOIN supplies ON purchase_order.supply_id=supplies.supply_id WHERE supplier_id = ? and status = ?;"
    db.query(sqlpogrpinfo, [supplier_id, status], (err, result) =>{
        res.json(result);
        if (err) console.log (err)
    })
})
app.post("/purchaseorderconfirmadd", (req,res) => {
    const supplier_id = req.body.supplier_id
    const poidlist = req.body.poidlist
    const totalamount = req.body.totalamount
    const date_confirmed = req.body.date_confirmed
    const newpoidlist = JSON.stringify(poidlist)
    const total_paid = 0
    const status = "Confirmed"
    const po_status = "Active"
    const sqlInsertpoconfirmation= "INSERT INTO final_po (supplier_id, po_id_list, total_amount, date_confirmed, total_paid, po_status) VALUES (?,?,?,?,?,?);"
    const sqlupdatepoconfirmation= "UPDATE purchase_order SET status = ? WHERE po_id = ?;"
    db.query(sqlInsertpoconfirmation,[supplier_id, newpoidlist, totalamount, date_confirmed, total_paid, po_status], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
    for(let i = 0; i < poidlist.length; i++){
        db.query(sqlupdatepoconfirmation,[status, poidlist[i]], (err, result) =>{
            if (err) console.log(err)
            console.log(result)
        })
    }
})
app.get('/purchaseorderconfirmedlist/:po_status', (req, res) => {
    const po_status = req.params.po_status
    const sqlpoconfirmedinfo = "SELECT * FROM final_po INNER JOIN supplier_profile ON final_po.supplier_id=supplier_profile.supplier_id WHERE po_status = ?;"
    db.query(sqlpoconfirmedinfo, po_status, (err, result) =>{
        res.json(result);
    })
})
app.get('/purchaseorderconfirmedinfo/:final_po_id', (req, res) => {
    const final_po_id = req.params.final_po_id
    const sqlpoconfirmedinfo = "SELECT * FROM final_po INNER JOIN supplier_profile ON final_po.supplier_id=supplier_profile.supplier_id WHERE final_po_id = ?;"
    db.query(sqlpoconfirmedinfo, final_po_id, (err, result) =>{
        res.json(result);
    })
})
app.get('/purchaseorderlistinfoconfirmed/:po_id_list', (req, res) => {
    const po_id_list = req.params.po_id_list
    const po_id = JSON.parse(po_id_list)
    var list = []
    const x = 1
    const sqlconfirmedpolistinfo = "SELECT * FROM purchase_order INNER JOIN supplies ON purchase_order.supply_id=supplies.supply_id WHERE po_id= ?;"
    for (let i = 0; i < po_id.length; i++){
        db.query(sqlconfirmedpolistinfo, po_id[i], (err, result) =>{
            list[i] = result[0]
            if(i === po_id.length - 1){
                res.send(list);
            }
        })
    }
})
app.post("/purchaseorderpayment", async function (req,res) {
    const final_po_id = req.body.final_po_id
    const due_date = req.body.due_date
    const dp_percentage = req.body.dp_percentage
    const dp_amount = req.body.dp_amount
    const payment_method = req.body.payment_method
    const account_id = req.body.account_id
    const account_name = req.body.account_name
    const date_paid = req.body.date_paid
    var paid
    const sqlInsertpurchaseorderpayment= "INSERT INTO payment_for_po (final_po_id, due_date, dp_percentage, dp_amount, payment_method, account_id, account_name, date_paid) VALUES (?,?,?,?,?,?,?,?);"
    const sqlgetfinalpoinfo = "SELECT * FROM final_po WHERE final_po_id = ?;"
    const newpaidamount = "UPDATE final_po SET total_paid = ? WHERE final_po_id = ?";
    db.query(sqlInsertpurchaseorderpayment,[final_po_id, due_date, dp_percentage, dp_amount, payment_method, account_id, account_name, date_paid], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
    function getinfo(){
        return new Promise ((resolve, reject) => {
            db.query(sqlgetfinalpoinfo,[final_po_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].total_paid);
                  }
            })
        })
    }
    paid = await getinfo();
    parseFloat(paid)
    paid = paid + dp_amount
    db.query(newpaidamount,[paid, final_po_id], (err, result) =>{
        if (err) console.log(err)
    })
})
app.get('/purchaseorderpaymentinfo/:final_po_id', (req, res) => {
    const final_po_id = req.params.final_po_id
    const sqlpaymentinfo = "SELECT * FROM payment_for_po WHERE final_po_id = ?;"
    db.query(sqlpaymentinfo, final_po_id, (err, result) =>{
        res.json(result);
    })
})
app.put('/purchaseorderpaid', (req,res) => {
    const final_po_id = req.body.final_po_id
    const date_paid = req.body.date_paid
    const po_status = "Paid"
    const newsqlpopaid = "UPDATE final_po SET po_status = ?, date_paid = ? WHERE final_po_id = ?";
    db.query(newsqlpopaid, [po_status, date_paid, final_po_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.post('/purchaseorderstockin', async function (req,res) {
    const po_id = req.body.po_id
    const supply_id = req.body.supply_id
    var quantity = req.body.quantity
    const units = req.body.units
    var stocked_in_quantity = req.body.stocked_in_quantity
    var po_quantity = req.body.po_quantity
    var today = new Date()
    var po_status = "Partly Stocked In"
    var quantinew, quantiold, quantitotal
    var quantiinput = 0
    const newsqlpostockin = "UPDATE purchase_order SET status = ?, stocked_in_quantity = ?, date = ? WHERE po_id = ?";
    const sqlquantiinfo = "SELECT * FROM supplies WHERE supply_id = ?;"
    const newsqlquantistockin = "UPDATE supplies SET quantity = ? WHERE supply_id = ?";
    if (stocked_in_quantity === null){
        stocked_in_quantity = 0
    }
    function getinfoold(){
        return new Promise ((resolve, reject) => {
            db.query(sqlquantiinfo,[supply_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    quantity = parseFloat(quantity)
    quantinew = quantity
    quantinew = parseFloat(quantinew)
    quantiold = await getinfoold();
    quantiold = parseFloat(quantiold)
    quantitotal = quantiold + quantinew
    quantitotal = parseFloat(quantitotal)
    db.query(newsqlquantistockin,[quantitotal, supply_id], (err, result) =>{
        if (err) console.log(err)
    })
    stocked_in_quantity = parseFloat(stocked_in_quantity)
    quantiinput = stocked_in_quantity + quantity
    if (po_quantity == quantiinput){
        po_status = "Stocked In"
        db.query(newsqlpostockin, [po_status, quantiinput, today, po_id], (err, result) => {
            if (err) console.log(err);
            console.log(result)
        });
    }
    else{
        db.query(newsqlpostockin, [po_status, quantiinput, today, po_id], (err, result) => {
            if (err) console.log(err);
            console.log(result)
        });
    }
    console.log("po_id :", po_id)
    console.log("supply_id :", supply_id )
    console.log("quantity :", quantity)
    console.log("stocked_in_quantity :", stocked_in_quantity)
    console.log("po_quantity :", po_quantity)
    console.log("po_status :", po_status)
    console.log("quantitotal :", quantitotal)
    console.log("quantiinput :", quantiinput)
})
app.get('/purchaseorderinfostockin/:po_id', (req, res) => {
    const po_id = req.params.po_id
    const sqlpostockininfo = "SELECT * FROM purchase_order WHERE po_id = ? ;"
    db.query(sqlpostockininfo, po_id, (err, result) =>{
        res.json(result);
    })
})
app.post("/purchaseorderstockinperishable", async function (req,res) {
    const supply_id = req.body.supply_id
    const po_id = req.body.po_id
    var quantity = req.body.quantity
    const units = req.body.units
    const exp_date = req.body.exp_date
    const status = "Not Expired"
    var stocked_in_quantity = req.body.stocked_in_quantity
    var po_quantity = req.body.po_quantity
    var po_status = "Partly Stocked In"
    var newstockquanti = 0
    var itemquanti
    var today = new Date()
    const sqlInsertperishable= "INSERT INTO perishable_items (supply_id, po_id, quantity, units, exp_date, status) VALUES (?,?,?,?,?,?);"
    const newsqlquantistockin = "UPDATE purchase_order SET stocked_in_quantity = ?, status = ?, date = ? WHERE po_id = ?";
    const getiteminfo = "SELECT * FROM supplies WHERE supply_id = ?";
    const newsqlquantistockinsup = "UPDATE supplies SET quantity = ? WHERE supply_id = ?";
    db.query(sqlInsertperishable,[supply_id, po_id, quantity, units, exp_date, status], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
    })
    if (stocked_in_quantity === null){
        stocked_in_quantity = 0
    }
    quantity = parseFloat(quantity)
    stocked_in_quantity = parseFloat(stocked_in_quantity)
    po_quantity = parseFloat(po_quantity)
    newstockquanti = stocked_in_quantity + quantity
    if(newstockquanti === po_quantity){
        po_status = "Stocked In"
    }
    db.query(newsqlquantistockin,[newstockquanti, po_status, today, po_id], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
        console.log(stocked_in_quantity)
        console.log(quantity)
        console.log(newstockquanti)
        console.log(po_quantity)
    })
    function getinfo(){
        return new Promise ((resolve, reject) => {
            db.query(getiteminfo,[supply_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    itemquanti = await getinfo();
    itemquanti = parseFloat(itemquanti)
    itemquanti = itemquanti + quantity
    db.query(newsqlquantistockinsup,[itemquanti, supply_id], (err, result) =>{
        if (err) console.log(err)
    })
})
app.get("/stockoutitems", (req,res) => {
    const sqlSelectavailable = "SELECT * FROM supplies WHERE quantity > 0;"
    db.query(sqlSelectavailable, (err, result) =>{
        res.send(result);
    })
})
app.get("/stockoutitemsinfo/:supply_id", (req,res) => {
    const supply_id = req.params.supply_id
    const sqlSelectavailableinfo = "SELECT * FROM supplies WHERE supply_id = ?;"
    db.query(sqlSelectavailableinfo, supply_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/stockoutitemsperishable/:supply_id/:status", (req,res) => {
    const supply_id = req.params.supply_id
    const status = req.params.status
    const sqlSelectavailableinfo = "SELECT * FROM perishable_items WHERE supply_id = ? and status = ?;"
    db.query(sqlSelectavailableinfo, [supply_id, status], (err, result) =>{
        res.send(result);
    })
})
app.post("/stockoutitemsinputperishable", async function (req,res) {
    const supply_id = req.body.supply_id
    const assign_id = req.body.assign_id
    const perishable_items_id = req.body.perishable_items_id
    var quantity = req.body.quantity
    const date = req.body.date
    var itemquanti1, itemquanti2, periquanti1, periquanti2, setter
    const newstatus = "Stocked Out"
    const sqlinputstockout = "INSERT INTO stockedout_items (supply_id, assign_id, perishable_items_id, quantity, date) VALUES (?,?,?,?,?);"
    const sqlSelectitems = "SELECT * FROM supplies WHERE supply_id = ?;"
    const sqlSelectperishable = "SELECT * FROM perishable_items WHERE perishable_items_id = ?;"
    const newsqlquantistockoutsup = "UPDATE supplies SET quantity = ? WHERE supply_id = ?";
    const newsqlquantiperishablestockoutsup = "UPDATE perishable_items SET quantity = ? WHERE perishable_items_id = ?";
    const newsqlquantiperishablestockoutstatus = "UPDATE perishable_items SET status = ? WHERE perishable_items_id = ?";
    db.query(sqlinputstockout, [supply_id, assign_id, perishable_items_id, quantity, date], (err, result) =>{
        console.log(result);
        if (err) console.log(err)
    })
    function getinfo1(){
        return new Promise ((resolve, reject) => {
            db.query(sqlSelectitems,[supply_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    function getinfo2(){
        return new Promise ((resolve, reject) => {
            db.query(sqlSelectperishable,[perishable_items_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    itemquanti1 = await getinfo1();
    periquanti1 = await getinfo2();
    quantity = parseFloat(quantity)
    itemquanti1 = parseFloat(itemquanti1)
    periquanti1 = parseFloat(periquanti1)
    itemquanti2 = itemquanti1 - quantity
    periquanti2 = periquanti1 - quantity
    db.query(newsqlquantistockoutsup, [itemquanti2, supply_id], (err, result) =>{
        console.log(result);
        if (err) console.log(err)
    })
    if (perishable_items_id != 0){
        db.query(newsqlquantiperishablestockoutsup, [periquanti2, perishable_items_id], (err, result) =>{
            console.log(result);
            if (err) console.log(err)
        })
        setter = await getinfo2();
    }
    if (setter == 0){
        db.query(newsqlquantiperishablestockoutstatus, [newstatus, perishable_items_id], (err, result) =>{
            console.log(result);
            if (err) console.log(err)
        })
    }
    console.log("supply_id", supply_id)
    console.log("assign_id", assign_id)
    console.log("perishable_items_id", perishable_items_id)
    console.log("quantity", quantity)
    console.log("date", date)
    console.log("itemquanti1", itemquanti1)
    console.log("itemquanti2", itemquanti2)
    console.log("periquanti1", periquanti1)
    console.log("periquanti2", periquanti2)
    console.log("setter", setter)

})
app.post("/stockoutitemsinputnotperishable", async function (req,res) {
    const supply_id = req.body.supply_id
    const assign_id = req.body.assign_id
    var quantity = req.body.quantity
    const date = req.body.date
    var itemquanti1, itemquanti2
    const sqlinputstockout = "INSERT INTO stockedout_items (supply_id, assign_id, quantity, date) VALUES (?,?,?,?);"
    const sqlSelectitems = "SELECT * FROM supplies WHERE supply_id = ?;"
    const newsqlquantistockoutsup = "UPDATE supplies SET quantity = ? WHERE supply_id = ?";
    db.query(sqlinputstockout, [supply_id, assign_id, quantity, date], (err, result) =>{
        console.log(result);
        if (err) console.log(err)
    })
    function getinfo1(){
        return new Promise ((resolve, reject) => {
            db.query(sqlSelectitems,[supply_id], (err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result[0].quantity);
                  }
            })
        })
    }
    itemquanti1 = await getinfo1();
    quantity = parseFloat(quantity)
    itemquanti1 = parseFloat(itemquanti1)
    itemquanti2 = itemquanti1 - quantity
    db.query(newsqlquantistockoutsup, [itemquanti2, supply_id], (err, result) =>{
        console.log(result);
        if (err) console.log(err)
    })
    console.log("supply_id", supply_id)
    console.log("assign_id", assign_id)
    console.log("quantity", quantity)
    console.log("date", date)
    console.log("itemquanti1", itemquanti1)
    console.log("itemquanti2", itemquanti2)

})
app.get("/stockoutharvestmonitoring/:assign_id", (req,res) => {
    const assign_id = req.params.assign_id
    const sqlSelectsomonitor = "SELECT *, stockedout_items.quantity AS soquantity FROM stockedout_items INNER JOIN plant_activities ON stockedout_items.assign_id=plant_activities.assign_id INNER JOIN supplies ON stockedout_items.supply_id=supplies.supply_id WHERE plant_activities.activities_id = ?;"
    db.query(sqlSelectsomonitor, assign_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/iteminventorystockouthistory/:supply_id", (req,res) => {
    const supply_id = req.params.supply_id
    const sqlitemstockouthistory = "SELECT * FROM stockedout_items WHERE supply_id = ?;"
    db.query(sqlitemstockouthistory, supply_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/iteminventorystockinhistory/:supply_id/:status", (req,res) => {
    const supply_id = req.params.supply_id
    const status = req.params.status
    const sqlitemstockouthistory = "SELECT * FROM purchase_order WHERE supply_id = ? and status = ?;"
    db.query(sqlitemstockouthistory, [supply_id, status], (err, result) =>{
        res.send(result);
    })
})
app.post("/inputredelivery", (req,res) => {
    const supply_id = req.body.supply_id
    const po_id = req.body.po_id
    const remarks = req.body.remarks
    const prev_status = req.body.prev_status
    const status = "true"
    const sqlInsertredelivery = "INSERT INTO po_redelivery (supply_id, po_id, remarks, prev_status) VALUES (?,?,?,?);"
    const newsqlquantistockin = "UPDATE purchase_order SET redelivery = ? WHERE po_id = ?";
    db.query(sqlInsertredelivery,[supply_id, po_id, remarks, prev_status], (err, result) =>{
        console.log(result);
    })
    db.query(newsqlquantistockin,[status, po_id], (err, result) =>{
        console.log(result);
    })
})
app.get("/redeliveryinfo/:po_id/:supply_id", (req,res) => {
    const po_id = req.params.po_id
    const supply_id = req.params.supply_id
    const sqlitemstockouthistory = "SELECT * FROM po_redelivery WHERE po_id = ? and supply_id = ?"
    db.query(sqlitemstockouthistory, [po_id, supply_id], (err, result) =>{
        res.send(result);
    })
})
app.put('/updateredelivery', (req,res) => {
    const po_id = req.body.po_id;
    const redelivery_id = req.body.redelivery_id;
    const date_delivered = req.body.date_delivered;
    const prev_status = req.body.prev_status
    const status = "false"
    const sqlUpdatepo = "UPDATE purchase_order SET redelivery = ? WHERE po_id = ?";
    const sqlUpdatered = "UPDATE po_redelivery SET date_delivered = ? WHERE po_redelivery_id = ?";
    db.query(sqlUpdatepo, [status, po_id], (err, result) => {
        if (err) console.log(err);
        console.log("res1", result)
    });
    db.query(sqlUpdatered, [date_delivered, redelivery_id], (err, result) => {
        if (err) console.log(err);
        console.log("res2", result)
        console.log("date", date_delivered)
        console.log("po_redelivery_id", redelivery_id)
    });
})
app.post("/inputrefund", (req,res) => {
    const supply_id = req.body.supply_id
    const po_id = req.body.po_id
    const amount = req.body.amount
    const date = req.body.date
    const remarks = req.body.remarks
    const payment_method = req.body.payment_method
    const account_id = req.body.account_id
    const account_name = req.body.account_name
    const status = "true"
    const sqlInsertrefund = "INSERT INTO po_refund (supply_id, po_id, amount, date, remarks, payment_method, account_id, account_name) VALUES (?,?,?,?,?,?,?,?);"
    const newsqlquantistockin = "UPDATE purchase_order SET refund = ? WHERE po_id = ?";
    db.query(sqlInsertrefund,[supply_id, po_id, amount, date, remarks, payment_method, account_id, account_name], (err, result) =>{
        console.log(result);
    })
    db.query(newsqlquantistockin,[status, po_id], (err, result) =>{
        console.log(result);
    })
})
app.get("/availablewastedplants/:status", (req,res) => {
    const status = req.params.status
    const sqlSelectplants = "SELECT * FROM batch_quantity_variations WHERE var_status = ?;"
    db.query(sqlSelectplants, status, (err, result) =>{
        res.send(result);
    })
})
app.put("/availablewastedplantsupdate", (req,res) => {
    const status = req.body.status
    const quantity_id = req.body.quantity_id
    const sqlupdateplants = "UPDATE batch_quantity_variations SET var_status = ? WHERE quantity_id = ?";
    db.query(sqlupdateplants,[status, quantity_id], (err, result) =>{
        console.log(result);
        if (err) console.log(err)
    })
})
app.post("/otherexpensesadd", (req,res) => {
    const otherexpensesid = req.body.otherexpensesid
    const total_amount = req.body.total_amount
    const period_from = req.body.period_from
    const period_to = req.body.period_to
    const due_date = req.body.due_date
    const status = req.body.status
    const barcode_or_receipt = req.body.barcode_or_receipt
    const sqlInsertotherexpenses = "INSERT INTO other_expenses (otherexpensesid, total_amount, period_from, period_to, due_date, status, barcode_or_receipt) VALUES (?,?,?,?,?,?,?);"
    db.query(sqlInsertotherexpenses,[otherexpensesid, total_amount, period_from, period_to, due_date, status, barcode_or_receipt], (err, result) =>{
        console.log(result);
        if (err) console.log(err)
    })
})
app.get("/otherexpensespending/:status", (req,res) => {
    const status = req.params.status
    const sqlSelectoepending = "SELECT * FROM other_expenses INNER JOIN plantutilitiesotherexpensesprofiles ON other_expenses.otherexpensesid=plantutilitiesotherexpensesprofiles.otherexpensesid WHERE status = ?;"
    db.query(sqlSelectoepending, status, (err, result) =>{
        res.send(result);
        if (err) console.log(err)
    })
})
app.get("/otherexpensespaid/:status", (req,res) => {
    const status = req.params.status
    const sqlSelectoepending = "SELECT * FROM other_expenses INNER JOIN plantutilitiesotherexpensesprofiles ON other_expenses.otherexpensesid=plantutilitiesotherexpensesprofiles.otherexpensesid INNER JOIN employees ON other_expenses.emp_id=employees.emp_id WHERE status = ?;"
    db.query(sqlSelectoepending, status, (err, result) =>{
        res.send(result);
        if (err) console.log(err)
    })
})
app.get("/otherexpensesinfo/:other_expenses_id", (req,res) => {
    const other_expenses_id = req.params.other_expenses_id
    const sqlSelectoeinfo = "SELECT * FROM other_expenses INNER JOIN plantutilitiesotherexpensesprofiles ON other_expenses.otherexpensesid=plantutilitiesotherexpensesprofiles.otherexpensesid WHERE other_expenses_id = ?;"
    db.query(sqlSelectoeinfo, other_expenses_id, (err, result) =>{
        res.send(result);
        if (err) console.log(err)
    })
})
app.put('/otherexpensesupdate', (req,res) => {
    const other_expenses_id = req.body.other_expenses_id;
    const emp_id = req.body.emp_id;
    const paid_to = req.body.paid_to;
    const date_paid = req.body.date_paid;
    const payment_method = req.body.payment_method;
    const total_payment = req.body.total_payment;
    const account_id = req.body.account_id;
    const account_name = req.body.account_name;
    const status = req.body.status;
    const sqlUpdateeo = "UPDATE other_expenses SET emp_id = ?, paid_to = ?, date_paid = ?, payment_method = ?, total_payment = ?, account_id = ?, account_name = ?, status = ? WHERE other_expenses_id = ?";
    db.query(sqlUpdateeo, [emp_id, paid_to, date_paid, payment_method, total_payment, account_id, account_name, status, other_expenses_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/purchaseorderexpenses", (req,res) => {
    const sqlSelectpoexpenses = "SELECT * FROM payment_for_po INNER JOIN final_po ON payment_for_po.final_po_id=final_po.final_po_id INNER JOIN supplier_profile ON final_po.supplier_id=supplier_profile.supplier_id;"
    db.query(sqlSelectpoexpenses, (err, result) =>{
        res.send(result);
    })
})
app.get('/redeliverylist', (req, res) => {
    const sqlSelectred = "SELECT * FROM po_redelivery INNER JOIN supplies ON po_redelivery.supply_id=supplies.supply_id INNER JOIN purchase_order ON po_redelivery.po_id=purchase_order.po_id INNER JOIN supplier_profile ON purchase_order.supplier_id=supplier_profile.supplier_id;"
    db.query(sqlSelectred, (err, result) =>{
        res.send(result);
        console.log(result)
    })
})
app.get('/redefundlist', (req, res) => {
    const sqlSelectref = "SELECT *, po_refund.date as refunddate FROM po_refund INNER JOIN supplies ON po_refund.supply_id=supplies.supply_id INNER JOIN purchase_order ON po_refund.po_id=purchase_order.po_id INNER JOIN supplier_profile ON purchase_order.supplier_id=supplier_profile.supplier_id;"
    db.query(sqlSelectref, (err, result) =>{
        res.send(result);
        console.log(result)
    })
})
app.put('/expireditems', async function (req,res) {
    let today = new Date();
    const status = "Expired";
    const sqlSelectitems1 = "SELECT * FROM perishable_items"
    var itemslength
    const sqlSelectitems = "SELECT * FROM perishable_items WHERE perishable_items_id = ?;"
    const sqlUpdateexpired = "UPDATE perishable_items SET status = ? WHERE perishable_items_id = ?";
    function getinfo1(){
        return new Promise ((resolve, reject) => {
            db.query(sqlSelectitems1,(err, result) =>{
                if (err) {
                    reject(err);
                  }
                  else {
                    resolve(result.length);
                  }
            })
        })
    }
    itemslength = await getinfo1();
    for (let i = 1; i <= itemslength; i++){
        db.query(sqlSelectitems, [i], (err, result) => {
            let oldstatus = result[0].status
            let exp_date = result[0].exp_date
            let today = new Date()
            exp_date = new Date(exp_date)
            //exp_date = exp_date.valueOf()
            //today = today.valueOf()
            //exp_date = (new Date(exp_date)).toLocaleDateString();
            //today = (new Date(today)).toLocaleDateString();
            if (exp_date <= today){
                db.query(sqlUpdateexpired,[status, i],(err, result) =>{
                    if(err) console.log(err)
                })
            }
            
        });
    }
})
app.get("/batchvariationsprice/:quantity_id", (req,res) => {
    const quantity_id = req.params.quantity_id
    const sqlSelectvariations = "SELECT * FROM batch_quantity_variations WHERE quantity_id = ?;"
    db.query(sqlSelectvariations,quantity_id, (err, result) =>{
        res.send(result);
    })
})
app.put('/batchvariationspriceedit', (req,res) => {
    const price_per_unit = req.body.price_per_unit;
    const quantity_id = req.body.quantity_id;
    const sqlUpdateprice = "UPDATE batch_quantity_variations SET price_per_unit = ? WHERE quantity_id = ?";
    db.query(sqlUpdateprice, [price_per_unit, quantity_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/farmareas/:farm_id", (req,res) => {
    const farm_id = req.params.farm_id;
    const sqlSelectareas = "SELECT * FROM farm_areas WHERE farm_id = ?;"
    db.query(sqlSelectareas, farm_id, (err, result) =>{
        res.send(result);
    })
})
app.get("/farmareaslist", (req,res) => {
    const sqlSelectareaslist = "SELECT * FROM farm_areas;"
    db.query(sqlSelectareaslist, (err, result) =>{
        res.send(result);
    })
})
app.post("/farmareasadd", (req,res) => {
    const farm_id = req.body.farm_id
    const area_name = req.body.area_name
    const soil_type = req.body.soil_type
    const size = req.body.size
    const sqlInsertareas = "INSERT INTO farm_areas (farm_id, area_name, soil_type, size) VALUES (?,?,?,?);"
    db.query(sqlInsertareas,[farm_id, area_name, soil_type, size], (err, result) =>{
        console.log(result);
        if(err) console.log(err)
    })
})
app.get("/farmareasinfo/:area_id", (req,res) => {
    const area_id = req.params.area_id;
    const sqlSelectareasinfo = "SELECT * FROM farm_areas WHERE area_id = ?;"
    db.query(sqlSelectareasinfo, area_id, (err, result) =>{
        res.send(result);
        console.log(result)
    })
})
app.put('/farmareasupdate', (req,res) => {
    const area_id = req.body.area_id
    const area_name = req.body.area_name
    const soil_type = req.body.soil_type
    const size = req.body.size
    const sqlUpdateareas = "UPDATE farm_areas SET area_name = ?, soil_type = ?, size = ? WHERE area_id = ?";
    db.query(sqlUpdateareas, [area_name, soil_type, size, area_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/searchidfarmareas/:area_id", (req,res) => {
    const area_id = req.params.area_id
    const sqlSelect = "SELECT * FROM farm_areas WHERE area_id = ?;"
    db.query(sqlSelect,area_id, (err, result) =>{
        res.send(result);
        if(err) console.log(err)
        console.log("id", result)
    })
})
app.get("/searchnamefarmareas/:area_name", (req,res) => {
    const area_name = req.params.area_name
    const sqlSelect = "SELECT * FROM farm_areas WHERE area_name = ?;"
    db.query(sqlSelect,area_name, (err, result) =>{
        res.send(result);
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