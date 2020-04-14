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
  //displayAvailableItems();
  placeOrder();
  //connection.end();
});

function displayAvailableItems(){
  var query = "SELECT item_id, product_name, price FROM products ";
  connection.query(query, function(err, results) {
    if (err) throw err;
    console.log("\nHere is a list of available items in the store for purchases\n");
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].item_id + ") Product Name: " + results[i].product_name + ", Price: " + results[i].price + ".");
    }
    console.log("-------------------------------------------------\n");
    placeOrder();
  });
}

function placeOrder(){
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter the item number of the product you would like to buy from the store.",
        name: "productId",
        validate: function validateUserInput(productId) {
          var integers = /^[0-9]+$/;
          if (productId !== "" && productId.match(integers) !== null) {
          return true;
          }
        }
      },
      {
        type: "input",
        message: "Please enter the number of units of the product you would like to buy.",
        name: "unitNumbers",
        validate: function validateUserInput(unitNumbers) {
          var integers = /^[0-9]+$/;
          if (unitNumbers !== "" && unitNumbers.match(integers) !== null) {
          return true;
          }
        }
      }
    ]).then(function (inquirerResponse){
      console.log(inquirerResponse.productId);
      console.log(inquirerResponse.unitNumbers);

      confirmQuantity(inquirerResponse.productId, inquirerResponse.unitNumbers);
    });
    //connection.end();
}

function confirmQuantity(id, units){
  var query = "SELECT stock_quantity FROM products WHERE item_id = " + id;
  connection.query(query, function(err, results) {
    if (err) throw err;
    if (results.length === 0){
      console.log("\nNo available stock was found for the item number requested\n");
    } else if (results[0].stock_quantity < units) {
      console.log("Sorry there is not enough product instock to fill your order.  Please try again.")
    } else {
      console.log("Enough stock is available.")
      updateStock();
    }
    console.log("-------------------------------------------------\n");
  });
  connection.end();
}

function updateStock(){
  console.log("updateStock function was called.")
}