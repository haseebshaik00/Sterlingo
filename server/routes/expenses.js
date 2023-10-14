const express = require("express");
const expenseController = require("../controllers/expense_controller");
const app = express();

app.get("/expenses", expenseController.getExpenses);
app.post("/expenses", expenseController.addExpense);
app.post("/expenses/settlement", expenseController.addSettlement);

module.exports = app;
