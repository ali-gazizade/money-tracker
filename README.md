# money-tracker
This application is a simple solution for tracking the money transactions and loans. There are backend frontend codes inside this repository. Main technologies used in this project: Typescript, Next.js, React, Ant Design, Express.js, Mongoose.

## Installation

Clone the repository: ```git clone https://github.com/ali-gazizade/money-tracker.git```

Install dependencies:
```
cd server
npm install
cd ../client
npm install
```

Add .env file inside the server folder and add SECRET_KEY parameter. This key will be used to encode and decode jwt token in the backend. So, choose this key carefully. Then add ```DB_CONNECTION=mongodb://localhost:27017/money-tracker``` line to this file. It is required for mongodb connection.

Add .env file inside the client folder and add this:
```BASE_URL=http://127.0.0.1:3010```
It will redirect the frontend requests to the backend server.

Go to server folder directory and run first time setup script like this:
```
cd server
npm run setup
```

It will create the first test user and the first currency for the application usage.

## Usage

Run the server app in a terminal:

```
cd server
npm run dev
```

Run the client app in another terminal:

```
cd client
npm run dev
```
Go to http://localhost:3000 in a browser and type the first created user credentials in server/scripts/setup.ts file. As a default they were username: "test@example.com" and password" "testpassword". If you want to run "npm run setup" again with different credentials, then you must clear the database and run again.

Before adding transactions and loans, Settings pages must be ready.
Go to Settings->Currencies page for adding the currencies you use in money transactions. In here, you will see name, default and exchange rate fields.
- Name: Currency name like USD, EUR.
- Default: There can be only 1 default and if the currency is the default one, then your money balance, total incomes, expenses in dashboard will be calculated with this currency.
- Exchange Rate: It is 1 if it is the default currency. But else, you must set this rate based on the default currency. It will be used in money balance, total incomes, total expenses calculations.

Go to Settings->Cities page to add your current city. And you will add more cities when you travel to another city and spend money there. When adding transactions, the last used city will be selected as a default and you have to only change it when traveling to another city. The purpose of this page is being able to calculate the money spent in travel.
- Name: Just a city name.
- Country name: This field is an autocomplete and will show you previously used country names. If it is a new one, just type it as an input field.

Go to Settings->Wallets page to add your wallets. The wallets can be a real wallet, money case, online account or anything else you store your money in.
- Name: Name your wallets as you like.
- Initial amounts: Add initial money amounts in this wallet.

Go to Settings->Contacts page to add your contacts. Just type a contact name and add your contact. You don't need to add all the contacts at once. You can add them later, when you add a new transaction or a new loan.

If you have a new expense or a new income or if you transfered money between your accounts(wallets), then go to Transactions page. And add a new transaction.
- From: Which wallet or contact the money moved from.
- To: Which wallet or contact the money moved to.
- Money Amount and the Currency: If you have used multiple currencies in this transaction, it is the best to add them as multiple transactions.
- City: Select the city where you were located when making this transaction.
- Description: It is the best practice to add some description every time while adding a transaction.

If you borrow money or your contact borrows money from you, go to Loan->Borrowings to add a new borrowing. This will automatically add a new loan to you or to the contact.
- Contact: Select the contact with autocomplete
- Money Amount and the Currency
- Borrower: The borrower is the contact or the user who borrowed money. Either you(user) borrowed money from contact or the selected contact borrowed money from you(user)
- Description: Write a description about the reason of the loan

If you or a contact repaid the borrowed money, then go to Loan->Repayments and add a repayment.

Note: Borrowings, Repayments are not like Transactions. Let's see an example: You paid your contact's restaurant bill and you wanna add it as a borrowing. Then just add a borrowing without any additional transaction. But if your contact borrowed money and you gave him the money from your wallet, then you also have to create an expense. The same thing is applied to Repayments.

Total loan amounts will be displayed in the dashboard page. If you wanna see the loans for each contact, then go to Loan->Contacts page.
