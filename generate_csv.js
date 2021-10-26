const { transactions } = require("./data/transactions.js");
const { refunds } = require("./data/refunds.js");

const { invoices } = require("./data/invoices.js");
const { checkouts } = require("./data/checkouts.js");
const fs = require("fs");
// const { writeAllData } = require("./read_data_from_stripe");

const CHECKOUT_MAP = new Map();
const INVOICE_MAP = new Map();

// payment_intent, date, product_id, product_name, customer_email, amount

function verifyData() {
  console.log(transactions.length, invoices.length, checkouts.length);
  const sum = invoices.length + checkouts.length - transactions.length;
  return sum === 0;
  // console.log(checkouts.length);
}

function setMaps() {
  invoices.forEach((inv) => {
    INVOICE_MAP.set(inv.payment_intent, inv);
  });
  checkouts.forEach((chk) => {
    CHECKOUT_MAP.set(chk.payment_intent, chk);
  });
}

function writeCSVCredit() {
  setMaps();
  let total = 0;
  let CSV_STRING =
    "payment_intent, date, product_id, product_name, customer_email, quantity, amount\n";
  transactions.forEach((trans) => {
    total += trans.amount / 100;
    const date = new Date(parseInt(trans.created) * 1000);
    const paym_int = trans.charges.data[0].payment_intent;
    if (INVOICE_MAP.has(paym_int)) {
      const inv = INVOICE_MAP.get(paym_int);
      CSV_STRING += `${paym_int}, ${date.toDateString()}, ${
        inv.lines.data[0].price.product
      }, ${inv.lines.data[0].description}, ${
        trans.charges.data[0].receipt_email
          ? trans.charges.data[0].receipt_email
          : trans.charges.data[0].billing_details.email
      }, null, ${trans.charges.data[0].amount}\n`;
    }
    if (CHECKOUT_MAP.has(paym_int)) {
      const chk = CHECKOUT_MAP.get(paym_int);
      CSV_STRING += `${paym_int}, ${date.toDateString()}, ${chk.metadata.id}, ${
        chk.metadata.plan_name
      }, ${
        trans.charges.data[0].receipt_email
          ? trans.charges.data[0].receipt_email
          : trans.charges.data[0].billing_details.email
      }, ${chk.metadata.description}, ${trans.charges.data[0].amount}\n`;
    }
  });
  console.log(total);
  fs.writeFileSync("./CSV_DATA_CREDIT.csv", CSV_STRING);
}

function writeCSVDebit() {
  setMaps();
  let total = 0;
  let CSV_STRING =
    "payment_intent, date, product_id, product_name, customer_email, quantity, amount\n";
  refunds.forEach((refund) => {
    const paym_int = refund.payment_intent;
    const date = new Date(parseInt(refund.created) * 1000);
    if (INVOICE_MAP.has(paym_int)) {
      const inv = INVOICE_MAP.get(paym_int);
      CSV_STRING += `${paym_int}, ${date.toDateString()}, ${
        inv.lines.data[0].price.product
      }, ${inv.lines.data[0].description}, ${inv.customer_email}, null, ${
        refund.amount
      }\n`;
    }
    if (CHECKOUT_MAP.has(paym_int)) {
      const chk = CHECKOUT_MAP.get(paym_int);
      CSV_STRING += `${paym_int}, ${date.toDateString()}, ${chk.metadata.id}, ${
        chk.metadata.plan_name
      }, ${chk.customer_details.email}, ${chk.metadata.description}, ${
        refund.amount
      }\n`;
    }
  });
  console.log(total);
  fs.writeFileSync("./CSV_DATA_DEBIT.csv", CSV_STRING);
}

(async () => {
  // await writeAllData();
  // if (verifyData()) {
  writeCSVCredit();
  writeCSVDebit();
  // } else {
  //   throw new Error("Checkouts and invoices dont add up to charges");
  // }
})();

// console.log(transactions.length);
