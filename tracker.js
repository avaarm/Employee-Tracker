var inquirer = require("inquirer");
var mysql = require("mysql");
require("dotenv").config();
var ctable = require("console.table");

console.log(" ");
console.log(" |||||||||||||||||||||||||||||||||||||||");
console.log("         |||||||||||||||||||||");
console.log("           EMPLOYEE TRACKER");
console.log("         |||||||||||||||||||||");
console.log(" |||||||||||||||||||||||||||||||||||||||");
console.log(" ");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "trackerDB"
});

connection.connect(function(err) {
  if (err) throw err;
  init();
});

function init() {
  inquirer
    .prompt({
      name: "menu",
      type: "list",
      message: "Welcome to your Employee Tracker. What would you like to do?",
      choices: [
        "View All Employees",
        "Sort All Employees By Department",
        "Sort All Employees By Managers",
        "View Roles",
        "View All Departments",
        "Add Employee",
        "Add Department",
        "Add Role",
        "Update Employee Role",
        "Update Employee Manager",
        "Remove Employee",
        "Exit"
      ]
    })
    .then(function(answer) {
      switch (answer.menu) {
        case "View All Employees":
          allEmployee();
          break;
        case "Sort All Employees By Department":
          sortByDepartment();
          break;
        case "Sort All Employees By Managers":
          sortByManagers();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "View All Departments":
          viewDepartments();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Update Employee Manager":
          udpateEmployeeManager();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "Exit":
          exitMenu();
          break;
      }
    });
}

// CRUD - Create and Read
function allEmployee() {
  connection.query(
    `SELECT employee.id, employee.first_name AS "first name", employee.last_name AS "last name", 
      role.title, role.salary, department.name AS "department", 
      CONCAT(manager.first_name," ",manager.last_name) AS "manager"
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id 
      LEFT JOIN department ON role.department_id = department.id 
      LEFT JOIN employee manager ON manager.id = employee.manager_id;`,
    function(err, res) {
      console.table(res);
      init();
    }
  );
}

// CRUD - Create and Read
function sortByDepartment() {
  connection.query(
    `SELECT department.name AS "department", CONCAT(employee.first_name," ",employee.last_name) 
    AS "Employee", role.title, role.salary, 
    CONCAT(manager.first_name," ",manager.last_name) AS "manager"
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON manager.id = employee.manager_id
        ORDER BY department;`,
    function(err, res) {
      console.table(res);
      init();
    }
  );
}

// CRUD - Create and Read
function sortByManagers() {
  connection.query(
    `SELECT CONCAT(manager.first_name," ",manager.last_name) AS "manager", 
    CONCAT(employee.first_name," ",employee.last_name) AS "Employee", role.title, role.salary, 
    department.name AS "department"
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      LEFT JOIN employee manager ON manager.id = employee.manager_id
      ORDER BY manager;`,
    function(err, res) {
      console.table(res);
      init();
    }
  );
}

// CRUD - Create and Read
function viewRoles() {
  connection.query(
    `SELECT role.id, role.title, role.salary, department.name AS Department
      FROM role
      LEFT JOIN department ON role.department_id = department.id
      ORDER BY department;`,
    function(err, res) {
      console.table(res);
      init();
    }
  );
}

// CRUD - Create and Read
function viewDepartments() {
  connection.query(`SELECT name AS Department_Name FROM department;`, function(
    err,
    res
  ) {
    console.table(res);
    init();
  });
}

function exitMenu() {
  connection.end();
}

// CRUD - Update
function addEmployee() {
  connection.query("Select title, id FROM role", function(errRole, resRole) {
    if (errRole) throw errRole;
    connection.query(
      `SELECT CONCAT(first_name," ",last_name) AS ManagerName, id FROM employee;`,
      function(errManager, resManager) {
        if (errManager) throw errManager;
        inquirer
          .prompt([
            {
              name: "firstName",
              type: "input",
              message: "Enter the employee's first name."
            },
            {
              name: "lastName",
              type: "input",
              message: "Enter the employee's last name."
            },
            {
              name: "employeeRole",
              type: "list",
              message: "Select employee's role wthin the company.",
              choices: resRole.map(role => {
                return {
                  name: role.title,
                  value: role.id
                };
              })
            },
            {
              name: "employeeManager",
              type: "list",
              message: "Please select employee's manager.",
              choices: resManager.map(manager => {
                return {
                  name: manager.ManagerName,
                  value: manager.id
                };
              })
            }
          ])
          .then(function(answer) {
            connection.query(
              "INSERT INTO employee SET ?",
              {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.employeeRole,
                manager_id: answer.employeeManager
              },
              function(err) {
                if (err) throw err;
                init();
              }
            );
          });
      }
    );
  });
}

