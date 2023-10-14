const debtModel = require("../models/debt");
const optimisedDebtModel = require("../models/optimised_debt");
const userDebtModel = require("../models/user_debt");
const helpers = require("./helpers/index");

exports.getDebts = async (_, response) => {
  const debt = await debtModel.find({});
  response.json(debt);
};

exports.getOptimisedDebts = async (_, response) => {
  const optimisedDebt = await optimisedDebtModel.find({});
  response.json(optimisedDebt);
};

exports.getDebtBetweenUsers = async (request, response) => {
  const debt = await debtModel.findOne({
    from: request.params.from,
    to: request.params.to,
  });
  response.json(debt);
};

exports.addDebt = async (request, response) => {
  let message = await helpers.processNewDebt(
    request.body.from,
    request.body.to,
    request.body.amount,
  );
  response.status(201).send(message);
};

exports.settleDebt = async (request, response) => {
  const existingDebt = await debtModel.findOne({
    from: request.body.to,
    to: request.body.from,
  });

  if (request.body.amount <= 0) {
    response.status(400).send("Amount must be greater than $0.");
  } else if (existingDebt && existingDebt.amount > request.body.amount) {
    await debtModel.findOneAndUpdate(
      {
        from: request.body.to,
        to: request.body.from,
      },
      {
        $inc: { amount: -request.body.amount },
      },
    );
    await userDebtModel.findOneAndUpdate(
      { username: request.body.from },
      { $inc: { netDebt: -request.body.amount } },
    );
    await userDebtModel.findOneAndUpdate(
      { username: request.body.to },
      { $inc: { netDebt: request.body.amount } },
    );
    helpers.simplifyDebts();
    response.send(
      `Debt from '${request.body.from}' to '${request.body.to}' partially\
        settled and reduced successfully.`,
    );
  } else if (existingDebt && existingDebt.amount === request.body.amount) {
    await debtModel.findOneAndDelete({
      from: request.body.to,
      to: request.body.from,
    });
    await userDebtModel.findOneAndUpdate(
      { username: request.body.from },
      { $inc: { netDebt: -request.body.amount } },
    );
    await userDebtModel.findOneAndUpdate(
      { username: request.body.to },
      { $inc: { netDebt: request.body.amount } },
    );
    helpers.simplifyDebts();
    response.send(
      `Debt from '${request.body.from}' to '${request.body.to}' fully\
        settled and deleted successfully.`,
    );
  } else {
    response
      .status(400)
      .send("You cannot settle more than the amount of the debt.");
  }
};

exports.deleteDebtBetweenUsers = async (request, response) => {
  await debtModel.deleteOne({
    from: request.params.from,
    to: request.params.to,
  });
  helpers.simplifyDebts();
  response.send(
    `Debt from '${request.params.from}' to '${request.params.to}' deleted\
      successfully.`,
  );
};
