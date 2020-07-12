import logging
import boto3
import json
from botocore.exceptions import ClientError

def new_bucket(bucket_name, region):
    try:
        s3_client = boto3.client('s3', region_name=region)
        location = {'LocationConstraint': region}
        s3_client.create_bucket(Bucket=bucket_name,
                                CreateBucketConfiguration=location)
    except ClientError as e:
        logging.error(e)
        return "error"

    #setup bucket policy
    s3 = boto3.resource('s3')
    bucket_policy = s3.BucketPolicy(bucket_name)
    new_policy = {
        "Version": "2012-10-17",
        "Id": "Policy1546414473940",
        "Statement": [
            {
                "Sid": "Stmt1546414471931",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::978029434793:user/su_20_proj"
                },
                "Action": [
                    "s3:ListBucket",
                    "s3:PutObject",
                    "s3:PutObjectAcl",
                    "s3:DeleteObject",
                    "s3:GetObject"
                ],
                "Resource": [
                    "arn:aws:s3:::"+ bucket_name + "/*",
                    "arn:aws:s3:::"+ bucket_name
                ]
            }
        ]
    }

    policy_json = json.dumps(new_policy)

    policy_response = bucket_policy.put(
        ConfirmRemoveSelfBucketAccess=False,
        Policy=policy_json
    )

    #setup cors
    s3 = boto3.resource('s3')
    bucket_cors = s3.BucketCors(bucket_name)
    response = bucket_cors.put(
        CORSConfiguration={
            'CORSRules': [
                {
                    'AllowedHeaders': [
                        '*',
                    ],
                    'AllowedMethods': [
                        'POST','GET','PUT','DELETE','HEAD',
                    ],
                    'AllowedOrigins': [
                        '*',
                    ],
                    'ExposeHeaders': [
                        'ETag',
                    ]
                },
            ]
        },

    )
    return "success"


# def create_bucket(bucket_name, region):
#     """Create an S3 bucket in a specified region

#     If a region is not specified, the bucket is created in the S3 default
#     region (us-east-1).

#     :param bucket_name: Bucket to create
#     :param region: String region to create bucket in, e.g., 'us-west-2'
#     :return: True if bucket created, else False
#     """

#     # Create bucket
#     try:
#         s3_client = boto3.client('s3', region_name=region)
#         location = {'LocationConstraint': region}
#         s3_client.create_bucket(Bucket=bucket_name,
#                                 CreateBucketConfiguration=location)
#     except ClientError as e:
#         logging.error(e)
#         return "error"
#     return "success"