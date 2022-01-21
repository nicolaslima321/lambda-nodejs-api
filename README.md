# Lambda NodeJS API

### Context

This is a simplified version of an Offers API platform which allows customer's to connect brands (ex: Starbucks) with offers.
_Example: Add 5% cashback offer to Starbucks Oxford street location_
**Using the following tecnhologies:**

- AWS platform,
- Lambda,
- DynamoDB.
### Overview
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
- The project is protected under an API KEY setted on **serverless.yml** file, that are **api-key**. This **api-key** is supposed to be a unique key wranted for the customers of the application.
Because of that API KEY, you must add the header **`x-api-key`** with value **`v3IPj3dPvT62rJYm3Ho7d2owPMxyYQ7x5kJNWcsH`** in all the requests that you would do to the API.
- I shared my [Postman Collection](https://github.com/nicolaslima321/lambda-nodejs-api/tree/master/Postman%20Collection) used to develop the application, it contains all endpoints, headers, and body properly filled, it can help to test my API.
- To simulate that offers creations always be made by the same publisher, i created an environment variable called DEFAULT_UUID, with an static UUID
- I also created some endpoints that allow creation of offers, brands and locations

### Endpoints
The endpoints that have **{offerId}**, **{locationId}**, **{brandId}**, needs to be replaced to the current subject id at the url.

- API Keys:
```
  api-key (x-api-key): v3IPj3dPvT62rJYm3Ho7d2owPMxyYQ7x5kJNWcsH
```

- Brands
```
Creation

POST - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/brand
- Body example:
  {
    "name": "Starbucks"
  }
```

```
Index

GET - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/brand
```

```
Show :ID

GET - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/brand/{brandId}
```

- Offers
```
Creation

POST - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/offer
- Body example:
  {
    "name": "Super Duper Offer",
    "brandId": "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  }
```

```
Index

GET - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/offer
```

```
Show :ID

GET - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}
```

```
Link Offer to Locations

POST - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}/link-location/{locationId}
```

```
(BONUS) Link Offer to all locations from a brand

POST - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}/link-all-brands-location/{brandId}
```

- Location

```
Creation

POST - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/location
- Body example:
  {
    "address": "Lorem Ipsum Address",
    "brandId": "692126c8-6e72-4ad7-8a73-25fc2f1f56e4"
  }
```

```
Index

GET - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/location
```

```
Show :ID

GET - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/location/{locationId}
```

- (BONUS) Link Offer to all locations from a brand

```
POST - https://6pkqjlxvu0execute-api.us-east-1.amazonaws.com/dev/offer/{offerId}/link-all-brands-location/{brandId}
```

It notify the user at response when some of the links could not be performed.

---