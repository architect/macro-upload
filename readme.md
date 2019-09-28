# arc-macro-upload

Creates an S3 bucket for direct uploading and a Lambda function for processing direct uploads.

## Add to your project

```bash
npm i @architect/macro-upload
```

And add to your `.arc` file:

```arc
@app
testapp

@http
get /
get /success

@macros
architect/macro-upload
```

## Render the upload form

To render the upload form add the macro to any Lambdas you want to render the form. For the example `.arc` above:

```bash
cd src/http/get-index 
npm i @architect/macro-upload
```

And then in the function code:

```javascript
let form = require('@architect/macro-upload/form')

exports.handler = async function http(req) {
  let headers = {'content-type': 'text/html; charset=utf8'}
  let redirect = `https://${req.headers.Host}/staging/success`
  let body = form({redirect})
  return {headers, body}
}
```

For a complete example see [arc-example-macro-upload](https://github.com/architect-examples/arc-example-macro-upload)
