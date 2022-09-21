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

/*const db = mysql.createPool({
    host: '192.168.0.103',
    user: 'rtalo',
    password: 'admin12#',
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
    const sqlemployeeview = "SELECT * from employee_position_history WHERE emp_id = ?;"
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
app.put('/employeelistupdate', (req,res) => {
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
    db.query(newsqlemployeeupdate, [employeefarm, employeename, employeecontact, employeeeducationalattainment, employeeposition, employeestatus, emp_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(newsqlemployeeaddress, [employeelot, employeestreet, employeecity, employeeprovince, employeezipcode, emp_id], (err, result) => {
        if (err) console.log(err);
    });
    db.query(sqlInsertemployeeposition,[emp_id, employeeposition, employeestatus], (err, result) =>{
        if (err) console.log(err);
    })
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
app.get("/plantbatchlistlatestinfo", (req,res) => {
    const sqlSelectbatchlatestinfo = "SELECT * FROM plant_monitoring WHERE activities_id IN ( SELECT MAX(activities_id) FROM plant_monitoring GROUP BY batch_id);"
    db.query(sqlSelectbatchlatestinfo, (err, result) =>{
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