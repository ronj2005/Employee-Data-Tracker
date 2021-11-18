const mysql = require("mysql");
const inquirer = require("inquirer");
// const { inherits } = require("util");
// const { report } = require("process");

const connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3001
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "",
  database: "employee_DB",
});

connection.connect((error) => {
  if (error) throw error;
  init();
  askUser();
});

function askUser() {
  inquirer
    .prompt([
      {
        type: "checkbox",
        name: "action",
        message: "Where are you headed? \n",
        choices: ["Employees", "Departments", "Roles\n"],
      },
    ])
    .then((response) => {
      if (response.action == "Employees") {
        connection.query(
          `SELECT distinct e.*,CONCAT(m.first_name," ",m.last_name) as Manager  from employeedb.employee e 
                left join employeedb.employee m on e.manager_id = m.id`,
           (error, res) => {
            if (error) throw error;
            console.table(res);
            employees();
          }
        );
      } else if (response.action == "Departments") {
        connection.query("SELECT * FROM department",  (error, res) => {
          if (error) throw error;
          console.table(res);
          departments();
        });
      } else if (response.action == "Roles\n") {
        connection.query(
          `SELECT r.*,d.name as Department from employeedb.role r 
                left JOIN employeedb.department d on r.department_id = d.id`,
           (error, res) => {
            if (error) throw error;
            console.table(res);
            roles();
          }
        );
      } else console.log("somethings wrong");
    });
}

function employees() {
  inquirer
    .prompt([
      {
        type: "checkbox",
        name: "action",
        message: "What do you want to do? \n",
        choices: ["Add Employee", "Update Employee", "Remove Employee\n"],
      },
    ])
    .then((response) => {
      if (response.action == "Add Employee") {
        addEmp();
      } else if (response.action == "Update Employee") {
        updateEmp();
      } else if (response.action == "Remove Employee\n") {
        deleteEmp();
      } else {
        console.log("\x1b[31m", "You must make a choice");
        employees();
      }
    });
}

function addEmp() {
  connection.query("SELECT * FROM role", (error, roles) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "empFirst",
          type: "input",
          message: "What is the employees first name?",
        },
        {
          name: "empLast",
          type: "input",
          message: "What is the employees last name?",
        },
        {
          name: "empRole",
          type: "list",
          choices: roles.map((role) => ({
            name: role.id + " " + role.title,
            value: role.id,
          })),
          message: "What is the employees role?",
        },
      ])
      .then((answer) => {
        connection.query(
          "SELECT * FROM employee where is_manager = 1 ",
           (error, managers) => {
            if (error) throw error;

            inquirer
              .prompt([
                {
                  name: "empManager",
                  type: "list",
                  choices: managers.map((manager) => ({
                    name: manager.first_name + " " + manager.last_name,
                    value: manager.id,
                  })),
                  message: "What is the employees manager?",
                },
              ])
              .then((response) => {
                // console.log(answer.empRole)

                connection.query(
                  "INSERT INTO employee SET ?",
                  {
                    first_name: answer.empFirst,
                    last_name: answer.empLast,
                    role_id: answer.empRole,
                    manager_id: response.empManager,
                  },
                  (error, response) => {
                    if (error) throw error;
                    console.log("Employee succesfully added!!!");
                    toDo("employee");
                  }
                );
              });
          }
        );
      });
  });
}

function updateEmp() {
  connection.query("SELECT * FROM employee", (error, employees) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          choices: employees.map((employee) => ({
            name: employee.first_name + " " + employee.last_name,
            value: employee,
          })),
          message: "Which employee would you like to update?",
        },
      ])
      .then((answer) => {
        console.log(
          "UPDATING: " +
            answer.employee.first_name +
            " " +
            answer.employee.last_name +
            " ID: " +
            answer.employee.id
        );
        connection.query("SELECT * FROM role", (error, roles) =>  {
          if (error) throw error;
          //console.table(response)
          inquirer
            .prompt([
              {
                name: "empRole",
                type: "list",
                choices: roles.map((role) => ({
                  name: role.id + " " + role.title,
                  value: role.id,
                })),
                message: "What is the employees role?",
              },
            ])
            .then((response) => {
              // console.log(response.empRole);
              connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                  {
                    role_id: response.empRole,
                  },
                  {
                    id: answer.employee.id,
                  },
                ],
                 () => {
                  if (error) throw error;
                  // console.log("role recived")
                }
              );
            })
            .then((response) => {
              connection.query(
                "SELECT * FROM employee WHERE is_manager = 1",
                 (error, managers) => {
                  if (error) throw error;
                  inquirer
                    .prompt([
                      {
                        name: "empManager",
                        type: "list",
                        choices: managers.map((manager) => ({
                          name: manager.first_name + " " + manager.last_name,
                          value: manager.id,
                        })),
                        message: "What is the employees manager?",
                      },
                    ])
                    .then((setMan) => {
                      connection.query(
                        "UPDATE employee SET ? WHERE ?",
                        [
                          {
                            manager_id: setMan.empManager,
                          },
                          {
                            id: answer.employee.id,
                          },
                        ],
                         (error, response) => {
                          if (error) throw error;
                          console.log("Employee has been updated!!!");
                          toDo("employee");
                        }
                      );
                    });
                }
              );
            });
        });
      });
  });
}

