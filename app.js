//Requires
const express = require('express');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

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
  let cookie = req.cookies["session"];
  if(cookie == null){
    res.render('pages/auth',{page:'admin'});
  }else{
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM sessions');
      const data = { 'results': (result) ? result.rows : null};
      var success = false;
      for(var row in data.results){
        if(row.name == cookie){
          success = true;
        }
      }
      if(success){
        res.render('pages/admin');
      }else{
        res.render('pages/auth',{page:'admin'});
      }
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
  
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
app.post('/auth', function(req, res){
  if(req.body.password == process.env.AUTH_PW){
    res.cookie('session','test_session', { maxAge: 900000, httpOnly: true });
    let page = 'pages/'+req.body.page;
    res.render(page,{query:req.query});
  }else{
    res.render('pages/home',{query:req.query});
  }
});

app.post('/logout', function(req, res){
  res.clearCookie("session");
  res.render('pages/home',{query:req.query});
});

//Start App on given port
app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});