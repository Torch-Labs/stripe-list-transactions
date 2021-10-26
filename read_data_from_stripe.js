const stripe = require("stripe")(process.env.STRIPE_SK);
const fs = require("fs");

async function getTrans() {
  console.log("Writing transactions...");
  const transactions = [];
  for await (const trans of stripe.paymentIntents.list({
    limit: 100,
  })) {
    if (trans.status === "succeeded") {
      transactions.push(trans);
    }
  }
  fs.writeFileSync(
    "./data/transactions.js",
    "exports.transactions = " + JSON.stringify(transactions)
  );
  console.log("Wrote transactions");
}

async function getCheckout() {
  console.log("Writing checkout sessions...");
  const transactions = [];
  for await (const trans of stripe.checkout.sessions.list({
    limit: 100,
  })) {
    if (trans.payment_status === "paid") {
      transactions.push(trans);
    }
  }
  fs.writeFileSync(
    "./data/checkouts.js",
    "exports.checkouts = " + JSON.stringify(transactions)
  );
  console.log("Wrote checkout sessions");
}

async function getInv() {
  console.log("Writing invoices...");
  const transactions = [];
  for await (const trans of stripe.invoices.list({
    limit: 100,
  })) {
    if (trans.status === "paid") {
      transactions.push(trans);
    }
  }
  fs.writeFileSync(
    "./data/invoices.js",
    "exports.invoices = " + JSON.stringify(transactions)
  );
  console.log("Wrote invoices");
}

async function getRefunds() {
  console.log("Writing refunds...");
  const transactions = [];
  for await (const trans of stripe.refunds.list({
    limit: 100,
  })) {
    if (trans.status === "succeeded") {
      transactions.push(trans);
    }
  }
  fs.writeFileSync(
    "./data/refunds.js",
    "exports.refunds = " + JSON.stringify(transactions)
  );
  console.log("Wrote refunds");
}

async function writeAllData() {
  await getInv();
  await getTrans();
  await getCheckout();
  await getRefunds();
}

writeAllData();
// module.exports = {
//   writeAllData,
// };
