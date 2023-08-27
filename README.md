# Contracts API

## Specification

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

Contractor get paid for jobs by clients under a certain contract.

## Running the API

1. Clone this repository.

1. In the repo root directory, run `npm install` or `yarn` to gather all dependencies.

1. Next, run `npm run seed` or `yarn seed` to seed the local SQLite database.

1. Then run `npm start` or `yarn start` which should start the API's server.

## API Endpoints

Below is a list of the API's endpoints.

### Contracts

1. **_GET_** `/contracts/:id` - Returns the user's contract by id

1. **_GET_** `/contracts` - Returns user's active contracts

### Jobs

1. **_GET_** `/jobs/unpaid` - Get user's unpaid jobs

1. **_POST_** `/jobs/:job_id/pay` - Pay for a job. Only clients can pay for jobs.

### Balance

1. **_GET_** `/balances` - Returns user's current balance

1. **_POST_** `/balances/deposit/:userId` - Make a deposit to client's balance. Clients can only deposit 25% of unpaid jobs total.

1. **_POST_** `/balances/withdraw` - Withdraw from contractor's available balance.

### Admin

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Get the best profession for a given time period. A profession is the one that earned the most money (sum of jobs paid) in the period.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - Get the best clients for a given time period. Clients are sorted by the amount of money they paid to the contractor in the given time period. The limit query paramater is optional and defaults to 2.

## To Do

- [ ] Improve Validations
- [ ] Add Unit tests
- [ ] Add Integration Tests
- [ ] Add Logging Tools
- [ ] API Documentation
- [ ] Dockerize
