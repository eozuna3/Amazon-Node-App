DROP DATABASE IF EXISTS bamazon;
-- Creates the "bamazon" database --
CREATE DATABASE bamazon;
-- Creates the table "products" bamazon --
USE bamazon;
-- uses bamazon database to create tables

CREATE TABLE products (
item_id int auto_increment  not null,
product_name varchar (100) null,
department_name varchar (100) null,
price decimal (10, 2) null,
stock_quantity int (10) null,
primary key (item_id)
);

describe products;
select * from products;

ALTER TABLE products AUTO_INCREMENT=1000;