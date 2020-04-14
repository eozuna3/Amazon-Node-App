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
  displayAvailableItems();
});

function displayAvailableItems(){
  var query = "SELECT item_id, product_name, price FROM products ";
  connection.query(query, function(err, results) {
    if (err) throw err;
    console.log("\nHere is a list of available items in the store for purchases\n");
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].item_id + ") Product Name: " + results[i].product_name + ", Price: " + results[i].price);
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
      confirmQuantity(inquirerResponse.productId, inquirerResponse.unitNumbers);
    });
}

function confirmQuantity(id, units){
  var query = "SELECT stock_quantity, price FROM products WHERE ?";
  connection.query(query, {item_id: id}, function(err, results) {
    if (err) throw err;
    if (results.length === 0){
      console.log("\nNo available stock was found for the item number requested\n");
      console.log("-------------------------------------------------\n");
      startAgain();
    } else if (results[0].stock_quantity < units) {
      console.log("Sorry there is not enough product instock to fill your order.  Please try again.")
      console.log("-------------------------------------------------\n");
      startAgain();
    } else {
      updateStock(results[0].stock_quantity, units, id, results[0].price);
    }
  });
}

function updateStock(availableUnits, requestedUnits, id, cost){
  var query = "UPDATE products SET ? WHERE ?";
  connection.query(query, 
    [
      {
        stock_quantity: availableUnits - requestedUnits
      },
      {
        item_id: id
      }
    ],
    function(error) {
      if (error) throw error;
      console.log("Your order was placed successfully!");
      console.log("The total cost of your order is $" + (requestedUnits * cost));
      console.log("-------------------------------------------------\n");
      startAgain();
    }
  );
}

function startAgain(){
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Do you wish to place another order?",
        name: "confirm",
        default: false
      },
    ]).then(function (inquirerResponse) {
      if (inquirerResponse.confirm) {
        displayAvailableItems();
      } else {
        connection.end();
      }
    });
}