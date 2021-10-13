# FidelAPI Test Nicolas Notes

- There will be some explanations about the project, how to setup, and some useful information.

### Overview
- I see in the main doc there's some questions to be answered, and it will be answered on this doc file.

- The project was developed in **NodeJs**, I used the framework **Serverless** to build the Lambda Application on AWS, it was created a setup to build an API through **API Gateway** platform, with **DynamoDB** and **Lambda**.

- I also used some libs to build the application that are, **dotenv** to provide the same environment variables used on serverless, to be reached on our tests, and also **Jest** a lib to provide a test environment and tools to test our API.

---

### Setup
- To reproduce this API in your AWS environment, you need to have AWS CLI installed on your OS, and the environment variables **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY** with the respective values.
- You also need **Serverless** framework installed in your OS, it can be done running `npm install -g serverless` ('How to' available on https://www.serverless.com/framework/docs/getting-started)

- With all the requirements check, you can install the project running:

```
npm install
```
And then, deploy and create it in your AWS running:
```
serverless deploy
```

### Tests

- The application has 100% tests coverage, you can see it running `npx jest --coverage`

To run the tests, just run
```
npm run test
```
- There's many console logs on tests, to omit then you can run `npx jest --silent`
---

### Informations
- The project is protected under an API KEY setted on **serverless.yml** file, that are **fideltest-key**. That was based on the same protection used on FidelAPI (Reference: https://reference.fidel.uk/reference#authentication), **fideltest-key** is supposed to be a unique key wranted for the customers of the application.
Because of that API KEY, you must add the header **`x-api-key`** with value **`v3IPj3dPvT62rJYm3Ho7d2owPMxyYQ7x5kJNWcsH`** in all the requests that you would do to the API.
- I shared my [Postman Collection](https://github.com/FidelLimited/be-techtest-nicolaslima/tree/master/Postman%20Collection) used to develop the application, it contains all endpoints, headers, and body properly filled, it can help to test my API.
- My production API is available on https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/
- To simulate that offers creations always be made by the same publisher, i created an environment variable called DEFAULT_UUID, with an static UUID
- I also created some endpoints that allow creation of offers, brands and locations

### Endpoints
The endpoints that have **{offerId}**, **{locationId}**, **{brandId}**, needs to be replaced to the current subject id at the url.

- API Keys:
```
  fideltest-key (x-api-key): v3IPj3dPvT62rJYm3Ho7d2owPMxyYQ7x5kJNWcsH
```

- Brands
```
Creation

POST - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/brand
- Body example:
  {
    "name": "Starbucks"
  }
```

```
Index

GET - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/brand
```

```
Show :ID

GET - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/brand/{brandId}
```

- Offers
```
Creation

POST - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/offer
- Body example:
  {
    "name": "Super Duper Offer",
    "brandId": "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  }
```

```
Index

GET - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/offer
```

```
Show :ID

GET - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}
```

```
Link Offer to Locations

POST - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}/link-location/{locationId}
```

```
(BONUS) Link Offer to all locations from a brand

POST - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}/link-all-brands-location/{brandId}
```

- Location

```
Creation

POST - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/location
- Body example:
  {
    "address": "Lorem Ipsum Address",
    "brandId": "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  }
```

```
Index

GET - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/location
```

```
Show :ID

GET - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/location/{locationId}
```

---

### Answers

##### Part 1
1. Have you ever used DynamoDb before? If not, how did you prepare for this task? If yes, which patterns did you learn in the past that you used here?
**Answer:** No, I never worked with DynamoDb before, just read about it, and learned some things. I prepared myself by learning through AWS documentations, and creating a little NodeJs project to test it.

<br>

2. How did you design your data model?
**Answer:** I tried to follow the FidelAPI Offer purpose (https://fidel.uk/docs/offers) and saw that Offer creation requires a Brand, this Brand is also referred for Locations.
Then I created 3 models, Locations and Offer, the two parts of the test didn't mention a need to create Brand model, but i created, and became possible to create new Brands if is wanted to.
Offers and Locations are linked to Brand through brandId, all brandId fields are GlobalIndexes, to improve the search through DynamoDB

<br>

3. What are the pros and cons of Dynamodb for an API request?
**Answer:** Cons: I thought the forms that queries are made is a little limited, it’s harder to perform queries with medium-high complexity; You have a limit of capacity write/read, that is defined on `ProvisionedThroughput` (in serverlerss.yml file), and even defining it to 'auto', it's not very predictable how much you will pay for it.
Pros: It’s very easy to install, configure; It’s a flexible database; The SDK integration is very good and easy to perform;

---

##### Part 2
1. Have you used Functions as a Service (FaaS) like AWS Lambda in the past? If not, how did you prepare for this task? If yes, how did this task compare to what you did?
**Answer:** No, I never worked with FaaS in the past, I only made a "Hello World" once, in lambda, and also learned some things about it. I prepared myself by learning through documentation, and creating a little NodeJs project, the same that I used to learn DynamoDB.

<br>

2. How do you write operations within a concurrent architecture (parallel requests, series of async actions, async mapReduce patterns, etc.)?
**Answer:** In JavaScript, I handled series of async functions, parallelism, using Promises (reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), basically handling individual promises/async actions, and a lot of promises with **`Promise.allSettled()`** or **`Promise.all()`** (According my need)
In other languages, I've used parallel requests, jobs, processes. For example, I used in PHP, with Amazon SQS and Laravel (https://laravel.com/docs/8.x/queues), and also for Elixir with Phoenix (https://hexdocs.pm/elixir/1.12/Kernel.ParallelCompiler.html#async/1).

---

#### Bonus
Bonus implementation is available on the follow endpoint:
```
(BONUS) Link Offer to all locations from a brand

POST - https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}/link-all-brands-location/{brandId}
```

It notify the user at response when some of the links could not be performed.

---
##### What i done differently if it was meant to be a production project
- The application is currently set to work with **`Provisioned Throughput`** Read/Write Capacity at once, it could be increased to meet the demand, to not limit if reached an assumed max capacity limit, that would bring a better flow rate for many requests.
- Its possible to add a **socket** implementation to notify the user before the request is completed at the huge request (Bonus task: 10000 locations assignments at one request), to not stuck the user while the request is not completed, then through socket, would be possible do send events of feedback for example, for each 100 locations that are linked, user will get a notion about the request progress.
- The test API is very simplified, user doesn't have much options to custom it's problem solution. Adding more resources will bring an better experience for them (Justl like the FidelAPI Offer today).
