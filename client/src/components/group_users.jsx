import { React, useState, createRef } from "react";
import "../styles/group_users.css";
import User from "./user";
import AddUser from "./add_user";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import example from "../assets/Optimise.svg";

function GroupUsers(props) {
  let [settleAmount, setSettleAmount] = useState("");
  let [btnDisabled, setBtnDisabled] = useState(true);
  let [responseMsg, setResponseMsg] = useState("");
  let [msgClasses, setMsgClasses] = useState("group-members-msg");
  let [togglePosition, setTogglePosition] = useState("0.3em");
  let [toggleColour, setToggleColour] = useState("rgb(255, 79, 79, 0.65)");
  let userSelectRef = createRef();
  const apiUrl = "http://localhost:3001";

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

  async function settleUp() {
    let settleObject = {
      from: userSelectRef.current.value,
      to: props.group.activeUser,
      amount: settleAmount * 100,
    };

    setBtnDisabled(true);
    setSettleAmount("");

    let settleDebtResponse = await fetch(`${apiUrl}/debts/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settleObject),
    });

    setMsgClasses("group-members-msg");
    setResponseMsg(await settleDebtResponse.text());

    setTimeout(() => {
      setMsgClasses(msgClasses + " group-members-msg-fade");
    }, 1500);

    if (settleDebtResponse.status === 200) {
      props.onClick(settleObject);
    }
  }

  function addUserToGroup(user) {
    let firstName = ["Harry","Ross","Bruce","Cook","Carolyn","Morgan","Albert","Walker","Randy","Reed","Larry","Barnes",
    "Lois","Wilson","Jesse","Campbell","Ernest","Rogers","Theresa","Patterson","Henry","Simmons","Michelle","Perry","Frank"];
    let lastName = ["Brooks","Rachel", "Edwards","Christopher", "Perez","Thomas", "Baker","Sara", "Moore","Chris", "Bailey",
    "Roger", "Johnson","Marilyn", "Thompson","Anthony", "Evans","Julie", "Hall","Paula", "Phillips","Annie", "Hernandez","Dorothy", "Murphy",];
    
    const newUser = {
      username: user,
      firstName: firstName[Math.floor(Math.random() * 25)],
      lastName: lastName[Math.floor(Math.random() * 25)],
      indebted: false,
      balance: 0,
    };
    props.onClick(newUser);
  }

  function toggleSmartSplit() {
    if (togglePosition === "0.3em") {
      setTogglePosition("1.7em");
      setToggleColour("rgb(108, 255, 190, 0.65)");
      props.onClick(true);
    } else {
      setTogglePosition("0.3em");
      setToggleColour("rgb(255, 79, 79, 0.65)");
      props.onClick(false);
    }
  }

  return (
    <div className="group-members-container">
      <div className="toggle-container">
        {/* <div className="info-div">
          i
          <div className="info-hover">
            Optimises debts to minimise transactions
            <img
              alt="Smart Split Explanation"
              style={{
                paddingTop: "0.5em",
                width: "25em",
                height: "10em",
              }}
              src={example}
            ></img>
          </div>
        </div> */}
        <div>
          <div className="split-toggle" onClick={toggleSmartSplit}>
            <div
              className="circle-toggle"
              style={{
                marginLeft: togglePosition,
                backgroundColor: toggleColour,
              }}
            ></div>
          </div>
          <p className="toggle-header">Smart Split</p>
        </div>
      </div>
      <h1 className="group-members-title">Group Members</h1>
      <p className={msgClasses}>{responseMsg}</p>
      <div className="users-container">
        <div className="settle-container">
          <div>
            <select ref={userSelectRef} name="users">
              {props.group.usersMinusActive.users.map((user) => (
                <option key={user.username}>{user.username}</option>
              ))}
            </select>
            <input
              onChange={(e) => {
                if (e.target.value === "") {
                  settleAmount = "";
                } else if (e.target.value === "0.0") {
                  settleAmount = e.target.value;
                } else {
                  settleAmount = Math.round(e.target.value * 100) / 100;
                }
                if (btnDisabled && Number(settleAmount) > 0) {
                  setBtnDisabled(false);
                } else if (!btnDisabled && Number(settleAmount) === 0) {
                  setBtnDisabled(true);
                }
                setSettleAmount(settleAmount);
              }}
              value={settleAmount}
              type="Number"
              placeholder="$"
              min={0}
            ></input>
          </div>
          <button
            disabled={btnDisabled}
            style={disabledBtnStyles()}
            onClick={settleUp}
            className="ge-button"
          >
            Settle Up
          </button>
        </div>
        <TransitionGroup component={null}>
          {props.group.usersMinusActive.users.map((user) => (
            <CSSTransition
              exit={false}
              timeout={50}
              classNames="summaries"
              key={user.username}
            >
              <User
                group={props.group.usersMinusActive}
                user={user}
                key={user.username}
              ></User>
            </CSSTransition>
          ))}
          <CSSTransition key={"add-user"} timeout={50}>
            <AddUser
              onClick={(user) => {
                addUserToGroup(user);
              }}
            ></AddUser>
          </CSSTransition>{" "}
        </TransitionGroup>
      </div>
    </div>
  );
}

export default GroupUsers;
