const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const logo = require("asciiart-logo");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Be sure to update with your own MySQL password!
  password: "password",
  database: "employee_DB",
});

connection.connect((err) => {
  if (err) throw err;
  init();
});

const init = () => {
  console.log(
    logo({
      name: "EMPLOYEE TRACKER",
      font: "Nancyj-Fancy",
      lineChars: 10,
      padding: 2,
      margin: 3,
      borderColor: "grey",
      logoColor: "red",
      textColor: "red",
    })
      .emptyLine()
      .emptyLine()
      .render()
  );

  runSearch();
};

const runSearch = () => {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View departments:",
        "View roles",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update employee role",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all employees":
          viewAll();
          break;

        case "View departments":
          viewDepartments();
          break;

        case "View roles":
          viewRoles();
          break;

        case "Add a department":
          addDepartment();
          break;

        case "Add a role":
          addRole();
          break;

        case "Add an employee":
          addEmployee();
          break;

        case "Update employee role":
          updateRole();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};

const viewAll = () => {
  const query = `SELECT e.id, e.first_name, e.last_name, role.title, role.salary, department.name department, concat(manager.first_name, ' ', manager.last_name) AS manager_name
  FROM employee e
  JOIN role
  ON e.role_id=role.id
  JOIN department
  ON role.department_id=department.id
  LEFT OUTER JOIN employee manager
  ON e.manager_id = manager.id`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
};

const viewDepartments = () => {
  const query = `SELECT * FROM department`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
};

const viewRoles = () => {
  const query = `SELECT role.title, role.salary, department.name department
  FROM role
  JOIN department
  ON role.department_id=department.id`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
};

const addDepartment = () => {
  const departmentInput = [
    {
      type: "input",
      message: "What Department would you like to add?",
      name: "dept",
    },
  ];
  inquirer.prompt(departmentInput).then((answer) => {
    const query = `INSERT INTO department (name)
    VALUES ("${answer.dept}")`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      runSearch();
    });
  });
};

const addRole = () => {
  const firstQuery = `SELECT department.name department, department.id
  FROM department`;
  connection.query(firstQuery, (err, res) => {
    if (err) throw err;
    const roleInput = [
      {
        type: "input",
        message: "What role title would you like to add?",
        name: "title",
      },
      {
        type: "input",
        message: "What will the salary be?",
        name: "salary",
      },
      {
        name: "dept",
        type: "rawlist",
        choices() {
          const choiceArray = [];
          res.forEach(({ department }) => {
            choiceArray.push(department);
          });
          return choiceArray;
        },
        message: "What department would you like to add this role too",
      },
    ];
    inquirer.prompt(roleInput).then((answer) => {
      let chosenDept;
      res.forEach((depts) => {
        if (depts.department === answer.dept) {
          chosenDept = depts;
        }
      });
      const query = `INSERT INTO role (title, salary, department_id)
      VALUES ("${answer.title}", "${answer.salary}", "${chosenDept.id}")`;
      connection.query(query, (err, res) => {
        if (err) throw err;
        runSearch();
      });
    });
  });
};

const addEmployee = () => {
  const firstQuery = `SELECT title, id FROM role`;
  connection.query(firstQuery, (err, res) => {
    if (err) throw err;
    let roleList = res;
    const secondQuery = `SELECT e.id, concat(e.first_name, ' ', e.last_name) AS employee_name, e.manager_id, role.title role, role.salary, department.name, concat(manager.first_name, ' ', manager.last_name) AS manager_name
    FROM employee e
    JOIN role
    ON e.role_id=role.id
    JOIN department
    ON role.department_id=department.id
    LEFT OUTER JOIN employee manager
    ON e.manager_id = manager.id`;
    connection.query(secondQuery, (err, res) => {
      if (err) throw err;
      const employeeInput = [
        {
          type: "input",
          message: "What is the new employee's first name?",
          name: "first",
        },
        {
          type: "input",
          message: "What is the new employee's last name?",
          name: "last",
        },
        {
          name: "role",
          type: "rawlist",
          choices() {
            var choiceArray = [];
            for (var i = 0; i < roleList.length; i++) {
              choiceArray.push(roleList[i].title);
            }
            return choiceArray;
          },
          message: "What role with this new employee have?",
        },

        {
          name: "manager",
          type: "rawlist",
          choices() {
            const choiceArray = ["None"];
            res.forEach(({ employee_name }) => {
              choiceArray.push(employee_name);
            });
            return choiceArray;
          },
          message: "Who will manage this employee?",
        },
      ];
      inquirer.prompt(employeeInput).then((answer) => {
        let chosenRole;
        res.forEach((roles) => {
          if (roles.role === answer.role) {
            chosenRole = roles;
          }
        });
        let chosenManager;
        res.forEach((managers) => {
          if (managers.employee_name === answer.manager) {
            chosenManager = managers;
          } else {
            return false;
          }
        });
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.first,
            last_name: answer.last,
            role_id: chosenRole.id,
            manager_id: chosenManager.id || `NULL`,
          },
          (err, res) => {
            if (err) throw err;
            runSearch();
          }
        );
      });
    });
  });
};

const updateRole = () => {
  const firstQuery = `SELECT title, id FROM role`;
  connection.query(firstQuery, (err, res) => {
    if (err) throw err;
    let roleList = res;
    const secondQuery = `SELECT employee.id, concat(employee.first_name, ' ', employee.last_name) AS employee_name, role.title role
      FROM employee
      JOIN role
      ON employee.role_id=role.id`;
    connection.query(secondQuery, (err, res) => {
      if (err) throw err;
      const employeeInput = [
        {
          name: "employee",
          type: "rawlist",
          choices() {
            const choiceArray = [];
            res.forEach(({ employee_name }) => {
              choiceArray.push(employee_name);
            });
            return choiceArray;
          },
          message: "Which employee's role would you like to update?",
        },
        {
          name: "role",
          type: "rawlist",
          choices() {
            var choiceArray = [];
            for (var i = 0; i < roleList.length; i++) {
              choiceArray.push(roleList[i].title);
            }
            return choiceArray;
          },
          message: "What role with this new employee have?",
        },
      ];
      inquirer.prompt(employeeInput).then((answer) => {
        let chosenRole;
        res.forEach((roles) => {
          if (roles.role === answer.role) {
            chosenRole = roles;
          }
        });
        let chosenEmployee;
        res.forEach((employees) => {
          if (employees.employee_name === answer.employee) {
            chosenEmployee = employees;
          }
        });
        const query = `UPDATE employee SET role.id = ${chosenRole.id} WHERE id = ${chosenEmployee.id}`;
        connection.query(query, (err, res) => {
          if (err) throw err;
          runSearch();
        });
      });
    });
  });
};
