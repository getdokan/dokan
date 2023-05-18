"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysqlconnector_1 = require("mysqlconnector");
// const connection = new MySqlConnection({
//     hostname: "localhost",
//     username: "root",
//     password: "01dokan01",
//     db: "dokan5",
//     port: 3306,
// });
var connection = new mysqlconnector_1.MySqlConnection({
    hostname: "localhost",
    username: "root",
    password: "password",
    db: "tests-wordpress",
    port: 52762,
});
// const dbContext = new DbContext(mySql);
// const query = Select.Table("dok_usermeta");
// console.log(query.toString());
connection.connectAsync().then(function () {
    connection.queryAsync('SELECT * FROM wp_usermeta').then(function (results) {
        results.forEach(function (user) { console.log(user); });
        connection.closeAsync().then(function () { console.log('connection closed'); });
    });
});
