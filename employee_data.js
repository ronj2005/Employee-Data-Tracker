const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "password",
  database: "employee_DB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Successfully connected!");
});

//  Init program
function startTracker(){
  inquirer
    .prompt({
      name: "choice",
      message: "What would you like to do?",
      type: "list",
      choices: [
        "View All Employees",
        "View All Employees By Department",
        "View All Employees By Manager",
        "Add Employee",
        "Remove Employee",
        "Update Employee's Role",
        "Update Employee's Manager",
        "View the total utilized budget by department",
        "EXIT",
      ],
    })
    .then((result) => {
      if (result.choice === "View All Employees") {
        viewAllEmployees();
      } else if (result.choice === "View All Employees By Department") {
        viewByDepartment();
      } else if (result.choice === "View All Employees By Manager") {
        viewByManager();
      } else if (result.choice === "Add Employee") {
        addEmployee();
      } else if (result.choice === "Update Employee's Role") {
        updateEmployeeRole();
      } else if (result.choice === "Update Employee's Manager") {
        updateEmployeeManager();
      } else if (result.choice === "Remove Employee") {
        removeEmployee();
      } else if (
        result.choice === "View the total utilized budget by department"
      ) {
        viewBudgetByDepartment();
      } else {
        connection.end();
      }
    })
    .catch((err) => {
      connection.end();
    });
  }
startTracker();

// view all employee function
function viewAllEmployees() {
  connection.query(
    "SELECT * FROM employee",

    function (err, res) {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}
// view all employee by Department function
function viewByDepartment() {
  inquirer
    .prompt({
      name: "choice",
      message: "Which department you want to see?",
      type: "list",
      choices: ["Sales", "Engineering", "Finance", "Legal"],
    })
    .then((result) => {
      const department = result.choice;
      connection.query(
        "SELECT * FROM employee WHERE department=?",
        [department],

        function (err, res) {
          if (err) throw err;
          console.table(res);
          start();
        }
      );
    });
}
// view all employee by Manager function
function viewByManager() {
  inquirer
    .prompt({
      name: "choice",
      message: "Select one manager",
      type: "list",
      choices: ["Diego Chung", "Katie Jackson", "Margrett Martinez"],
    })
    .then((result) => {
      const manager = result.choice;
      connection.query(
        "SELECT * FROM employee WHERE manager=?",
        [manager],

        function (err, res) {
          if (err) throw err;
          console.table(res);
          start();
        }
      );
    });
}

// add employee function
function addEmployee() {
  inquirer
    .prompt([
      {
        name: "first_name",
        message: "What is the employee's first name",
        type: "input",
      },
      {
        name: "last_name",
        message: "What is the employee's last name",
        type: "input",
      },
      {
        name: "title",
        message: "What is the employee's role",
        type: "input",
      },
      {
        name: "department",
        message: "What is the employee's department?",
        type: "list",
        choices: ["Sales", "Engineering", "Finance", "Legal"],
      },
      {
        name: "salary",
        message: "What is the employee's slaray",
        type: "input",
      },
      {
        name: "manager",
        message: "Who is the employee's manager",
        type: "list",
        choices: ["None", "John Doe", "Ashley Rodriquez", "Sarah Lourd"],
      },
    ])
    .then((result) => {
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: result.first_name,
          last_name: result.last_name,
          title: result.title,
          department: result.department,
          salary: result.salary,
          manager: result.manager,
        },
        function (err, results) {
          if (err) throw err;
          console.log("You added an employee");
          start();
        }
      );
    });
}
// remove employee function
function removeEmployee() {
  connection.query("SELECT * FROM employee", function (err, rows) {
    inquirer
      .prompt({
        name: "id",
        message: "Which employee would you like to remove?",
        type: "list",
        choices: function () {
          let choices = [];
          for (let i = 0; i < rows.length; i++) {
            let choice = {
              name: `${rows[i].first_name} ${rows[i].last_name}`,
              value: rows[i].id,
            };
            choices.push(choice);
          }

          return choices;
        },
      })
      .then((result) => {
        const id = result.id;
        connection.query(
          "DELETE FROM employee WHERE id=?",
          [id],
          function (err, result) {
            if (err) throw err;
            console.log("You've removed employee");
            start();
          }
        );
      });
  });
}

// update employee role function
function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", function (err, rows) {
    inquirer
      .prompt([
        {
          name: "id",
          message: "Select employee",
          type: "list",
          choices: function () {
            let choices = [];
            for (let i = 0; i < rows.length; i++) {
              let choice = {
                name: `${rows[i].first_name} ${rows[i].last_name}`,
                value: rows[i].id,
              };
              choices.push(choice);
            }

            return choices;
          },
        },
        {
          name: "title",
          message: "Please input new title",
          type: "input",
        },
      ])
      .then((result) => {
        const newId = result.id;
        const newRole = result.title;
        connection.query(
          "UPDATE employee SET title=? WHERE id=?",
          [newRole, newId],
          function (err, result) {
            if (err) throw err;
            console.log("Title is updated");
            start();
          }
        );
      });
  });
}
// update employee manager function
function updateEmployeeManager() {
  connection.query("SELECT * FROM employee", function (err, rows) {
    inquirer
      .prompt([
        {
          name: "id",
          message: "Select employee",
          type: "list",
          choices: function () {
            let choices = [];
            for (let i = 0; i < rows.length; i++) {
              let choice = {
                name: `${rows[i].first_name} ${rows[i].last_name}`,
                value: rows[i].id,
              };
              choices.push(choice);
            }

            return choices;
          },
        },
        {
          name: "manager",
          message: "Who will be new mananger?",
          type: "list",
          choices: ["Diego Chung", "Katie Jackson", "Margrett Martinez", "N/A"],
        },
      ])
      .then((result) => {
        const newId = result.id;
        const newManager = result.manager;
        connection.query(
          "UPDATE employee SET manager=? WHERE id=?",
          [newManager, newId],
          function (err, result) {
            if (err) throw err;
            console.log("Title is updated");
            start();
          }
        );
      });
  });
}

function viewBudgetByDepartment() {
  connection.query(
    "select department, sum(salary) AS total_salary from employee group by department",

    function (err, res) {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}
