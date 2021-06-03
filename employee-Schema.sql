DROP DATABASE IF EXISTS employee_DB;
CREATE database employee_DB;

USE employee_DB;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NULL,
  salary DECIMAL(10,2) NULL,
  department_id INT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);
CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NULL,
  last_name VARCHAR(30) NULL,
  role_id INT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (manager_id) REFERENCES employee(id)
);

SELECT * FROM department;
SELECT * FROM role;
select * from employee;


INSERT INTO department (name)
VALUES ("Sales"), ("Finance"), ("Engineering");


INSERT INTO role (title, salary, department_id)
VALUES ("Sales Person", "80000", "1"), ("Account Manager", "100000", "2"), ("Engineer", "150000", "3");

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jane", "Doe", "1", "1");

SELECT employee.first_name, employee.last_name, employee.role_id, employee.manager_id, role.title, role.salary, role.department_id, department.name
  FROM employee
  JOIN department
  ON department.id=role.department_id
  JOIN role
  ON employee.role_id=role.id;

SELECT employee_DB.employee.first_name, employee_DB.role.title
FROM employee_DB.employee
FULL OUTER JOIN employee_DB.employee ON role.id=employee.CustomerID