function deleteEmp() {
  connection.query("SELECT * FROM employee",  (error, employees) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          choices: employees.map((employee) => ({
            name: employee.first_name + " " + employee.last_name,
            value: employee,
          })),
          message: "Which employee would you like to delete?",
        },
        {
          name: "confirm",
          type: "confirm",
          message: "Are you sure you want to do this?",
        },
      ])
      .then((answer) => {
        if (answer.confirm) {
          console.log(
            "\x1b[31m",
            "DELETING: " +
              answer.employee.first_name +
              " " +
              answer.employee.last_name +
              " ID: " +
              answer.employee.id
          );
          connection.query(
            "DELETE FROM employee where ? ",
            { id: answer.employee.id },
            (error) => {
              if (error) throw error;
              console.log(
                "\x1b[31m",
                answer.employee.first_name +
                  " " +
                  answer.employee.last_name +
                  " was deleted"
              );
              toDo("employee");
            }
          );
        } else {
          toDo("employee");
        }
      });
  });
}

function toDo(section) {
  inquirer
    .prompt([
      {
        name: "question",
        type: "list",
        choices: ["Stay Here", "Start Over"],
      },
    ])
    .then((resp) => {
      console.log(resp.question);
      console.log(section);

      if (resp.question === "Stay Here" && section == "employee") {
        employees();
      } else if (resp.question === "Stay Here" && section == "department") {
        departments();
      } else if (resp.question === "Stay Here" && section === "role") {
        roles();
      } else askUser();
    });
}

function init() {
  console.log("\x1b[31m", "STARTING EMPLOYEE MANAGER");
}

function departments() {
  inquirer
    .prompt([
      {
        type: "checkbox",
        name: "action",
        message: "What do you want to do? \n",
        choices: ["Add Department", "Update Department", "Remove Department\n"],
      },
    ])
    .then((response) => {
      if (response.action == "Add Department") {
        addDepartment();
      } else if (response.action == "Update Department") {
        updateDepartment();
      } else if (response.action == "Remove Department\n") {
        deleteDepartment();
      } else {
        console.log("\x1b[31m", "You must make a choice");
        departments();
      }
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "dept",
        type: "input",
        message: "What is the name of the new department?",
      },
    ])
    .then( (answer) =>{
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.dept,
        },
         (error, response) => {
          if (error) throw error;
          console.log("Department succesfully added!!!");
          toDo("department");
        }
      );
    });
}

function updateDepartment() {
  connection.query("SELECT * FROM department", (error, departments) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "department",
          type: "list",
          choices: departments.map((department) => ({
            name: department.name,
            value: department,
          })),
          message: "Which department would you like to update?",
        },
      ])
      .then((answer) => {
        console.log(
          "UPDATING: " + answer.department.name + " ID: " + answer.department.id
        );

        inquirer
          .prompt([
            {
              name: "dept",
              type: "input",
              message: "What is the departments new name?",
            },
          ])
          .then((response) => {
            connection.query(
              "UPDATE department SET ? WHERE ?",
              [
                {
                  name: response.dept,
                },
                {
                  id: answer.department.id,
                },
              ],
               () => {
                if (error) throw error;
                console.log("department recived");
                toDo("department");
              }
            );
          });
      });
  });
}

function deleteDepartment() {
  connection.query("SELECT * FROM department", (error, departments) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "department",
          type: "list",
          choices: departments.map((department) => ({
            name: department.name,
            value: department,
          })),
          message: "Which department would you like to delete?",
        },
        {
          name: "confirm",
          type: "confirm",
          message: "Are you sure you want to do this?",
        },
      ])
      .then( (answer) =>{
        if (answer.confirm) {
          console.log(
            "\x1b[31m",
            "DELETING: " +
              answer.department.name +
              " ID: " +
              answer.department.id
          );
          connection.query(
            "DELETE FROM department where ? ",
            { id: answer.department.id },
            (error) => {
              if (error) throw error;
              console.log(
                "\x1b[31m",
                answer.department.name +
                  " " +
                  answer.department.last_name +
                  " was deleted"
              );
              toDo("department");
            }
          );
        } else {
          toDo("department");
        }
      });
  });
}

