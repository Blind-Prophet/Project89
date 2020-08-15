const crypto = require("crypto");
module.exports = {
    get: async (req,res,pool) =>{
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM cards');
            const data = { 'results': (result) ? result.rows : null};

            res.render('pages/data',{crypto:crypto,data:data.results});


            // for(var row in data.results){
            //     var date = new Date(data.results[row].expiration);
            //     if(date<now){
            //         let query = 'DELETE FROM sessions WHERE name = \''+data.results[row].name+ '\'';
            //         await client.query(query);
            //     }else if(data.results[row].name == cookie){
            //         success = true;
            //     }
            // }
  
            // if(success){
            //     res.render('pages/'+landing_page);
            // }else{
            //     res.render('pages/auth',{page:landing_page});
            // }
            client.release();
        } catch (err) {
            // console.error(err);
            // res.send("Error " + err);
            res.render('pages/data',{"crypto":crypto,"data":[{"id":"0","image":"https://scontent-bos3-1.cdninstagram.com/v/t51.2885-15/e35/p240x240/117352951_3322807757776321_9159548093691741348_n.jpg?_nc_ht=scontent-bos3-1.cdninstagram.com&_nc_cat=101&_nc_ohc=kx8b4DQURw0AX-p96uG&oh=d6dadda06cecc5b02aaa0bdd890100de&oe=5F5C4359&ig_cache_key=MjM3MjQ3NDU1NTU3MjA2MzI4Nw%3D%3D.2","name":"One","rarity":"1","description":"1","attributes":["1","2"],"type":"Two"},{"name":"One","rarity":"1","description":"1","attributes":["1","2"],"type":"Two","image":"https://pbs.twimg.com/media/EccFPQfUEAADXVx?format=png&name=small","id":"3"}]});
        }






        
    }
};