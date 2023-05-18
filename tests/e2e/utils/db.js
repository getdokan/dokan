const mysql = require('like-mysql');
const db = mysql('127.0.0.1:3306', 'root', '01dokan01', 'dokan5');

async function dbQuery (sql, callback) {
await db.ready()
const result = await db.query(sql)

callback(result)

await db.end()
}

let sql = `SELECT * FROM dok_usermeta`

let result =  dbQuery(sql, 
    async (data)=>{
    console.log(data)
})