function toDo(section) {
  inquirer
    .prompt([
      {
        name: "question",
        type: "list",
        choices: ["Stay Here", "Start Over"],
      },
    ])
    .then((resp) => {
      console.log(resp.question);
      console.log(section);

      if (resp.question === "Stay Here" && section == "employee") {
        employees();
      } else if (resp.question === "Stay Here" && section == "department") {
        departments();
      } else if (resp.question === "Stay Here" && section === "role") {
        roles();
      } else askUser();
    });
}

function roles() {
  inquirer
    .prompt([
      {
        type: "checkbox",
        name: "action",
        message: "What do you want to do? \n",
        choices: ["Add Role", "Update Role", "Remove Role\n"],
      },
    ])
    .then((response) => {
      if (response.action == "Add Role") {
        addRole();
      } else if (response.action == "Update Role") {
        updateRole();
      } else if (response.action == "Remove Role\n") {
        deleteRole();
      } else {
        console.log("\x1b[31m", "You must make a choice");
        roles();
      }
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the name of the new role?",
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of the new role?",
      },
    ])
    .then((answer) => {
      connection.query("SELECT * FROM department", (error, depts) => {
        inquirer
          .prompt([
            {
              name: "dept",
              type: "list",
              choices: depts.map((dept) => ({ name: dept.name, value: dept })),
              message: "Which department does this role belong to??",
            },
          ])
          .then((resp) => {
            connection.query(
              "INSERT INTO role SET ?",
              {
                title: answer.name,
                salary: answer.salary,
                department_id: resp.dept.id,
              },
              (error, response) => {
                if (error) throw error;
                console.log("role succesfully added!!!");
                toDo("role");
              }
            );
          });
      });
    });
}

function updateRole() {
  connection.query("SELECT * FROM role", (error, roles) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          choices: roles.map((role) => ({ name: role.title, value: role })),
          message: "Which role would you like to update?",
        },
      ])
      .then( (answer) => {
        console.log("UPDATING: " + answer.role.title + " ID: " + answer.role.id);

        inquirer
          .prompt([
            {
              name: "name",
              type: "input",
              message: "What is the roles new name?",
            },
            {
              name: "salary",
              type: "input",
              message: "What is the roles new salary?",
            },
          ])
          .then( (answer) => {
            connection.query("SELECT * FROM department", (error, depts) => {
              inquirer
                .prompt([
                  {
                    name: "dept",
                    type: "list",
                    choices: depts.map((dept) => ({
                      name: dept.name,
                      value: dept,
                    })),
                    message: "What is the roles new department?",
                  },
                ])
                .then((resp) => {
                  connection.query(
                    "INSERT INTO role SET ?",
                    {
                      title: answer.name,
                      salary: answer.salary,
                      department_id: resp.dept.id,
                    },
                     (error, response) => {
                      if (error) throw error;
                      console.log("role succesfully added!!!");
                      toDo("role");
                    }
                  );
                });
            });
          });
      });
  });
}

function deleteRole() {
  connection.query("SELECT * FROM role", (error, roles) => {
    if (error) throw error;

    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          choices: roles.map((role) => ({ name: role.title, value: role })),
          message: "Which role would you like to delete?",
        },
        {
          name: "confirm",
          type: "confirm",
          message: "Are you sure you want to do this?",
        },
      ])
      .then( (answer) => {
        if (answer.confirm) {
          console.log(
            "\x1b[31m",
            "DELETING: " + answer.role.title + " ID: " + answer.role.id
          );
          connection.query(
            "DELETE FROM role where ? ",
            { id: answer.role.id },
            (error) => {
              if (error) throw error;
              console.log("\x1b[31m", answer.role.title + " was deleted");
              toDo("role");
            }
          );
        } else {
          toDo("role");
        }
      });
  });
}

function toDo(section) {
  inquirer
    .prompt([
      {
        name: "question",
        type: "list",
        choices: ["Stay Here", "Start Over"],
      },
    ])
    .then( (resp) => {
      console.log(resp.question);
      console.log(section);

      if (resp.question === "Stay Here" && section == "employee") {
        employees();
      } else if (resp.question === "Stay Here" && section == "department") {
        departments();
      } else if (resp.question === "Stay Here" && section === "role") {
        roles();
      } else {
        askUser();
      }
    });
}
