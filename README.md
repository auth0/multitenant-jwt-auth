# Multitenant JWT Auth sample
This sample shows how to implement an API that:

* Uses JWTs for authentication
* Uses claims in those JWTs for authorization
* Supports blacklisting JWTs

## Installation
Clone this repository. The run:
```
npm i
```

## Running the sample
The sample has two components:
* A server that hosts the API
* A CLI that can be used to perform requests to the API.

### Running the server
```
node server.js
```

### Using the CLI
```
./cli --help

  Usage: cli [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    --tenant <tenant>  The tenant id. Either "tenant_1" or "tenant_2"
    --token <token>    The JWT for the tenant. Either 1 or 2
```

Using each tenant token combo yields a different result:
* Token 1 for **tenant_1** will send a response the users. The JWT has the correct scopes and is not blacklisted.
  ```
  > ./cli --tenant tenant_1 --token 1
  Success [{"name":"Jane Doe"},{"name":"John Doe"}]
  ```

* Token 2 for **tenant_1** will send a response with an error because the token is revoked.
  ```
  > ./cli --tenant tenant_1 --token 2
  {"name":"UnauthorizedError","code":"revoked_token"}
  ```
  
* Token 1 for **tenant_2** will send a response with an error because the token does not have the required scope.
  ```
  >./cli --tenant tenant_2 --token 1
  {"name":"UnauthorizedError","code":"insufficient_scopes"}
  ```
  
* Token 2 for **tenant_2** will send a response with an error because the token is revoked. It does not have the required scope, but that check is done before.
  ```
  > ./cli --tenant tenant_2 --token 2
  {"name":"UnauthorizedError","code":"revoked_token"}
  ```

## Contributing
Just send a PR, you know the drill.

## Issues
If you find any issues or have suggestions please report them.

## Author
[Auth0](https://auth0.com/)

## License
MIT