//Requires
const express = require('express');
const { Pool } = require('pg');

//Create Express App
const app = express();

//View Enging: EJS
app.set('view engine', 'ejs')

//Static File Folders
app.use('/static/', express.static('./static/'));

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
  res.render('pages/data');
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

//Start App on given port
app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});