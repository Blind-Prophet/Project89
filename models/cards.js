const { v4: uuidv4 } = require('uuid');
const admin = require('./admin');

function filterAttributes(attrString){
    //If text is empty return empty
    if(attrString == "") return [];

    //Split text by newline
    let attrArray = attrString.split("\n");

    //check each line for 32 character max
    for(let i=0;i<attrArray.length;i++){
        if (attrArray[i].length > 32) {
            attrArray[i] = attrArray[i].substring(0, 31);
        }
    }
    return attrArray;
}

function filterTags(tagString){
    //If text is empty return empty
    if(tagString == "") return [];

    //Split text by comma
    var tagArray = tagString.split(',');

    //check each line for 32 character max
    for(let i=0;i<tagArray.length;i++){
        if (tagArray[i].length > 32) {
            tagArray[i] = tagArray[i].substring(0, 31);
        }
    }

    return tagArray;
}

module.exports = {
    get: async (req,res,pool) =>{
        try {
            const client = await pool.connect();
            let query = 'SELECT * FROM cards';
            let values = [];

            if(req.query.id){
                let id = req.query.id;
                id = id.replace(/[^a-zA-Z0-9-_]+/ig,'');
                query += ' WHERE uuid = $1;';
                values = [id];
            }else{
                query += ';';
            }

            const result = await client.query(query,values);
            const data = { 'results': (result) ? result.rows : null};
            res.render('pages/data',{data:data.results,query:req.query});
            client.release();
        } catch (err) {
             console.error(err);
             res.send("Error " + err);
            //res.render('pages/data',{"data":[{"id":"0","image":"https://scontent-bos3-1.cdninstagram.com/v/t51.2885-15/e35/p240x240/117352951_3322807757776321_9159548093691741348_n.jpg?_nc_ht=scontent-bos3-1.cdninstagram.com&_nc_cat=101&_nc_ohc=kx8b4DQURw0AX-p96uG&oh=d6dadda06cecc5b02aaa0bdd890100de&oe=5F5C4359&ig_cache_key=MjM3MjQ3NDU1NTU3MjA2MzI4Nw%3D%3D.2","name":"One","rarity":"1","description":"1","attributes":["1","2"],"type":"Two"},{"name":"One","rarity":"1","description":"1","attributes":["1","2"],"type":"Two","image":"https://pbs.twimg.com/media/EccFPQfUEAADXVx?format=png&name=small","id":"3"}]});
        }        
    },
    post: async (req,res,pool) => {
        let uuid = ""+uuidv4();
        let query = 'INSERT INTO cards(name,description,attributes,rarity,type,tags,image,category,uuid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);';
        let values = [
            req.body.name,
            req.body.description,
            filterAttributes(req.body.attributes),
            req.body.rarity,
            req.body.type,
            filterTags(req.body.tags),
            req.body.image,
            req.body.category,
            uuid
        ];

        try {
            const client = await pool.connect();
            await client.query(query,values);

            let query2 = 'SELECT * FROM cards WHERE uuid = $1';
            let values2 = [uuid];

            const result = await client.query(query2,values2);
            const data = { 'results': (result) ? result.rows : null};
            res.render('pages/data',{data:data.results,query:req.query});

            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
       } 
    },
    create: async (req,res,pool) => {
        let auth = await admin.check(req,pool);
        if(req.query.id){
            try {
                const client = await pool.connect();
                let query = 'SELECT * FROM cards WHERE uuid = $1;';
                let values = [req.query.id];
                const result = await client.query(query,values);
                const data = { 'results': (result) ? result.rows : null};
                if(data.results && data.results.length > 0)
                {
                    res.render('pages/create',{card:data.results[0],admin:auth});
                }
                else
                {
                    res.render('pages/create',{admin:auth});
                }
                client.release();
            }catch (err){
                console.error(err);
                res.render('pages/create',{admin:auth});
            }
        }
        else
        {
            res.render('pages/create',{admin:auth});
        }
    }
};