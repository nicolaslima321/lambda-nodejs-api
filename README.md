# Fidel Coding Challenge

## About this challenge

This challenge focuses on RESTful API and data model design. It consists of 2 mandatory parts, plus an optional bonus task.
If you can't complete the bonus task, it's expected that you deliver a text explaining how you would solve the bonus task and how it fits into the solution you implemented, as well as be able to discuss it during the test review session.
We recommend that you write up a few short paragraphs explaining the decisions you made during the implementation of your solution, as well as what you would have done differently if it was meant to be a production-ready project.
Any questions you may have please contact us at backend-review@fidel.uk.

## Context

This test's main goal is to create a simplified version of the Offers API platform which allows customer's to connect brands (ex: Starbucks) with offers.
_Example: Add 5% cashback offer to Starbucks Oxford street location_
Feel free to browse our docs to familiarise yourself with our current [commercial offering](https://docs.fidel.uk/offers).
**The solution must be written in Javascript or Typescript, deployable, testable and use the following tecnhologies:**

- AWS platform,
- Lambda,
- DynamoDB.

You should take into consideration high request volume to the API and handle concurrency.
We suggest that you use Serverless Framework and API Gateway.

## Part 1

Create a DynamoDB data model and insert the following simplified data into it:

Offers

```
[{
  name: "Super Duper Offer",
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  locationsTotal: 0
}]
```

---

Locations

```
[{
  id: "03665f6d-27e2-4e69-aa9b-5b39d03e5f59",
  address: "Address 1",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  hasOffer: false
}, {
  id: "706ef281-e00f-4288-9a84-973aeb29636e",
  address: "Address 2",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  hasOffer: false
}, {
  id: "1c7a27de-4bbd-4d63-a5ec-2eae5a0f1870",
  address: "Address 3",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  hasOffer: false
}]
```

### Questions

1. Have you ever used DynamoDb before?
   - If not, how did you prepare for this task?
   - If yes, which patterns did you learn in the past that you used here?
2. How did you design your data model?
3. What are the pros and cons of Dynamodb for an API request?

## Part 2

Create a Lambda function with an API endpoint that allows to link a location to an offer. The lambda should also increase the counter in the offer and mark the location with `hasOffer: true`.

### Questions

1. Have you used Functions as a Service (FaaS) like AWS Lambda in the past?
   - If not, how did you prepare for this task?
   - If yes, how did this task compare to what you did?
2. How do you write operations within a concurrent architecture (parallel requests, series of async actions, async mapReduce patterns, etc.)?

## Bonus part

Consider a brand like Starbucks that has more than 10000 locations, create a Lambda function that allows to link all the brand's locations to an offer.

### Questions

If you cannot complete this part, please include a small text detailing your proposed solution, as well as the answers to the following questions:

1. What challenges do you foresee/have experienced for this part?
2. How would you handle operations that might take too long to complete (minutes instead of the typical endpoint ms range)?
3. If something fails in the middle of this long operation, how would you handle the error and notify the client?

