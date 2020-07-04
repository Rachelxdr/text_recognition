// Configures the SDK and creates an AWS s3 ervice object
var albumBucketName = "text20"; // TODO: change to user input
var bucketRegion = "us-west-2"; //TODO: change to user input
var IdentityPoolId = "us-west-2:c4b428fa-ea5b-4a7b-96dc-afc829cc8d24"; //TODO: change to  user input

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});
