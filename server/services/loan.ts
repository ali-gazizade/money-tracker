import mongoose from "mongoose";
import { User } from "../models/user";
import ContactModel, { Contact } from "../models/contact";
import CurrencyModel, { Currency } from "../models/currency";
import BorrowingModel from "../models/borrowing";
import RepaymentModel from "../models/repayment";
import TransactionBaseModel, { TransactionBase } from "../models/transactionBase";
import AmountModel, { Amount } from "../models/amount";
import LoanModel from "../models/loan";

interface Properties {
  body: Body;
  type: Type;
  user: User;
}

interface Body {
  contact: string;
  amount: {
    value: string,
    currency: string
  };
  borrowerType: BorrowerRepayerType;
  repayerType: BorrowerRepayerType;
  borrowedAt: Date | string | null;
  repaidAt: Date | string | null;
  repaymentExpectedAt: Date | string | null;
  description: string;
  bindedTransactionBase: string | null;
}

enum Type {
  Borrowing = 'Borrowing',
  Repayment = 'Repayment'
}

enum BorrowerRepayerType {
  Contact = 'Contact',
  User = 'User'
}

interface LoanAmountsObject {
  [currencyId: string]: any
}

class Loan {
  body: Body;
  type: Type;
  user: User;

  currency: Currency | null;
  contact: Contact | null;
  bindedTransactionBase: TransactionBase | null;

  constructor (properties: Properties) {
    this.body = properties.body;
    this.type = properties.type;
    this.user = properties.user;
  }

  async validateBody () {
    const { amount, contact, bindedTransactionBase, borrowerType, repayerType } = this.body;

    if (!mongoose.Types.ObjectId.isValid(contact)) {
      return {
        error: 'Invalid "contact" id:' + contact
      };
    } else if (!mongoose.Types.ObjectId.isValid(amount?.currency)) {
      return {
        error: 'Invalid "currency" id:' + amount?.currency
      };
    } else if (bindedTransactionBase && !mongoose.Types.ObjectId.isValid(bindedTransactionBase)) {
      return {
        error: 'Invalid "transactionBase" id:' + bindedTransactionBase
      };
    }

    this.currency = await CurrencyModel.findOne({ _id: amount?.currency, user: this.user });
    this.contact = await ContactModel.findOne({ _id: contact, user: this.user });
    this.bindedTransactionBase = bindedTransactionBase
      ? await TransactionBaseModel.findOne({ _id: bindedTransactionBase, user: this.user })
      : null;

    if (!this.currency) {
      return {
        error: 'Currency not found with id:' + amount?.currency
      };
    } else if (!this.contact) {
      return {
        error: '"Contact" not found with id:' + contact
      };
    } else if (bindedTransactionBase && !this.bindedTransactionBase) {
      return {
        error: '"BindedTransactionBase" not found with id:' + bindedTransactionBase
      };
    }

    if (this.type === Type.Borrowing) {
      if (!borrowerType || !Object.values(BorrowerRepayerType).includes(borrowerType)) {
        return {
          error: '"BorrowerType" is not valid:' + borrowerType
        };
      }
    } else if (this.type === Type.Repayment) {
      if (!repayerType || !Object.values(BorrowerRepayerType).includes(repayerType)) {
        return {
          error: '"RepayerType" is not valid:' + repayerType
        };
      }
    } else {
      return {
        error: 'Type is not valid'
      };
    }

    return {
      error: null
    };
  }

  async calculateLoan () {
    let versionBefore = 0;
    let versionAfter = 0;

    let loanAmountsToUser = [];
    while (versionAfter != (versionBefore + 1)) {
      // Clear the previous saved Amounts from db
      await AmountModel.deleteMany({ _id: { $in: loanAmountsToUser } });
      // End Clear the previous saved Amounts from db

      loanAmountsToUser = [];

      // Get the previous Version
      let loanBefore = await LoanModel.findOne({ contact: this.contact?._id, user: this.user });
      if (!loanBefore) {
        loanBefore = await (new LoanModel({ contact: this.contact?._id, user: this.user, loanAmountsToUser: [] })).save();
      }

      versionBefore = loanBefore?.version || 0;
      // End Get the previous Version

      let loanAmountsObj: LoanAmountsObject = {};
      // Adding borrowings to loans in different currencies
      const borrowings = await BorrowingModel.find({ contact: this.contact }).populate('amount');
      for (let borrowing of borrowings) {
        if (!loanAmountsObj[borrowing.amount.currency]) {
          loanAmountsObj[borrowing.amount.currency] = 0;
        }

        loanAmountsObj[borrowing.amount.currency] += loanAmountsObj[borrowing.amount.value];
      }
      // End Adding borrowings to loans in different currencies

      // Subtracting repayments
      const repayments = await RepaymentModel.find({ contact: this.contact }).populate('amount');
      for (let repayment of repayments) {
        if (!loanAmountsObj[repayment.amount.currency]) {
          loanAmountsObj[repayment.amount.currency] = 0;
        }

        loanAmountsObj[repayment.amount.currency] -= loanAmountsObj[repayment.amount.value];
      }
      // End Subtracting repayments

      for (let currencyId in loanAmountsObj) {
        const savedAmount = await (new AmountModel({
          value: loanAmountsObj[currencyId],
          currency: currencyId
        })).save();
        loanAmountsToUser.push(savedAmount._id);
      }

      loanBefore.version = loanBefore?.version + 1;
      loanBefore.loanAmountsToUser = loanAmountsToUser;
      await loanBefore.save();

      const loanAfter = await LoanModel.findOne({ contact: this.contact?._id, user: this.user });
      versionAfter = loanAfter?.version || 0;
    }
  }

  async create () {
    let loanActionParams;

    const savedAmount = await (new AmountModel({
      value: this.body.amount.value,
      currency: this.body.amount.currency,
      user: this.user
    })).save();

    const Model = (this.type === Type.Borrowing) ? BorrowingModel : RepaymentModel;

    if (this.type === Type.Borrowing) {
      loanActionParams = {
        contact: this.body.contact,
        amount: savedAmount._id,
        description: this.body.description,
        bindedTransactionBase: this.body.bindedTransactionBase,
        borrowerType: this.body.borrowerType,
        borrowedAt: this.body.borrowedAt,
        repaymentExpectedAt: this.body.repaymentExpectedAt,
        user: this.user
      };
    } else {
      loanActionParams = {
        contact: this.body.contact,
        amount: savedAmount._id,
        description: this.body.description,
        bindedTransactionBase: this.body.bindedTransactionBase,
        repayerType: this.body.repayerType,
        repaidAt: this.body.repaidAt,
        user: this.user
      };
    }

    const savedLoanAction = await (new Model(loanActionParams)).save();

    this.calculateLoan();

    // Todo return saved loan action in assembler
  }
}