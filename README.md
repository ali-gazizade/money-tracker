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

Add .env file inside the server folder and add SECRET_KEY parameter. This key will be used to encode and decode jwt token in the backend. So, choose this key carefully.

Add .env file inside the client folder and add this:
```BASE_URL=http://127.0.0.1:3010```
It will redirect the frontend requests to the backend server.

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