// CRUD - Update
function addRole() {
  connection.query("Select name, id FROM department", function(
    errDept,
    resDept
  ) {
    if (errDept) throw errDept;
    inquirer
      .prompt([
        {
          name: "addRole",
          type: "input",
          message: "Please enter role title."
        },
        {
          name: "roleSalary",
          type: "input",
          message: "Please enter role salary."
        },
        {
          name: "roleDept",
          type: "list",
          message: "Please select the department.",
          choices: resDept.map(department => {
            return {
              name: department.name,
              value: department.id
            };
          })
        }
      ])
      .then(function(answer) {
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.addRole,
            salary: answer.roleSalary,
            department_id: answer.roleDept
          },
          function(err) {
            if (err) throw err;
            console.log("New role added!");
            init();
          }
        );
      });
  });
}

// CRUD - Update
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "Please enter department name."
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.newDepartment
        },
        function(err) {
          if (err) throw err;
          console.log("New Department added!");
          init();
        }
      );
    });
}

// CRUD - Update
function updateEmployeeRole() {
  connection.query(
    `SELECT CONCAT(first_name," ",last_name) AS nameOfEmployee, id FROM employee;`,
    function(errEmployee, resEmployee) {
      if (errEmployee) throw errEmployee;
      connection.query("Select title, id FROM role", function(
        errRole,
        resRole
      ) {
        if (errRole) throw errRole;
        inquirer
          .prompt([
            {
              name: "nameOfEmployee",
              type: "list",
              message: "Select employee.",
              choices: resEmployee.map(employee => {
                return {
                  name: employee.nameOfEmployee,
                  value: employee.id
                };
              })
            },
            {
              name: "employeeRole",
              type: "list",
              message: "Select employee's new role.",
              choices: resRole.map(role => {
                return {
                  name: role.title,
                  value: role.id
                };
              })
            }
          ])
          .then(function(answer) {
            connection.query(
              "UPDATE employee SET role_id = ? WHERE id = ?",
              [answer.employeeRole, answer.nameOfEmployee],
              function(err) {
                if (err) throw err;
                console.log("Employee role updated!");
                init();
              }
            );
          });
      });
    }
  );
}

// CRUD - Update
function udpateEmployeeManager() {
  connection.query(
    `SELECT CONCAT(first_name," ",last_name) AS nameOfEmployee, id FROM employee;`,
    function(errEmployee, resEmployee) {
      if (errEmployee) throw errEmployee;
      connection.query(
        `SELECT CONCAT(first_name," ",last_name) AS ManagerName, id FROM employee;`,
        function(errManager, resManager) {
          if (errManager) throw errManager;
          inquirer
            .prompt([
              {
                name: "nameOfEmployee",
                type: "list",
                message: "Select employee.",
                choices: resEmployee.map(employee => {
                  return {
                    name: employee.nameOfEmployee,
                    value: employee.id
                  };
                })
              },
              {
                name: "employeeManager",
                type: "list",
                message: "Select employee's new manager.",
                choices: resManager.map(manager => {
                  return {
                    name: manager.ManagerName,
                    value: manager.id
                  };
                })
              }
            ])
            .then(function(answer) {
              connection.query(
                "UPDATE employee SET manager_id = ? WHERE id = ?",
                [answer.employeeManager, answer.nameOfEmployee],
                function(err) {
                  if (err) throw err;
                  console.log("Employee's manager updated");
                  init();
                }
              );
            });
        }
      );
    }
  );
}

// CRUD - Delete
function removeEmployee() {
  connection.query(
    `SELECT CONCAT(first_name," ",last_name) AS nameOfEmployee, id FROM employee;`,
    function(err, res) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "deleteEmployee",
            type: "list",
            message: "Select an employee to remove.",
            choices: res.map(employee => {
              return {
                name: employee.nameOfEmployee,
                value: employee.id
              };
            })
          }
        ])
        .then(function(answer) {
          connection.query(
            "DELETE FROM employee WHERE id = ?",
            [answer.deleteEmployee],
            function(err) {
              if (err) throw err;
              console.log("Employee removed!");
              init();
            }
          );
        });
    }
  );
}




  




