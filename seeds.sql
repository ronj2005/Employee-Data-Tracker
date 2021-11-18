DROP DATABASE IF EXISTS employee_DB;
CREATE DATABASE employee_DB;
USE employee_DB;

CREATE TABLE employee (

id INT NOT NULL AUTO_INCREMENT,
first_name varchar(30) NOT NULL,
last_name varchar(30) NOT NULL,
role_id INT NOT NULL,
manager_id int,
is_manager bool,

PRIMARY KEY (id)
);


CREATE TABLE department (

id INT NOT NULL AUTO_INCREMENT,
name varchar(30) NOT NULL,
PRIMARY KEY (id)

);

CREATE TABLE role (

id INT NOT NULL AUTO_INCREMENT,
title varchar(30) NOT NULL,
salary decimal,
department_id int,
PRIMARY KEY (id)

);

INSERT INTO department (name)

VALUES
("Sales"),
("Engineering"),
("Finance"),
("Legal");

INSERT INTO role ( title, salary,department_id)

VALUES
("CEO",400000.00,2),
("Director of Engineering",115000.00,2),
("Engineer",95000.00,2),
("Sales Manager",65000.00,1),
("Clerk",35000.00,1),
("Senior Accountant",90000.00,4),
("Junior Accountant",55000.00,4),
("Lawyer",135000.00,3),


INSERT INTO employee (first_name,last_name,role_id,manager_id,is_manager)

VALUES('Diego','Chung',1,null,TRUE),
('Katie','Jackson',2,1,TRUE),
('Margrett','Martinez',2,2,FALSE),
('Peter','Shareef',3,2,FALSE),
('Patrick','Namura',3,2,FALSE),
('Xing','Jenkins',4,1,TRUE),
('Bobby','Patel',4,7,FALSE),
('Amir','Goldstein',4,7,FALSE),
('Jaquez','Kingsly',5,7,FALSE),
('Raquita','Yagorschi',5,7,FALSE),
('Mavrick','Indujacca',6,7,FALSE),
('Miles','King',6,1,FALSE),
('Olajide','Feng',7,13,FALSE),
('Betty','Gunpow',7,13,FALSE),
('Michael','Diaz',8,1,TRUE),
('Lee','Ostredj',9,16,FALSE),
('Terrance','Florrez',10,16,FALSE);