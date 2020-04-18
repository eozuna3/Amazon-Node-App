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

connection.connect(function (err) {
  if (err) throw err;
  console.log("The connection id is " + connection.threadId);
  start();
  //connection.end();
});

function start() {
  inquirer
    .prompt([
      {
        type: "rawlist",
        message: "What do you wish to do?",
        name: "selection",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
      }
    ]).then(function (inquirerResponse) {
      console.log(inquirerResponse.selection);
      switch (inquirerResponse.selection) {
        case "View Products for Sale":
          listProducts();
          break;
        case "View Low Inventory":
          lowInventory();
          break;
        case "Add to Inventory":
          addToInventory();
          break;
        case "Add New Product":

          break;
      }
    });
  //connection.end();
}

function listProducts() {
  var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function (err, results) {
    if (err) throw err;
    console.log("\nHere is the current inventory in the store.\n");
    console.table(results);
    console.log("-------------------------------------------------\n");
    connection.end();
  });
}

function lowInventory() {
  var query = "select item_id, product_name, price, stock_quantity from products where stock_quantity < 5";
  connection.query(query, function (err, results) {
    if (err) throw err;
    if (results.length > 0) {
      console.log("\nHere is a current list of product items with stock quantities less than 5.\n");
      console.table(results);
      console.log("-------------------------------------------------\n");
      connection.end();
    } else {
      console.log("\nThere are currently no stock items with low quantities.\n");
      console.log("-------------------------------------------------\n");
      connection.end();
    }
  });
}

function addToInventory() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Which item would you like to add more stock quantity to?",
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
        message: "How much stock would you like to add to the stock quantity?",
        name: "addProduct",
        validate: function validateUserInput(addProduct) {
          var integers = /^[0-9]+$/;
          if (addProduct !== "" && addProduct.match(integers) !== null) {
            return true;
          }
        }
      }
    ]).then(function (inquirerResponse) {
      //console.log(inquirerResponse.productId);
      var query = "SELECT * FROM products WHERE item_id = " + inquirerResponse.productId;
      //console.log(query);
      connection.query(query, function (err, results) {
        if (err) throw err;
        if (results.length > 0) {
          var query = "UPDATE products SET ? WHERE ?";
          connection.query(query,
            [
              {
                stock_quantity: results[0].stock_quantity + parseInt(inquirerResponse.addProduct)
              },
              {
                item_id: results[0].item_id
              }
            ],
            function (error) {
              if (error) throw err;
              console.log("Additional stock was successfully added!");
            });
          connection.end();
        } else {
          console.log("\nThe item id you enter was not found in the database.  Please try again.\n");
          console.log("-------------------------------------------------\n");
          connection.end();
        }
      });
    });
}