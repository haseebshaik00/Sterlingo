import React, { useState, createRef } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import "../styles/group_expenses.css";
import Expense from "./expense";
import AddExpense from "./add_expense";

function GroupExpenses(props) {
  let expenses = props.group.expenses;
  let containerRef = createRef();
  let [clearForm, setClearForm] = useState(false);
  async function addExpense(expense) {
    let validExpense = await fetch("http://localhost:3000/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });

    let response = await validExpense.json();

    if (validExpense.ok) {
      props.onClick();
      expenses.unshift(response);
    } else {
      console.error(response.error);
    }
    setClearForm(true);
  }

  return (
    <div className="group-expenses-container">
      <h1 className="group-name">{props.group.name}</h1>
      <h2 className="balance">
        {props.group.usersMinusActive.outstandingBalance > 0
          ? "You owe: "
          : "You are owed: "}
        <span
          style={{
            backgroundColor:
              props.group.usersMinusActive.outstandingBalance === 0
                ? "lightgrey"
                : "",
          }}
          className={
            props.group.usersMinusActive.outstandingBalance > 0
              ? "balance-value user-balance-red"
              : "balance-value user-balance-green"
          }
        >
          {props.group.usersMinusActive.outstandingBalance < 0
            ? "$" +
              String(
                (props.group.usersMinusActive.outstandingBalance / 100).toFixed(
                  2
                )
              ).substring(1)
            : "$" +
              (props.group.usersMinusActive.outstandingBalance / 100).toFixed(
                2
              )}
        </span>
      </h2>
      <div className="expense-container" ref={containerRef}>
        <AddExpense
          onClick={(expense) => {
            addExpense(expense);
          }}
          reset={clearForm}
          author={props.group.activeUser}
          onReset={(reset) => {
            setClearForm(reset);
          }}
          groupUsers={props.group.users}
          activeUser={props.group.activeUser}
          usersMinusActive={props.group.usersMinusActive}
        ></AddExpense>
        <TransitionGroup component={null}>
          {expenses.map((expense) => (
            <CSSTransition
              exit={false}
              timeout={50}
              classNames="summaries"
              key={expense.creationDatetime}
            >
              <Expense value={expense} key={expense.creationDatetime}></Expense>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </div>
  );
}

export default GroupExpenses;
