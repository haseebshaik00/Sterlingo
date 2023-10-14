const helpers = require("./helpers/index");
const expenseModel = require("../models/expense");

exports.addExpense = async (request, response) => {
  let currentSum = 0;
  for (borrower of request.body.borrowers) {
    if (borrower[1] <= 0) {
      return response.status(400).json({
        error: "The amount owed must be a positive number.",
      });
    } else {
      currentSum += borrower[1];
    }
  }
  if (currentSum !== request.body.amount) {
    return response.status(400).json({
      error: "The sum of amounts owed must equal the total expense amount.",
    });
  }

  const expense = await expenseModel.create({
    title: request.body.title,
    author: request.body.author,
    lender: request.body.lender,
    borrowers: request.body.borrowers,
    amount: request.body.amount,
  });

  for (borrowerInfo of request.body.borrowers) {
    const borrower = borrowerInfo[0];
    const owedAmount = borrowerInfo[1];
    await helpers.processNewDebt(borrower, request.body.lender, owedAmount);
  }

  helpers.simplifyDebts();
  response.status(201).json(expense);
};

exports.getExpenses = async (_, response) => {
  const expenses = await expenseModel.find({});
  response.json(expenses);
};

exports.addSettlement = async (request, response) => {
  const settlement = await expenseModel.create({
    title: request.body.title,
    author: request.body.author,
    lender: request.body.lender,
    borrowers: request.body.borrowers,
    amount: request.body.amount,
  });
  response.status(201).json(settlement);
};
