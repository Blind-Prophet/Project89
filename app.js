//Requires
const express = require('express');
const { Pool } = require('pg');

//Create Express App
const app = express();

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
  res.send('Hello World!')
});

//App DB Response
app.get('/db', async (req,res)=>{
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.send('pages/db', results );
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
});

//Start App on given port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});