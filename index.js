const express = require('express');
const app = express();
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { parse } = require('path');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

/*const db = mysql.createPool({
    host: '192.168.254.111',
    user: 'rjatalo',
    password: 'root',
    database: 'farmsys',
    port:3306
});*/
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
    const sqlSelect = "SELECT * FROM employees;"
    db.query(sqlSelect, (err, result) =>{
        res.send(result);
    })
})


app.post("/employeelistadd", upload.array('images', 2), async function (req,res) {

    const employeename = req.body.employeename
    const employeefarm = req.body.employeefarm
    const employeelot = req.body.employeelot
    const employeestreet = req.body.employeestreet
    const employeecity = req.body.employeecity
    const employeeprovince = req.body.employeeprovince
    const employeezipcode = req.body.employeezipcode
    const employeecontact = req.body.employeecontact
    const employeeeducationalattainment = req.body.employeeeducationalattainment
    const employeeposition = req.body.employeeposition
    const employeestatus= req.body.employeestatus
    const employeejobdescription = req.body.employeejobdescription
    const employeeidpicture = req.body.employeeidpicture
    var emp_id
    const sqlInsertemployee = "INSERT INTO employees (farm_id, emp_name, contact_num, educational_attainment, emp_pos, emp_status, job_desc, id_pic) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertemployeeaddress = "INSERT INTO address (emp_id, lot, street, city, province, zipcode) VALUES (?,?,?,?,?,?);"
    const sqlInsertemployeeposition = "INSERT INTO employee_position_history (emp_id, emp_position, emp_status) VALUES (?,?,?);"
    function addemployee(){
        return new Promise ((resolve, reject) => {
            db.query(sqlInsertemployee,[employeefarm, employeename, employeecontact, employeeeducationalattainment, employeeposition, employeestatus, employeejobdescription, employeeidpicture], (err, result) =>{
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
    db.query(sqlInsertemployeeaddress,[emp_id, employeelot, employeestreet, employeecity, employeeprovince, employeezipcode], (err, result) =>{
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
    const employeefarm = req.body.employeefarm
    const employeelot = req.body.employeelot
    const employeestreet = req.body.employeestreet
    const employeecity = req.body.employeecity
    const employeeprovince = req.body.employeeprovince
    const employeezipcode = req.body.employeezipcode
    const employeecontact = req.body.employeecontact
    const employeeeducationalattainment = req.body.employeeeducationalattainment
    const employeeposition = req.body.employeeposition
    const employeestatus= req.body.employeestatus
    const newsqlemployeeupdate = "UPDATE employees SET farm_id = ?, emp_name = ?, contact_num = ?, educational_attainment = ?, emp_pos = ?, emp_status = ? WHERE emp_id = ?";
    const newsqlemployeeaddress = "UPDATE address SET lot = ?, street = ?, city = ?, province = ?, zipcode= ? WHERE emp_id = ?";
    const sqlInsertemployeeposition = "INSERT INTO employee_position_history (emp_id, emp_position, emp_status) VALUES (?,?,?);"
    const sqlcheckposhistory = "SELECT * FROM employee_position_history WHERE emp_id = ? ORDER BY date_given DESC LIMIT 1;"
    var oldpos, oldstatus
    db.query(newsqlemployeeupdate, [employeefarm, employeename, employeecontact, employeeeducationalattainment, employeeposition, employeestatus, emp_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlemployeeaddress, [employeelot, employeestreet, employeecity, employeeprovince, employeezipcode, emp_id], (err, result) => {
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
app.post("/plantprofileadd", upload.single("image"), (req,res) => {
    const plantprofileplantname = req.body.plantprofileplantname
    const plantprofilefarm = req.body.plantprofilefarm
    const plantprofilecategory = req.body.plantprofilecategory
    const plantprofilescientificname = req.body.plantprofilepscientificname
    const plantprofilevariety = req.body.plantprofilevariety
    const plantprofileplanttype = req.body.plantprofileplanttype
    const plantprofilemonths = req.body.plantprofilemonths
    const plantprofilepicture = req.body.plantprofilepicture
    const plantprofiledescription = req.body.plantprofiledescription
    const sqlInsertplantprofile = "INSERT INTO plant_profile (farm_id, plant_name, sci_name, category, variety, plant_type, num_of_mon_to_harvest, img, plant_desc) VALUES (?,?,?,?,?,?,?,?,?);"
    db.query(sqlInsertplantprofile,[plantprofilefarm, plantprofileplantname, plantprofilescientificname, plantprofilecategory, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofilepicture, plantprofiledescription], (err, result) =>{
        console.log(plantprofileplantname);
        console.log(plantprofilefarm);
        console.log(plantprofilecategory);
        console.log(plantprofilescientificname);
        console.log(plantprofilevariety);
        console.log(plantprofileplanttype);
        console.log(plantprofilemonths);
        console.log(plantprofilepicture);
        console.log(plantprofiledescription);
        if(err) console.log(err)
    })
})
app.put("/plantprofileedit", (req,res) => {
    const plantprofileid = req.body.plantprofileid
    const plantprofileplantname = req.body.plantprofileplantname
    const plantprofilefarm = req.body.plantprofilefarm
    const plantprofilecategory = req.body.plantprofilecategory
    const plantprofilescientificname = req.body.plantprofilescientificname
    const plantprofilevariety = req.body.plantprofilevariety
    const plantprofileplanttype = req.body.plantprofileplanttype
    const plantprofilemonths = req.body.plantprofilemonths
    const plantprofiledescription = req.body.plantprofiledescription
    const sqlplantprofileedit= "UPDATE plant_profile SET farm_id = ?, plant_name = ?, sci_name = ?, category = ?, variety = ?, plant_type = ?, num_of_mon_to_harvest = ?, plant_desc = ? WHERE plant_id = ?";
    db.query(sqlplantprofileedit, [plantprofilefarm, plantprofileplantname, plantprofilescientificname, plantprofilecategory, plantprofilevariety, plantprofileplanttype, plantprofilemonths, plantprofiledescription, plantprofileid], (err, result) => {
        if (err) console.log(err);
        console.log(plantprofileid)
        console.log(plantprofileplantname)
        console.log(plantprofilefarm)
        console.log(plantprofilecategory)
        console.log(plantprofilescientificname)
        console.log(plantprofilevariety)
        console.log(plantprofileplanttype)
        console.log(plantprofilemonths)
        console.log(plantprofiledescription)
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
    const sqlSelectemployeesaccount = "SELECT * FROM employees INNER JOIN employee_accounts ON employees.emp_id = employee_accounts.emp_id;"
    db.query(sqlSelectemployeesaccount, (err, result) =>{
        res.send(result);
    })
})
app.get("/employeesaccountfilter", (req,res) => {
    const sqlSelectemployeesaccountfilter = "SELECT * FROM employees WHERE employees.emp_id NOT IN (SELECT employee_accounts.emp_id FROM employee_accounts);"
    db.query(sqlSelectemployeesaccountfilter, (err, result) =>{
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
    const newsqlemployeeaccountupdate = "UPDATE employee_accounts SET username = ? , pass = ?, account_type = ? WHERE emp_id = ?";
    db.query(newsqlemployeeaccountupdate, [newemployeeaccountusername, newemployeeaccountpassword, newemployeeaccounttype, employeeaccountid], (err, result) => {
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
app.post("/farmpprofileadd", async function (req,res)  {
    //farm
    const farm_name = req.body.farm_name
    const size = req.body.size
    const soil_type = req.body.soil_type
    const description = req.body.description
    const title = req.body.title
    const main_owner = req.body.main_owner
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
    const lot = req.body.lot
    const street = req.body.street
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    //owner address
    const owner_lot = req.body.owner_lot
    const owner_street = req.body.owner_street
    const owner_city = req.body.owner_city
    const owner_province = req.body.owner_province
    const owner_zipcode = req.body.owner_zipcode
    const sqlInsertfarmprofile = "INSERT INTO farm (farm_name, size, soil_type, description, title, main_owner) VALUES (?,?,?,?,?,?);"
    const sqlInsertownerprofile = "INSERT INTO owners (farm_id, owner_name, owner_type, contact_num, contact_email, educational_attainment, position, job_desc) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertfarmcontact = "INSERT INTO contact_info (farm_id, contact_person_name, position, contact_num, contact_email) VALUES (?,?,?,?,?);"
    const sqlInsertfarmadress = "INSERT INTO address (farm_id, lot, street, city, province, zipcode) VALUES (?,?,?,?,?,?);"
    const sqlInsertowneradress = "INSERT INTO address (owner_id, lot, street, city, province, zipcode) VALUES (?,?,?,?,?,?);"
    function addfarm(){
        return new Promise ((resolve, reject) => {
            db.query(sqlInsertfarmprofile,[farm_name, size, soil_type, description, title, main_owner], (err, result) =>{
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
    db.query(sqlInsertfarmadress,[farm_id, lot, street, city, province, zipcode], (err, result) =>{
    })
    db.query(sqlInsertowneradress,[owner_id, owner_lot, owner_street, owner_city, owner_province, owner_zipcode], (err, result) =>{
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
    const sqlSelectowneraddress = "SELECT address.owner_id, address.lot, address.city, address.province, address.zipcode FROM address INNER JOIN owners ON address.owner_id = owners.owner_id INNER JOIN farm ON owners.farm_id = farm.farm_id WHERE farm.farm_id = ?;"
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
    const lot = req.body.lot
    const street = req.body.street
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const sqlInsertownerprofile = "INSERT INTO owners (farm_id, owner_name, owner_type, contact_num, contact_email, educational_attainment, position, job_desc) VALUES (?,?,?,?,?,?,?,?);"
    const sqlInsertowneradress = "INSERT INTO address (owner_id, lot, street, city, province, zipcode) VALUES (?,?,?,?,?,?);"
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
    db.query(sqlInsertowneradress,[owner_id, lot, street, city, province, zipcode], (err, result) =>{
    })
})
app.put('/farmupdate', (req,res) => {
    const farm_id = req.body.farm_id
    const size = req.body.size
    const soil_type = req.body.soil_type
    const description = req.body.description
    const title = req.body.title
    const main_owner = req.body.main_owner
    const lot = req.body.lot
    const street = req.body.street
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const contact_person_name = req.body.contact_person_name
    const position = req.body.position
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const newsqlfarmupdate = "UPDATE farm SET size = ? , soil_type = ?, description = ?, title = ? , main_owner = ? WHERE farm_id = ?";
    const newsqlfarmaddressupdate = "UPDATE address SET lot = ? , street = ?, city = ?, province = ? , zipcode = ? WHERE farm_id = ?";
    const newsqlfarmcontactupdate = "UPDATE contact_info SET contact_person_name = ? , position = ?, contact_num = ?, contact_email = ? WHERE farm_id = ?";
    db.query(newsqlfarmupdate, [size, soil_type, description, title, main_owner, farm_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlfarmaddressupdate, [lot, street, city, province, zipcode, farm_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlfarmcontactupdate, [contact_person_name, position, contact_num, contact_email, farm_id], (err, result) => {
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
    const lot = req.body.lot
    const street = req.body.street
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const newsqlownerupdate = "UPDATE owners SET owner_name = ? , contact_num = ?, contact_email = ?, owner_type = ? , educational_attainment = ?, position = ?, job_desc = ? WHERE owner_id = ?";
    const newsqlowneraddressupdate = "UPDATE address SET lot = ? , street = ?, city = ?, province = ? , zipcode = ? WHERE owner_id = ?";
    db.query(newsqlownerupdate, [owner_name, contact_num, contact_email, owner_type, educational_attainment, position, job_desc, owner_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlowneraddressupdate, [lot, street, city, province, zipcode, owner_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.get("/plantbatchlist/:batch_status", (req,res) => {
    const batch_status = req.params.batch_status;
    const sqlSelectbatch = "SELECT * FROM plant_batch INNER JOIN plant_profile ON plant_batch.plant_id = plant_profile.plant_id WHERE plant_batch.batch_status = ?;"
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
    const sqlSelectbatchinfo = "SELECT * FROM plant_batch WHERE batch_id = ?;"
    db.query(sqlSelectbatchinfo,batch_id, (err, result) =>{
        res.send(result);
    })
})
app.post("/plantbatchadd", (req,res) => {
    const plantid = req.body.plantid
    const batchstatus = req.body.batchstatus
    const periodstart = req.body.periodstart
    const periodend = req.body.periodend
    const quantity = req.body.quantity
    const measurement = req.body.measurement
    const sqlInsertplantbatch= "INSERT INTO plant_batch (plant_id, batch_status, farm_period_start, expected_harvest_period, quantity, measurement) VALUES (?,?,?,?,?,?);"
    db.query(sqlInsertplantbatch,[plantid, batchstatus, periodstart, periodend, quantity, measurement], (err, result) =>{
        console.log(result);
    })
})
app.put('/plantbatchedit', (req,res) => {
    const batch_id = req.body.batch_id
    const batch_status = req.body.batch_status
    const newsqlplantbatchupdate = "UPDATE plant_batch SET batch_status = ?  WHERE batch_id = ?";
    db.query(newsqlplantbatchupdate, [batch_status, batch_id], (err, result) => {
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
app.post("/harvestinputmortalities", (req,res) => {
    const activities_id = req.body.activities_id
    const batch_id = req.body.batch_id
    const quantity_loss = req.body.quantity_loss
    const units = req.body.units
    const date = req.body.date
    const sqlInsertharvestmortalities= "INSERT INTO mortalities (activities_id, batch_id, quantity_loss, units, date) VALUES (?,?,?,?,?);"
    db.query(sqlInsertharvestmortalities,[activities_id, batch_id, quantity_loss, units, date], (err, result) =>{
        if (err) console.log(err)
        console.log(result)
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
app.post("/harvestbatchinput", (req,res) => {
    const batch_id = req.body.batch_id
    const batch_img = req.body.batch_img
    const batch_vid = req.body.batch_vid
    const date_harvested = req.body.date_harvested
    const batch_quality = req.body.batch_quality
    const remarks = req.body.remarks
    const batch_status = req.body.batch_status
    const sqlInsertharvestbatch = "INSERT INTO batch_harvest (batch_id, batch_img, batch_vid, date_harvested, batch_quality, remarks, batch_status) VALUES (?,?,?,?,?,?,?);"
    const sqlInsertharveststatusupdate = "UPDATE plant_batch SET batch_status = ?  WHERE batch_id = ?";
    db.query(sqlInsertharvestbatch,[batch_id, batch_img, batch_vid, date_harvested, batch_quality, remarks, batch_status], (err, result) =>{
        console.log(result);
    })
    db.query(sqlInsertharveststatusupdate, [batch_status, batch_id], (err, result) => {
        console.log(batch_id)
        console.log(batch_status)
    });
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
    const sqlInsertharveststatusupdate = "UPDATE plant_batch SET batch_status = ?  WHERE batch_id = ?";
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
    db.query(sqlInsertharveststatusupdate, [batch_status, batch_id], (err, result) => {
        console.log(batch_id)
        console.log(batch_status)
    });
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
    const farm_id = req.body.farm_id
    const units = req.body.units
    const perishability = req.body.perishability
    const re_order_lvl = req.body.re_order_lvl
    const description = req.body.description
    const quantity = req.body.quantity
    const sqlInsertiteminventory= "INSERT INTO supplies (farm_id, supply_name, units, description, perishability, re_order_lvl, quantity) VALUES (?,?,?,?,?,?,?);"
    db.query(sqlInsertiteminventory,[farm_id, supply_name, units, description, perishability, re_order_lvl, quantity], (err, result) =>{
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
    const farm_id = req.body.farm_id
    const units = req.body.units
    const perishability = req.body.perishability
    const re_order_lvl = req.body.re_order_lvl
    const description = req.body.description
    const newsqlitemupdate = "UPDATE supplies SET supply_name = ?, farm_id = ?, units = ?, perishability = ?, re_order_lvl = ?, description = ? WHERE supply_id = ?";
    db.query(newsqlitemupdate, [supply_name, farm_id, units, perishability, re_order_lvl, description, supply_id], (err, result) => {
        if (err) console.log(err);
    });
})
app.post('/suppliersadd', async function (req,res) {
    const company_name = req.body.company_name;
    const contact_person_name = req.body.contact_person_name
    const position = req.body.position
    const contact_num = req.body.contact_num
    const contact_email = req.body.contact_email
    const lot = req.body.lot
    const street = req.body.street
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    var supplier_id
    const sqlsupplierprofile = "INSERT INTO supplier_profile (company_name) VALUES (?);"
    const sqlInsertsupplieradress = "INSERT INTO address (supplier_id, lot, street, city, province, zipcode) VALUES (?,?,?,?,?,?);"
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
    db.query(sqlInsertsupplieradress,[supplier_id, lot, street, city, province, zipcode], (err, result) =>{
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
    const lot = req.body.lot
    const street = req.body.street
    const city = req.body.city
    const province = req.body.province
    const zipcode = req.body.zipcode
    const newsqlsupplier = "UPDATE supplier_profile SET company_name = ? WHERE supplier_id = ?";
    const newsqlsupplieraddress = "UPDATE address SET lot = ?, street = ?, city = ?, province = ?, zipcode = ? WHERE supplier_id = ?";
    const newsqlsuppliercontactinfo = "UPDATE contact_info SET contact_person_name = ?, position = ?, contact_num = ?, contact_email = ? WHERE supplier_id = ?";
    db.query(newsqlsupplier, [company_name, supplier_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlsupplieraddress, [lot, street, city, province, zipcode, supplier_id], (err, result) => {
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
    const sqlpoconfirmedinfo = "SELECT * FROM final_po WHERE final_po_id = ?;"
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
    var po_status = "Partly Stocked In"
    var quantinew, quantiold, quantitotal
    var quantiinput = 0
    const newsqlpostockin = "UPDATE purchase_order SET status = ?, stocked_in_quantity = ? WHERE po_id = ?";
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
        db.query(newsqlpostockin, [po_status, quantiinput, po_id], (err, result) => {
            if (err) console.log(err);
        });
    }
    else{
        db.query(newsqlpostockin, [po_status, quantiinput, po_id], (err, result) => {
            if (err) console.log(err);
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
    const sqlInsertperishable= "INSERT INTO perishable_items (supply_id, po_id, quantity, units, exp_date, status) VALUES (?,?,?,?,?,?);"
    const newsqlquantistockin = "UPDATE purchase_order SET stocked_in_quantity = ?, status = ? WHERE po_id = ?";
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
    db.query(newsqlquantistockin,[newstockquanti, po_status, po_id], (err, result) =>{
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
    const status = "Redelivery"
    const sqlInsertredelivery = "INSERT INTO redelivery (supply_id, po_id, remarks, prev_status) VALUES (?,?,?,?);"
    const newsqlquantistockin = "UPDATE purchase_order SET status = ? WHERE po_id = ?";
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
    const sqlitemstockouthistory = "SELECT * FROM redelivery WHERE po_id = ? and supply_id = ?"
    db.query(sqlitemstockouthistory, [po_id, supply_id], (err, result) =>{
        res.send(result);
    })
})
app.put('/updateredelivery', (req,res) => {
    const po_id = req.body.po_id;
    const redelivery_id = req.body.redelivery_id;
    const date_delivered = req.body.date_delivered;
    const prev_status = req.body.prev_status
    const sqlUpdatepo = "UPDATE purchase_order SET status = ? WHERE po_id = ?";
    const sqlUpdatered = "UPDATE redelivery SET date_delivered = ? WHERE redelivery_id = ?";
    db.query(sqlUpdatepo, [prev_status, po_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(sqlUpdatered, [date_delivered, redelivery_id], (err, result) => {
        if (err) console.log(err);
    });
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