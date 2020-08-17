//Requires
const express = require('express');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const admin = require('./models/admin');
const cards = require('./models/cards');

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
app.get(['/db','/db/*'], async (req,res)=>{
  cards.get(req,res,pool);
  //console.log(req.params[0]);
});

app.get('/create',async (req,res)=>{
  admin.enabled(req,res,pool,'create');
});
app.get('/create/preview', async (req,res)=>{
  res.render('pages/preview',{query:req.query});
})
app.post('/create/submit', async function(req, res){
  cards.post(req,res,pool);
});

//ADMIN ONLY TEST
app.get('/admin', async (req,res)=>{
  admin.load(req,res,pool,'admin');
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