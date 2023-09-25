import mongoose from "mongoose";
import { User } from "../models/user";
import ContactModel, { Contact } from "../models/contact";
import CurrencyModel, { Currency } from "../models/currency";
import BorrowingModel, { Borrowing } from "../models/borrowing";
import RepaymentModel, { Repayment } from "../models/repayment";
import TransactionBaseModel, { TransactionBase } from "../models/transactionBase";
import AmountModel, { Amount } from "../models/amount";
import LoanModel from "../models/loan";
import borrowingAssembler from "../assemblers/borrowing";
import repaymentAssembler from "../assemblers/repayment";
import { Body as TransactionBody } from "./transaction";

interface Properties {
  body: Body;
  type: Type;
  user: User;
  bindedTransactionBaseId: string | undefined;
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
  transactionParams: TransactionBody
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
  bindedTransactionBaseId: string | undefined;

  constructor (properties: Properties) {
    this.body = properties.body;
    this.type = properties.type;
    this.user = properties.user;
    this.bindedTransactionBaseId = properties.bindedTransactionBaseId;
  }

  async validateBody () {
    const { amount, contact, borrowerType, repayerType } = this.body;

    if (!mongoose.Types.ObjectId.isValid(contact)) {
      return {
        error: 'Invalid "contact" id:' + contact
      };
    } else if (!mongoose.Types.ObjectId.isValid(amount?.currency)) {
      return {
        error: 'Invalid "currency" id:' + amount?.currency
      };
    }

    this.currency = await CurrencyModel.findOne({ _id: amount?.currency, user: this.user });
    this.contact = await ContactModel.findOne({ _id: contact, user: this.user });

    if (!this.currency) {
      return {
        error: 'Currency not found with id:' + amount?.currency
      };
    } else if (!this.contact) {
      return {
        error: '"Contact" not found with id:' + contact
      };
    }

    if (this.type === Type.Borrowing) {
      if (!borrowerType || !Object.values(BorrowerRepayerType).includes(borrowerType)) {
        return {
          error: '"BorrowerType" is not valid:' + borrowerType
        };
      }
    } else {
      if (!repayerType || !Object.values(BorrowerRepayerType).includes(repayerType)) {
        return {
          error: '"RepayerType" is not valid:' + repayerType
        };
      }
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
      // Get the previous Version
      let loanBefore = await LoanModel.findOne({ contact: this.contact?._id, user: this.user });
      if (!loanBefore) {
        loanBefore = await (new LoanModel({ contact: this.contact?._id, user: this.user, loanAmountsToUser: [] })).save();
      }

      versionBefore = loanBefore?.version || 0;
      // End Get the previous Version

      // Clear the previous saved Amounts from db
      loanBefore.loanAmountsToUser = [];
      await loanBefore.save();
      await AmountModel.deleteMany({ _id: { $in: loanAmountsToUser } });
      // End Clear the previous saved Amounts from db

      loanAmountsToUser = [];

      let loanAmountsObj: LoanAmountsObject = {};
      // Adding borrowings to loans in different currencies
      const borrowings = await BorrowingModel.find({ contact: this.contact }).populate('amount');
      for (let borrowing of borrowings) {
        if (!loanAmountsObj[borrowing.amount.currency]) {
          loanAmountsObj[borrowing.amount.currency] = 0;
        }

        if (borrowing.borrowerType === 'Contact') {
          loanAmountsObj[borrowing.amount.currency] += +borrowing.amount.value;
        } else {
          loanAmountsObj[borrowing.amount.currency] -= +borrowing.amount.value;
        }
      }
      // End Adding borrowings to loans in different currencies

      // Subtracting repayments
      const repayments = await RepaymentModel.find({ contact: this.contact }).populate('amount');
      for (let repayment of repayments) {
        if (!loanAmountsObj[repayment.amount.currency]) {
          loanAmountsObj[repayment.amount.currency] = 0;
        }

        if (repayment.repayerType === 'Contact') {
          loanAmountsObj[repayment.amount.currency] -= +repayment.amount.value;
        } else {
          loanAmountsObj[repayment.amount.currency] += +repayment.amount.value;
        }
      }
      // End Subtracting repayments

      for (let currencyId in loanAmountsObj) {
        if (+(loanAmountsObj[currencyId]).toFixed(2) == 0) {
          continue;
        }

        const savedAmount = await (new AmountModel({
          value: loanAmountsObj[currencyId],
          currency: currencyId,
          user: this.user
        })).save();
        loanAmountsToUser.push(savedAmount._id);
      }

      await LoanModel.findOneAndUpdate({ _id: loanBefore._id }, {
        loanAmountsToUser,
        $inc: { version: 1 }
      });

      const loanAfter = await LoanModel.findOne({ contact: this.contact?._id, user: this.user });
      versionAfter = loanAfter?.version || 0;
    }
  }

