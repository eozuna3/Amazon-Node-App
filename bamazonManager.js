var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

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
});

//  Function which uses inquirer prompts to ask the manager user to make a selection for what they wish to do with amazon product database
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
          addNewProduct();
          break;
      }
    });
  //connection.end();
}

//  Function displays to the CLI a table of the contents in the bamazon database
function listProducts() {
  var table = new Table({
    head: ["Item Id", "Product Name", "Price", "Stock Quantity"]
    , colWidths: [10, 40, 12, 20]
  });
  var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function (err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      table.push([results[i].item_id, results[i].product_name, results[i].price, results[i].stock_quantity]);
    }
    console.log(table.toString());
    console.log("-------------------------------------------------------------\n");
    startAgain();
  });
}

//  Function that displays to the CLI a list of items in the database that have a stock quantity of less than 5
function lowInventory() {
  var table = new Table({
    head: ["Item Id", "Product Name", "Price", "Stock Quantity"]
    , colWidths: [10, 40, 12, 20]
  });
  var query = "select item_id, product_name, price, stock_quantity from products where stock_quantity < 5";
  connection.query(query, function (err, results) {
    if (err) throw err;
    if (results.length > 0) {
      console.log("\nHere is a current list of product items with stock quantities less than 5.\n");
      for (var i = 0; i < results.length; i++) {
        table.push([results[i].item_id, results[i].product_name, results[i].price, results[i].stock_quantity]);
      }
      console.log(table.toString());
      console.log("-------------------------------------------------\n");
      startAgain();
    } else {
      console.log("\nThere are currently no stock items with low quantities.\n");
      console.log("-------------------------------------------------\n");
      startAgain();
    }
  });
}

//  Function that allow the manager to add stock to any item in the bamazon database
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
              console.log("\nAdditional stock was successfully added!\n");
              console.log("-------------------------------------------------\n");
              startAgain();
            });
        } else {
          console.log("\nThe item id you enter was not found in the database.  Please try again.\n");
          console.log("-------------------------------------------------\n");
          startAgain();
        }
      });
    });
}

//  Function that allows the manager user to add a completely new product to the list of items in the bamazon database
function addNewProduct() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please type in the name of the new item you would like to add.",
        name: "productName"
      },
      {
        type: "input",
        message: "What is the name of the department this item can be found in?",
        name: "departmentName"
      },
      {
        type: "input",
        message: "What is the price of each item?",
        name: "setPrice",
        validate: function validateUserInput(setPrice) {
          var decimal = /^[-+]?[0-9]+\.[0-9]+$/;
          if (setPrice !== "" && setPrice.match(decimal) !== null) {
            return true;
          }
        }
      },
      {
        type: "input",
        message: "How much stock quantity will this item have?",
        name: "quantity",
        validate: function validateUserInput(quantity) {
          var integers = /^[0-9]+$/;
          if (quantity !== "" && quantity.match(integers) !== null) {
            return true;
          }
        }
      }
    ]).then(function (inquirerResponse) {
      var quantity = parseInt(inquirerResponse.quantity);
      var setPrice = parseFloat(inquirerResponse.setPrice).toFixed(2);
      connection.query("INSERT INTO products SET ?",
        {
          product_name: inquirerResponse.productName,
          department_name: inquirerResponse.departmentName,
          price: parseFloat(setPrice),
          stock_quantity: quantity
        },
        function (error) {
          if (error) throw error;
          console.log("\nNew Item was successfully added!\n");
          console.log("-------------------------------------------------\n");
          startAgain();
        }
        );
    });
}

function startAgain(){
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "\nWould you like to go back to the main menu?",
        name: "confirm",
        default: false
      },
    ]).then(function (inquirerResponse) {
      if (inquirerResponse.confirm) {
        start();
      } else {
        connection.end();
      }
    });
}