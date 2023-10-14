const express = require("express");
const debtController = require("../controllers/debt_controller");
const app = express();

app.get("/debts", debtController.getDebts);
app.get("/optimisedDebts", debtController.getOptimisedDebts);
app.get("/debts/:from/:to", debtController.getDebtBetweenUsers);
app.post("/debts/add", debtController.addDebt);
app.post("/debts/settle", debtController.settleDebt);
app.delete("/debts/:from/:to", debtController.deleteDebtBetweenUsers);

module.exports = app;
