const { v4: uuidv4 } = require('uuid');

async function checkAuthentication(cookie, pool){
    if(cookie==null) return false;
    else{
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM sessions;');
            const data = { 'results': (result) ? result.rows : null};
            var success = false;
            var now = new Date();
            for(var row in data.results){
                var date = new Date(data.results[row].expiration);
                if(date<now){
                    let query = 'DELETE FROM sessions WHERE name = $1;';
                    let values = [data.results[row].name];
                    await client.query(query,values);
                }else if(data.results[row].name == cookie){
                    success = true;
                }
            }
            client.release();
        } catch (err) {
            console.error(err);
            return false;
        }
        return success;
    }
}

module.exports = {
    check: async (req,pool) =>{
        let cookie = req.cookies["session"];
        return await checkAuthentication(cookie, pool);
    },
    load: async (req,res,pool,landing_page) =>{
        let cookie = req.cookies["session"];
        if(await checkAuthentication(cookie, pool))
        {
            res.render('pages/'+landing_page,{query:req.query});
        }
        else
        {
            res.render('pages/auth',{page:landing_page,query:req.query});
        }
    },

    login: async (req,res,pool,authentication) => {
        if(req.body.password == authentication){
            let session_name = ""+uuidv4();
            var session_exp = new Date();
            session_exp.setDate(session_exp.getDate() + 1);
            let query = 'INSERT INTO sessions(name,expiration) VALUES ($1,$2);';
            let values = [session_name,session_exp.toISOString()];
        
            try {
              const client = await pool.connect();
              await client.query(query,values);
              client.release();
            } catch (err) {
              console.error(err);
            }
        
        
            res.cookie('session',session_name, { maxAge: 43200000, httpOnly: true, sameSite: "strict", secure: true });
            let page = 'pages/'+req.body.page;
            res.render(page,{query:req.query});
          }else{
            res.render('pages/auth',{query:req.query,page:req.body.page});
          }
    },

    logout: async (req,res,pool) => {
        let cookie = req.cookies["session"];
        cookie = cookie.replace(/[^a-zA-Z0-9-_]+/ig,'');
        if(cookie != null){
            let query = 'DELETE FROM sessions WHERE name = $1;';
            let values = [cookie];

            try {
                const client = await pool.connect();
                await client.query(query,values);
                client.release();
            } catch (err) {
                console.error(err);
            }
        }

        res.clearCookie("session");
        res.render('pages/home',{query:req.query});
    },

    enabled: async(req,res,pool,landing_page) => { 
        let cookie = req.cookies["session"];
        if(await checkAuthentication(cookie, pool))
        {
            res.render('pages/'+landing_page,{admin:true,query:req.query});
        }
        else
        {
            res.render('pages/'+landing_page,{admin:false,query:req.query});
        }
    }
  };