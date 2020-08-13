//Requires
const express = require('express');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const { v4: uuidv4 } = require('uuid');
const admin = require('./source/admin');

//Create Express App
const app = express();

//App usage
app.use('/static/', express.static('./static/'));
app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array()); 
app.use(express.static('public'));

//View Enging: EJS
app.set('view engine', 'ejs')

//Setup Port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

//Setup Node-Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

//App Default Repsonse
app.get('/', (req, res) => {
  res.render('pages/home',{query:req.query});
});

//DATABASE Response
app.get(['/data','/data/*'], async (req,res)=>{
  //console.log(req.params[0]);
  res.render('pages/data',{query:req.query});
});

//ADMIN ONLY TEST
app.get('/admin', async (req,res)=>{
  admin.load(req,res,pool,'admin');
});

//App DB Response
app.get('/db', async (req,res)=>{
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
});

//App FORM POST
app.post('/auth', async function(req, res){
  admin.login(req,res,pool,process.env.AUTH_PW);
});

app.post('/logout', async function(req, res){
  admin.logout(req,res,pool);
});

//Start App on given port
app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});