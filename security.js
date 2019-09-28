/**
 * sets up the security posture for uploading
 *
 * - creates a user for the purpose of signing uploads directly to s3 from the browser
 * - gives it minimal policy for uploading
 * - creates a resource named 'Creds' which we get id and key for upload signing
 * - adds UploadMacroPolicy to 'Role' so any Lambda can read/write the bucket contents
 */
module.exports = function security(arc, cfn) {

  // create an IAM user for uplaoding
  cfn.Resources.Uploader = {
    Type: 'AWS::IAM::User',
    Properties: {}
  }

  // grand it minimal permissions to upload
  cfn.Resources.UploadMinimalPolicy = {
    Type: 'AWS::IAM::Policy',
    DependsOn: 'UploadBucket',
    Properties: {
      PolicyName: 'UploadPolicy',
      PolicyDocument: {
        Statement: [{
          Effect: 'Allow',
          Action: [
            's3:PutObject',
            's3:PutObjectAcl'
          ],
          Resource: [{
            'Fn::Sub': 'arn:aws:s3:::${BucketPrefix}-upload-bucket'
          },
          {
            'Fn::Sub': 'arn:aws:s3:::${BucketPrefix}-upload-bucket/*'
          }]
        }]
      },
      Users: [{Ref: 'Uploader'}],
    }
  }

  // create a secret key for it
  cfn.Resources.Creds = {
    Type: 'AWS::IAM::AccessKey',
    DependsOn: 'Uploader',
    Properties: {
      UserName: {Ref: 'Uploader'}
    }
  }

  // p chill tbh
  cfn.Resources.UploadRole = {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com'
          },
          Action: 'sts:AssumeRole'
        }]
      },
      Policies: [{
        PolicyName: 'ArcGlobalPolicy',
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
              'logs:DescribeLogStreams'
            ],
            'Resource': 'arn:aws:logs:*:*:*'
          }]
        }
      }]
    }
  }

  cfn.Resources.UploadPolicy = {
    Type: 'AWS::IAM::Policy',
    Properties: {
      PolicyName: 'UploadMacroPolicy',
      PolicyDocument: {
        Statement: [{
          Effect: 'Allow',
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:PutObjectAcl',
            's3:ListBucket'
          ],
          Resource: [{
            'Fn::Sub': 'arn:aws:s3:::${BucketPrefix}-upload-bucket'
          },
          {
            'Fn::Sub': 'arn:aws:s3:::${BucketPrefix}-upload-bucket/*'
          }]
        }]
      },
      Roles: [{Ref: 'Role'}, {Ref: 'UploadRole'}]
    }
  }

  return cfn
}
