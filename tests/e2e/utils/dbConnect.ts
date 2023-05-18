   
   import { MySqlConnection, DbContext } from 'mysqlconnector';

    // const connection = new MySqlConnection({
    //     hostname: "localhost",
    //     username: "root",
    //     password: "01dokan01",
    //     db: "dokan5",
    //     port: 3306,
    // });
    
    const connection = new MySqlConnection({
        hostname: "localhost",
        username: "root",
        password: "password",
        db: "tests-wordpress",
        port: 52762,
    });  

    // const dbContext = new DbContext(mySql);


    // const query = Select.Table("dok_usermeta");
    // console.log(query.toString());
    // SELECT * FROM wp_usermeta

    connection.connectAsync().then(() => { 
        
        connection.queryAsync('SELECT * FROM dok_usermeta').then((results) => {
        
            results.forEach(user => { console.log(user); });
            
            connection.closeAsync().then(() => { console.log('connection closed'); })
          });
     });
