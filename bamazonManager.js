var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("The connection id is " + connection.threadId);
  start();
  //connection.end();
});

function start(){
  inquirer
    .prompt([
      {
        type: "rawlist",
        message: "What do you wish to do?",
        name: "optionsList",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
      }
    ]).then(function(inquirerResponse){
      console.log(inquirerResponse.optionsList);
      switch (selection){
        case "View Products for Sale":
          listProducts();
          break;

        
      }
    });
  connection.end();
}