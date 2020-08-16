module.exports = {
    get: async (req,res,pool) =>{
        try {
            const client = await pool.connect();
            let query = 'SELECT * FROM cards';

            if(req.query.id){
                let id = req.query.id;
                id = id.replace(/[^a-zA-Z0-9-_]+/ig,'');
                query += 'WHERE uuid = \''+id+'\'';
            }

            const result = await client.query(query);
            const data = { 'results': (result) ? result.rows : null};
            res.render('pages/data',{data:data.results});
            client.release();
        } catch (err) {
             console.error(err);
             res.send("Error " + err);
            //res.render('pages/data',{"data":[{"id":"0","image":"https://scontent-bos3-1.cdninstagram.com/v/t51.2885-15/e35/p240x240/117352951_3322807757776321_9159548093691741348_n.jpg?_nc_ht=scontent-bos3-1.cdninstagram.com&_nc_cat=101&_nc_ohc=kx8b4DQURw0AX-p96uG&oh=d6dadda06cecc5b02aaa0bdd890100de&oe=5F5C4359&ig_cache_key=MjM3MjQ3NDU1NTU3MjA2MzI4Nw%3D%3D.2","name":"One","rarity":"1","description":"1","attributes":["1","2"],"type":"Two"},{"name":"One","rarity":"1","description":"1","attributes":["1","2"],"type":"Two","image":"https://pbs.twimg.com/media/EccFPQfUEAADXVx?format=png&name=small","id":"3"}]});
        }






        
    }
};