import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import "../styles/app.css";
import GroupExpenses from "./group_expenses";
import GroupUsers from "./group_users";
import UserSwitching from "./user_switching";
import Todo from "./todo";

function App() {
  const apiUrl = "http://localhost:3001";
  let [group, setGroup] = useState({
    name: "Expenses",
    balance: 0,
    users: [],
    activeUser: "",
    expenses: [],
    debts: [],
    usersMinusActive: {
      users: [],
      debts: [],
      outstandingBalance: 0,
    },
  });

  async function getAllDebt() {
    let response = await fetch(`${apiUrl}/debts`);
    let data = await response.json();
    return data;
  }

  async function updateDebts() {
    let debtResponse = await fetch(`${apiUrl}/debts`);
    const updatedDebt = await debtResponse.json();
    group.debts = updatedDebt;
    setActiveUserDebt();
  }

  function setActiveUserDebt() {
    group.usersMinusActive = {
      ...group.usersMinusActive,
      debts: [],
    };

    let totalDebt = 0;
    for (let i = 0; i < group.debts.length; i++) {
      if (group.debts[i].to === group.activeUser) {
        totalDebt -= group.debts[i].amount;
        group.usersMinusActive.debts[group.debts[i].from] = group.debts[i];
      } else if (group.debts[i].from === group.activeUser) {
        totalDebt += group.debts[i].amount;
        group.usersMinusActive.debts[group.debts[i].to] = group.debts[i];
      }
    }
    group.usersMinusActive.outstandingBalance = totalDebt;
    setGroup({ ...group });
  }

  async function getAllExpenses() {
    const response = await fetch(`${apiUrl}/expenses`);
    const data = await response.json();
    return data;
  }

  async function getAllUsers() {
    const response = await fetch(`${apiUrl}/users`);
    const data = await response.json();
    return data;
  }

  function changeActiveUser(username, selectedUserIndex) {
    filterUsers(selectedUserIndex);
    group.activeUser = username;
    setActiveUserDebt();
  }

  function filterUsers(index) {
    let user = group.users.filter((user) => {
      return user.username === group.activeUser;
    });

    group.usersMinusActive.users.splice(index, 1, user[0]);
  }

  async function loadDataIntoGroup() {
    const debt = await getAllDebt();
    const expenses = await getAllExpenses();
    const users = await getAllUsers();
    group = {
      ...group,
      expenses: expenses.reverse(),
      users: users,
      activeUser: users[0].username,
      debts: debt,
      usersMinusActive: {
        users: users.slice(1),
      },
    };
    setActiveUserDebt();
  }

  useEffect(() => {
    loadDataIntoGroup();
  }, []);

  group["balance"] = calculateTotalBalance();

  function calculateTotalBalance() {
    let totalBalance = 0;
    group.users.forEach((user) => {
      if (user.indebted) {
        totalBalance -= user.balance;
      }
    });
    return totalBalance;
  }

  async function updateGroup(user) {
    await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    setGroup({
      ...group,
      users: [...group.users, user],
      usersMinusActive: {
        ...group.usersMinusActive,
        users: [...group.usersMinusActive.users, user],
      },
    });
  }

  async function updateDebt(settleObject) {
    group.usersMinusActive.debts[settleObject.from].amount -= settleObject.amount;
    group.usersMinusActive.outstandingBalance -= settleObject.amount;
    let settlement = {
      title: "SETTLEMENT",
      lender: settleObject.to,
      amount: settleObject.amount,
      author: settleObject.to,
      borrowers: [settleObject.from, settleObject.amount],
    };

    let validExpense = await fetch(
      "http://localhost:3000/expenses/settlement",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settlement),
      }
    );

    let response = await validExpense.json();

    if (validExpense.ok) {
      group.expenses.unshift(response);
    } else {
      console.error(response.error);
    }

    setGroup({
      ...group,
    });
  }

  async function updateOptimisedDebts(isOptimised) {
    let endpoint = "debts";
    if (isOptimised) {
      endpoint = "optimisedDebts";
    }

    let response = await fetch(`${apiUrl}/${endpoint}`);
    const debt = await response.json();
    group.debts = debt;
    setActiveUserDebt();
    setGroup({ ...group });
  }

  return (
    <div className="App">
      <div className="header-container">
        <h1 className="title"><i>Sterlingo</i></h1>
        <UserSwitching group={group} onClick={changeActiveUser}></UserSwitching>
      </div>
      <div className="main-content-container">
        <GroupExpenses group={group} onClick={updateDebts}></GroupExpenses>
        <GroupUsers
          group={group}
          onClick={(param) => {
            if (param.firstName) {
              updateGroup(param);
            } else if (param === true || param === false) {
              updateOptimisedDebts(param);
            } else {
              updateDebt(param);
            }
          }}
        ></GroupUsers>
        {/* <Todo></Todo> */}
      </div>
    </div>
  );
}

export default App;
