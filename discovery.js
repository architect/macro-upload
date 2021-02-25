/**
 * adds env vars for service, key and secret discovery at runtime
 *
 * - S3_UPLOAD_BUCKET
 * - S3_UPLOAD_KEY
 * - S3_UPLOAD_SECRET
 */
module.exports = function discovery (arc, cfn) {

  // loop thru all lambdas and add the S3_UPLOAD_SECRET and S3_UPLOAD_KEY
  Object.keys(cfn.Resources).forEach(resource => {

    let current = cfn.Resources[resource]
    let lambda = current.Type === 'AWS::Serverless::Function' || current.Type === 'AWS::Lambda::Function'
    if (lambda) {

      if (!current.Properties.Environment)
        current.Properties.Environment = {}

      if (!current.Properties.Environment.Variables)
        current.Properties.Environment.Variables = {}

      current.Properties.Environment.Variables.S3_UPLOAD_BUCKET = {
        'Fn::Sub': '${BucketPrefix}-upload-bucket'
      }

      current.Properties.Environment.Variables.S3_UPLOAD_KEY = {
        Ref: 'Creds'
      }

      current.Properties.Environment.Variables.S3_UPLOAD_SECRET = {
        'Fn::GetAtt': [ 'Creds', 'SecretAccessKey' ]
      }
    }
  })

  // add the bucket to the outputs also
  cfn.Outputs.UploadBucket = {
    Description: 'S3 Bucket for uploads',
    Value: {
      'Fn::Sub': '${BucketPrefix}-upload-bucket'
    }
  }

  return cfn
}
