import React, { useState, useEffect, useRef, createRef } from "react";
import "../styles/add_expense.css";
import cross from "../assets/cross.svg";
import minus from "../assets/minus.svg";
import { TransitionGroup, CSSTransition } from "react-transition-group";

function AddExpense(props) {
  let [containerClass, setContainerClass] = useState("add-expense-container");
  let [overflowClass, setOverflowClass] = useState("overflow-container");
  let [activeLender, setActiveLender] = useState(props.activeUser);
  let [expenseAmount, setExpenseAmount] = useState("");
  let [tempExpense, setTempExpense] = useState({});
  let [btnDisabled, setBtnDisabled] = useState(true);
  let [titleRef, lenderRef, borrowerRef, amountRef] = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  let [borrowers, setBorrowers] = useState([]);
  let [automaticSplit, setAutomaticSplit] = useState(true);
  let [splitAmount, setSplitAmount] = useState([""]);
  let firstAmount = useRef();

  useEffect(() => {
    setActiveLender(props.activeUser);
  }, [props.activeUser]);

  function calcHeight() {
    if (
      overflowClass.includes("overflow-container-expand") &&
      borrowers.length > 0
    ) {
      let calc = borrowers.length * 2.5 + 11;
      return calc + "em";
    } else if (overflowClass.includes("overflow-container-expand")) {
      return "9.8em";
    } else {
      return "0em";
    }
  }

  function addBorrower() {
    borrowers.push([Math.random(), createRef()]);
    splitAmount.push("");
    setBorrowers([...borrowers]);
    inputValidation();
    if (automaticSplit) calcSplit();
  }

  function addRemainder(remainder) {
    for (let i = 0; i < remainder * 100; i++) {
      let newAmount = Number(splitAmount[i]) + 0.01;
      splitAmount[i] = newAmount.toFixed(2);
    }
  }

  function calcSplit() {
    let amount = amountRef.current.value;
    if (amount > 0) {
      if (automaticSplit) {
        let equalAmount = amount / (borrowers.length + 1);
        if (equalAmount % 1 !== 0) {
          equalAmount = Number(equalAmount).toFixed(3);
          equalAmount = String(equalAmount).slice(0, equalAmount.length - 1);
        }
        splitAmount.fill(equalAmount);
        let leftOver = amount - equalAmount * (borrowers.length + 1);
        if (leftOver > 0) {
          addRemainder(leftOver.toFixed(2));
        }
      } else {
        splitAmount = [amountRef.current.value];
      }
    } else {
      splitAmount.fill("");
    }

    setSplitAmount([...splitAmount]);
    inputValidation();
  }

  function borrowersValidation() {
    for (const borrower of borrowers) {
      if (
        !borrower[1].current ||
        borrower[1].current.value.length < 1 ||
        borrower[1].current.value.includes("--- S")
      ) {
        return false;
      }
    }

    for (const amount of splitAmount) {
      if (amount.length < 1) {
        return false;
      }
    }
    return true;
  }

  function inputValidation() {
    if (
      titleRef.current.value.length > 0 &&
      lenderRef.current.value.length > 0 &&
      !borrowerRef.current.value.includes("--- S") &&
      amountRef.current.value.length > 0 &&
      amountRef.current.value > 0 &&
      borrowersValidation()
    ) {
      let usernames = [
        [borrowerRef.current.value, Number(firstAmount.current.value) * 100],
      ];
      for (const [index, ref] of [...borrowers].entries()) {
        usernames.push([
          ref[1].current.value,
          Number(splitAmount[index + 1]) * 100,
        ]);
      }
      setBtnDisabled(false);
      setTempExpense({
        title: titleRef.current.value,
        author: props.author,
        lender: lenderRef.current.value,
        borrowers: [...usernames],
        amount: expenseAmount * 100,
      });
    } else {
      setBtnDisabled(true);
    }
  }

  function clearInputs() {
    titleRef.current.value = "";
    lenderRef.current.value = "";
    borrowerRef.current.value = "";
    amountRef.current.value = "";
    firstAmount.current.value = "";
    setExpenseAmount("");

    for (const [index, borrower] of borrowers.entries()) {
      borrower[1].current.value = "";
      splitAmount[index] = "";
    }

    splitAmount[splitAmount.length - 1] = "";
    setSplitAmount([...splitAmount]);
    setBtnDisabled(true);
  }

  useEffect(() => {
    if (props.reset) {
      clearInputs();
      props.onReset(false);

      setTimeout(() => {
        setOverflowClass("overflow-container");
        setContainerClass("add-expense-container");
      }, 300);
    }
  });

  function expandContainer() {
    if (overflowClass.includes("expand")) {
      setOverflowClass("overflow-container");
      setContainerClass("add-expense-container");
    } else {
      setContainerClass("add-expense-container add-expense-container-expand");
      setOverflowClass("overflow-container overflow-container-expand");
    }
  }

  function disabledBtnStyles() {
    if (btnDisabled) {
      return {
        backgroundColor: "lightgrey",
        boxShadow: "0 5px 0 grey",
        transform: "none",
        opacity: "20%",
      };
    }
  }

  return (
    <div>
      <div
        style={{
          maxHeight: calcHeight(),
        }}
        className={overflowClass}
      >
        <div className="input-container">
          <header className="add-expense-title">Title</header>
          <input
            maxLength="50"
            onChange={inputValidation}
            ref={titleRef}
            className="title-input"
          ></input>
        </div>
        <div className="input-container">
          <header className="add-expense-amount">Amount</header>
          <input
            placeholder="$"
            onChange={(e) => {
              if (e.target.value === "") {
                expenseAmount = "";
              } else if (e.target.value === "0.0") {
                expenseAmount = e.target.value;
              } else if (!e.target.value.includes("0.00")) {
                expenseAmount = Math.round(e.target.value * 100) / 100;
              }
              automaticSplit ? calcSplit() : inputValidation();
              setExpenseAmount(expenseAmount);
            }}
            value={expenseAmount}
            ref={amountRef}
            className="amount-input"
            type="number"
            min={0}
          ></input>
        </div>
        <div className="input-container">
          <header className="add-expense-lender">Lender</header>
          <select
            onChange={(e) => {
              setActiveLender(e.target.value);
              inputValidation();
            }}
            ref={lenderRef}
            className="user-dropdown"
            value={activeLender}
          >
            {props.groupUsers.map((user) => (
              <option key={user.username}>{user.username}</option>
            ))}
          </select>
        </div>
        <div className="input-container">
          <header className="add-expense-borrower">Borrower</header>
          <div className="borrower-container">
            <select
              onChange={inputValidation}
              ref={borrowerRef}
              className="user-dropdown"
            >
              <option>Select User</option>
              {props.usersMinusActive.users
                .filter((user) => user.username !== lenderRef.current.value)
                .map((user) => (
                  <option key={user.username}>{user.username}</option>
                ))}
            </select>
            <input
              placeholder="$"
              ref={firstAmount}
              value={splitAmount[0] || ""}
              onChange={(e) => {
                splitAmount[0] = e.target.value;
                setSplitAmount([...splitAmount]);
                setAutomaticSplit(false);
                inputValidation();
              }}
              type="number"
              min="0"
              className="borrower-split"
            ></input>
            <div className="add-expense-plus" onClick={addBorrower}>
              <img alt="add-btn" className="borrower-cross" src={cross}></img>
            </div>
          </div>
        </div>
        <TransitionGroup component={null}>
          {borrowers.map((borrower, i) => (
            <CSSTransition
              timeout={500}
              unmountOnExit
              classNames="borrowers"
              key={borrower[0]}
            >
              <div className="input-container">
                <header key={borrower[0] + 1}>Borrower</header>
                <div key={borrower[0]} className="borrower-container">
                  <select
                    onChange={inputValidation}
                    ref={borrower[1]}
                    className="user-dropdown"
                  >
                    <option>Select User</option>
                    {props.usersMinusActive.users
                      .filter(
                        (user) => user.username !== lenderRef.current.value
                      )
                      .map((user) => (
                        <option key={user.username}>{user.username}</option>
                      ))}
                  </select>
                  <input
                    placeholder="$"
                    type="number"
                    min="0"
                    className="borrower-split"
                    value={splitAmount[i + 1] || ""}
                    onChange={(e) => {
                      splitAmount[i + 1] = e.target.value;
                      setSplitAmount([...splitAmount]);
                      setAutomaticSplit(false);
                      inputValidation();
                    }}
                  ></input>
                  <div
                    className="add-expense-plus"
                    onClick={() => {
                      borrowers = borrowers.filter((t) => t !== borrower);
                      setBorrowers(borrowers);
                      splitAmount.splice(i + 1, 1);
                      if (automaticSplit && amountRef.current.value > 0) {
                        calcSplit();
                      }
                    }}
                  >
                    <img
                      alt="minus-button"
                      className="borrower-cross"
                      src={minus}
                    ></img>
                  </div>
                </div>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      <div className={containerClass}>
        <div className="button-container">
          <button onClick={expandContainer} className="ge-button">
            Add Expense
          </button>
          <button
            disabled={btnDisabled}
            className="ge-button"
            style={disabledBtnStyles()}
            onClick={() => {
              props.onClick(tempExpense);
            }}
          >
            Confirm Expense
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddExpense;
