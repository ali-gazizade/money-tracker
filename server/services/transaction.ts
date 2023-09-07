import mongoose from "mongoose";
import { User } from "../models/user";
import WalletModel, { Wallet } from "../models/wallet";
import ContactModel, { Contact } from "../models/contact";
import CityModel, { City } from "../models/city";
import CurrencyModel, { Currency } from "../models/currency";
import AmountModel from "../models/amount";
import TransactionBaseModel, { TransactionBase } from "../models/transactionBase";
import ExpenseModel, { Expense } from "../models/expense";
import transactionAssembler from "../assemblers/transaction";
import IncomeModel, { Income } from "../models/income";
import TransferModel, { Transfer } from "../models/transfer";

interface Properties {
  body: Body;
  type: Type;
  user: User;
}

interface Body {
  from: string;
  to: string;
  amount: {
    value: string,
    currency: string
  };
  city: string;
  happenedAt: Date | string | null;
  description: string;
}

enum Type {
  Expense,
  Income,
  Transfer
}

class Transaction {
  body: Body;
  type: Type;
  user: User;

  city: City | null;
  currency: Currency | null;
  from: Wallet | Contact | null;
  to: Wallet | Contact | null;
  transactionBase: TransactionBase | null;

  constructor (properties: Properties) {
    this.body = properties.body;
    this.type = properties.type;
    this.user = properties.user;
  }

  async validateBody () {
    const { from, to, amount, city } = this.body;

    if (!mongoose.Types.ObjectId.isValid(city)) {
      return {
        error: 'Invalid "city" id:' + city
      };
    } else if (!mongoose.Types.ObjectId.isValid(amount?.currency)) {
      return {
        error: 'Invalid "currency" id:' + amount?.currency
      };
    } else if (!mongoose.Types.ObjectId.isValid(from)) {
      return {
        error: 'Invalid "from" id:' + from
      };
    } else if (!mongoose.Types.ObjectId.isValid(to)) {
      return {
        error: 'Invalid "to" id:' + to
      };
    }

    this.city = await CityModel.findOne({ _id: city, user: this.user });
    this.currency = await CurrencyModel.findOne({ _id: amount?.currency, user: this.user });
    if (this.type === Type.Expense) {
      this.from = await WalletModel.findOne({ _id: from, user: this.user });
      this.to = await ContactModel.findOne({ _id: to, user: this.user });
    } else if (this.type === Type.Income) {
      this.from = await ContactModel.findOne({ _id: from, user: this.user });
      this.to = await WalletModel.findOne({ _id: to, user: this.user });
    } else if (this.type === Type.Transfer) {
      this.from = await WalletModel.findOne({ _id: from, user: this.user });
      this.to = await WalletModel.findOne({ _id: to, user: this.user });
    }

    if (!this.city) {
      return {
        error: 'City not found with id:' + city
      };
    } else if (!this.currency) {
      return {
        error: 'Currency not found with id:' + amount?.currency
      };
    } else if (!from) {
      return {
        error: '"From" not found with id:' + from
      };
    } else if (!to) {
      return {
        error: '"To" not found with id:' + to
      };
    }

    return {
      error: null
    };
  }

  async createTransactionBase () {
    const savedAmount = await (new AmountModel({
      value: this.body.amount.value,
      currency: this.body.amount.currency,
      user: this.user
    })).save();

    this.transactionBase = await (new TransactionBaseModel({
      amount: savedAmount._id,
      city: this.body.city,
      happenedAt: this.body.happenedAt,
      description: this.body.description,
      user: this.user
    })).save();
  }

  async create () {
    await this.createTransactionBase();

    const Model = (this.type === Type.Expense)
      ? ExpenseModel
      : (this.type === Type.Income) ? IncomeModel
      : TransferModel;

    const savedTransaction = await (new Model({
      transactionBase: this.transactionBase?._id,
      from: this.from,
      to: this.to,
      user: this.user
    })).save();

    const foundTransaction: Expense | Income | Transfer | null = await Model.findOne({ _id: savedTransaction._id }).populate([
      {
        path: 'transactionBase',
        populate: [
          {
            path: 'amount',
            populate: { path: 'currency' }
          },
          { path: 'city' },
        ]
      },
      { path: 'from' },
      { path: 'to' }
    ]);

    if (!foundTransaction) {
      return {
        error: 'Unknown problem'
      };
    }

    return {
      result: transactionAssembler(foundTransaction)
    };
  }
}

export default Transaction;

export { Properties, Body, Type };
