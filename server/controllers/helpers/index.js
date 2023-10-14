const Heap = require("heap");
const debtModel = require("../../models/debt");
const userDebtModel = require("../../models/user_debt");
const optimisedDebtModel = require("../../models/optimised_debt");

exports.processNewDebt = async function (from, to, amount) {
  await userDebtModel.findOneAndUpdate(
    { username: from },
    { $inc: { netDebt: amount } },
  );
  await userDebtModel.findOneAndUpdate(
    { username: to },
    { $inc: { netDebt: -amount } },
  );
  const reverseDebt = await debtModel.findOne({
    from: to,
    to: from,
  });
  let debtAmount = amount;
  if (reverseDebt && reverseDebt.amount > amount) {
    await debtModel.findOneAndUpdate(
      {
        from: to,
        to: from,
      },
      {
        $inc: { amount: -amount },
      },
    );
    debtAmount = 0;
  } else if (reverseDebt && reverseDebt.amount <= amount) {
    debtAmount -= reverseDebt.amount;
    await debtModel.findOneAndDelete({
      from: to,
      to: from,
    });
  }
  if (debtAmount === 0) {
    return `The new debt was used to cancel out a reverse debt, so a new debt\
    from '${from}' to '${to}' was not added.`;
  } else {
    const debtExists = await debtModel.exists({
      from: from,
      to: to,
    });

    if (debtExists) {
      await debtModel.findOneAndUpdate(
        {
          from: from,
          to: to,
        },
        {
          $inc: { amount: debtAmount },
        },
      );
      return `Debt from '${from}' to '${to}' was updated successfully.`;
    } else {
      await debtModel.create({
        from: from,
        to: to,
        amount: debtAmount,
      });
      return `Debt from '${from}' to '${to}' was created successfully.`;
    }
  }
};

exports.simplifyDebts = async function () {
  let minHeapDebt = new Heap(function (a, b) {
    return a.amount - b.amount;
  });
  let minHeapCredit = new Heap(function (a, b) {
    return a.amount - b.amount;
  });

  for await (const userDebt of userDebtModel.find({})) {
    if (userDebt.netDebt > 0) {
      minHeapDebt.push({
        username: userDebt.username,
        amount: userDebt.netDebt,
      });
    } else if (userDebt.netDebt < 0) {
      minHeapCredit.push({
        username: userDebt.username,
        amount: -userDebt.netDebt,
      });
    }
  }

  optimisedDebtModel.deleteMany({});
  while (!minHeapDebt.empty() && !minHeapCredit.empty()) {
    const smallestDebt = minHeapDebt.pop();
    const smallestCredit = minHeapCredit.pop();
    transactionAmount = Math.min(smallestDebt.amount, smallestCredit.amount);
    optimisedDebtModel.create({
      from: smallestDebt.username,
      to: smallestCredit.username,
      amount: transactionAmount,
    });

    if (transactionAmount < smallestDebt.amount) {
      minHeapDebt.push({
        username: smallestDebt.username,
        amount: smallestDebt.amount - transactionAmount,
      });
    }
    if (transactionAmount < smallestCredit.amount) {
      minHeapCredit.push({
        username: smallestCredit.username,
        amount: smallestCredit.amount - transactionAmount,
      });
    }
  }
};
