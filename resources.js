module.exports = function upload (arc, cfn) {

  // seed for a random but static bucket name
  let hbd = 1569639949124

  cfn.Parameters = {
    BucketPrefix: {
      Type: 'String',
      Default: (Date.now() - hbd).toString(36)
    }
  }

  // the upload bucket! CORS on so you can upload directly to S3
  cfn.Resources.UploadBucket = {
    DependsOn: 'UploadLambdaInvokePermission',
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: {
        'Fn::Sub': '${BucketPrefix}-upload-bucket'
      },
      CorsConfiguration: {
        CorsRules: [ {
          AllowedHeaders: [
            '*'
          ],
          AllowedMethods: [
            'GET', 'POST'
          ],
          AllowedOrigins: [
            '*'
          ],
          MaxAge: '3000'
        } ]
      },
      NotificationConfiguration: {
        LambdaConfigurations: [ {
          'Function': {
            'Fn::GetAtt': [ 'UploadLambda', 'Arn' ]
          },
          Event: 's3:ObjectCreated:*',
          Filter: {
            S3Key: {
              Rules: [ {
                Name: 'prefix',
                Value: 'raw'
              } ]
            }
          }
        } ]
      }
    }
  }

  cfn.Resources.UploadLambdaInvokePermission = {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      FunctionName: {
        'Fn::GetAtt': [ 'UploadLambda', 'Arn' ]
      },
      Action: 'lambda:InvokeFunction',
      Principal: 's3.amazonaws.com',
      SourceArn: {
        'Fn::Sub': 'arn:aws:s3:::${BucketPrefix}-upload-bucket'
      }
    }
  }

  // add a lambda to process uploaded contents
  cfn.Resources.UploadLambda = {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'index.handler',
      CodeUri: './src/upload',
      Runtime: 'nodejs12.x',
      MemorySize: 3008,
      Timeout: 60,
      Environment: {
        Variables: {}
      },
      Role: {
        'Fn::Sub': [
          'arn:aws:iam::${AWS::AccountId}:role/${role}',
          { role: { Ref: 'UploadRole' } }
        ]
      }
    }
  }

  return cfn
}