  async create () {
    const savedAmount = await (new AmountModel({
      value: this.body.amount.value,
      currency: this.body.amount.currency,
      user: this.user
    })).save();

    const population = [
      {
        path: 'amount',
        populate: { path: 'currency' }
      },
      { path: 'contact' },
      { path: 'bindedTransactionBase' }
    ];

    if (this.type === Type.Borrowing) {
      const borrowingParams = {
        contact: this.body.contact,
        amount: savedAmount._id,
        description: this.body.description,
        bindedTransactionBase: this.bindedTransactionBaseId,
        borrowerType: this.body.borrowerType,
        borrowedAt: this.body.borrowedAt,
        repaymentExpectedAt: this.body.repaymentExpectedAt,
        user: this.user
      };

      const savedBorrowing = await (new BorrowingModel(borrowingParams)).save();

      await this.calculateLoan();

      const foundBorrowing: Borrowing | null = await BorrowingModel.findOne({ _id: savedBorrowing._id }).populate(population);

      if (!foundBorrowing) {
        return {
          error: 'Unknown problem with borrowing'
        };
      }
  
      return {
        result: borrowingAssembler(foundBorrowing)
      };
    } else {
      // Check if there is a loan between the contact and the user
      const requiredLoanAmountToUser = this.body.repayerType === BorrowerRepayerType.Contact
        ? +this.body.amount.value
        : (-1 * +this.body.amount.value);

      let requiredAmountFound = false;
      const foundLoan = await LoanModel.findOne({
        user: this.user,
        contact: this.contact?._id
      }).populate([
        {
          path: 'loanAmountsToUser',
          populate: { path: 'currency' }
        }
      ]);

      foundLoan?.loanAmountsToUser.forEach(e => {
        if (e.currency.id === this.body.amount.currency) {
          if (requiredLoanAmountToUser < 0 && e.value <= requiredLoanAmountToUser) {
            requiredAmountFound = true;
          } else if (requiredLoanAmountToUser > 0 && e.value >= requiredLoanAmountToUser) {
            requiredAmountFound = true;
          }
        }
      });

      if (!requiredAmountFound) {
        return {
          error: 'Borrowing not found'
        };
      }
      // End Check if there is a loan between the contact and the user
      
      const repaymentParams = {
        contact: this.body.contact,
        amount: savedAmount._id,
        description: this.body.description,
        bindedTransactionBase: this.bindedTransactionBaseId,
        repayerType: this.body.repayerType,
        repaidAt: this.body.repaidAt,
        user: this.user
      };

      const savedRepayment = await (new RepaymentModel(repaymentParams)).save();

      this.calculateLoan();

      const foundRepayment: Repayment | null = await RepaymentModel.findOne({ _id: savedRepayment._id }).populate(population);

      if (!foundRepayment) {
        return {
          error: 'Unknown problem with repayment'
        };
      }
  
      return {
        result: repaymentAssembler(foundRepayment)
      };
    }
  }
}

export default Loan;

export { Properties, Body, Type, BorrowerRepayerType };