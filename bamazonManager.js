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
        name: "selection",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
      }
    ]).then(function(inquirerResponse){
      console.log(inquirerResponse.selection);
      switch (inquirerResponse.selection){
        case "View Products for Sale":
          listProducts();
          break;
        case "View Low Inventory":
          lowInventory();
          break;
        case "Add to Inventory":
        
          break;
        case "Add New Product":
          
          break;          
      }
    });
  //connection.end();
}

function listProducts(){
  var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function(err, results) {
    if (err) throw err;
    console.log("\nHere is the current inventory in the store.\n");
    console.table(results);
    console.log("-------------------------------------------------\n");
    connection.end();
  });
}

function lowInventory(){
  var query = "select item_id, product_name, price, stock_quantity from products where stock_quantity < 5";
  connection.query(query, function(err, results) {
    if (err) throw err;
    console.log("\nHere is a current list of current product items with stock quantities less than 5.\n");
    console.table(results);
    console.log("-------------------------------------------------\n");
    connection.end();
  });
}

