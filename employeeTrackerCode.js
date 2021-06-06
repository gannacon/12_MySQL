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
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all employees":
          viewAll();
          break;

        case "View departments:":
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
          // addEmployee();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};

const viewAll = () => {
  const query = `SELECT e.id, e.first_name, e.last_name, role.title, role.salary, department.name, concat(manager.first_name, ' ', manager.last_name) AS manager_name
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
  const firstQuery = `SELECT role.title, role.salary, department.name department, department.id
  FROM role
  RIGHT JOIN department
  ON role.department_id=department.id`;
  connection.query(firstQuery, (err, res) => {
    if (err) throw err;
    const departmentInput = [
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
    inquirer.prompt(departmentInput).then((answer) => {
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

// const artistSearch = () => {
//   inquirer
//     .prompt({
//       name: "artist",
//       type: "input",
//       message: "What artist would you like to search for?",
//     })
//     .then((answer) => {
//       const query = "SELECT position, song, year FROM top5000 WHERE ?";
//       connection.query(query, { artist: answer.artist }, (err, res) => {
//         res.forEach(({ position, song, year }) => {
//           console.log(
//             `Position: ${position} || Song: ${song} || Year: ${year}`
//           );
//         });
//         runSearch();
//       });
//     });
// };

// const multiSearch = () => {
//   const query =
//     "SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1";
//   connection.query(query, (err, res) => {
//     res.forEach(({ artist }) => console.log(artist));
//     runSearch();
//   });
// };

// const rangeSearch = () => {
//   inquirer
//     .prompt([
//       {
//         name: "start",
//         type: "input",
//         message: "Enter starting position: ",
//         validate(value) {
//           if (isNaN(value) === false) {
//             return true;
//           }
//           return false;
//         },
//       },
//       {
//         name: "end",
//         type: "input",
//         message: "Enter ending position: ",
//         validate(value) {
//           if (isNaN(value) === false) {
//             return true;
//           }
//           return false;
//         },
//       },
//     ])
//     .then((answer) => {
//       const query =
//         "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
//       connection.query(query, [answer.start, answer.end], (err, res) => {
//         res.forEach(({ position, song, artist, year }) => {
//           console.log(
//             `Position: ${position} || Song: ${song} || Artist: ${artist} || Year: ${year}`
//           );
//         });
//         runSearch();
//       });
//     });
// };

// const songSearch = () => {
//   inquirer
//     .prompt({
//       name: "song",
//       type: "input",
//       message: "What song would you like to look for?",
//     })
//     .then((answer) => {
//       console.log(answer.song);
//       connection.query(
//         "SELECT * FROM top5000 WHERE ?",
//         { song: answer.song },
//         (err, res) => {
//           if (res[0]) {
//             console.log(
//               `Position: ${res[0].position} || Song: ${res[0].song} || Artist: ${res[0].artist} || Year: ${res[0].year}`
//             );
//           } else {
//             console.error(`No results for ${answer.song}`);
//           }
//           runSearch();
//         }
//       );
//     });
// };

// const songAndAlbumSearch = () => {
//   inquirer
//     .prompt({
//       name: "artist",
//       type: "input",
//       message: "What artist would you like to search for?",
//     })
//     .then((answer) => {
//       let query =
//         "SELECT top_albums.year, top_albums.album, top_albums.position, top5000.song, top5000.artist ";
//       query +=
//         "FROM top_albums INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ";
//       query +=
//         "= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position";

//       connection.query(query, [answer.artist, answer.artist], (err, res) => {
//         console.log(`${res.length} matches found!`);
//         res.forEach(({ year, position, artist, song, album }, i) => {
//           const num = i + 1;
//           console.log(
//             `${num} Year: ${year} Position: ${position} || Artist: ${artist} || Song: ${song} || Album: ${album}`
//           );
//         });

//         runSearch();
//       });
//     });
// };
