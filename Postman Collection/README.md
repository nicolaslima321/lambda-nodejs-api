### Fidel API Test - Postman Collection

---

Hello there =]

Im sharing the endpoint collection that i used through development, i hope it will be usefull for test my API.

#### Important Notes

Theres some ENV keys to make things easier, you can store them as a environment postman variable, or just overwrite with the expected value

**`{{AWS-API-URL}}`** - The URL of our API Gateway, from AWS, for example, on my usage: **https://6pkqjlxvu0.execute-api.us-east-1.amazonaws.com**

**`{{FIDELTEST-API-KEY}}`** - Is the API Key to protect our API, is available on `serverless.yml` file, but you just can fill it with **`v3IPj3dPvT62rJYm3Ho7d2owPMxyYQ7x5kJNWcsH`**

**`brandId, locationId, offerId`** - Its the ID/UUID of current subject (Offer, Location or Brand)