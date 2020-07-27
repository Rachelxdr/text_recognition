#Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

import boto3

def detect_text(photo, bucket):
    print("photo name: ", photo)
    print("bucket name: ", bucket)
    client=boto3.client('rekognition')

    hardCoded_bucket = "xdrbucket2"
    hardCoded_photo = "album1//test.png"

    print("hardCoded_bucket",hardCoded_bucket)
    print("hardCoded_photo", hardCoded_photo)
    response=client.detect_text(Image={'S3Object':{'Bucket':bucket,'Name':photo}})
    # response=client.detect_text(Image={'S3Object':{'Bucket':hardCoded_bucket,'Name':hardCoded_photo}})
                        
    textDetections=response['TextDetections']
    result = ""
    print ('Detected text\n----------')
    for text in textDetections:
            if text['Type'] == 'LINE':
                result = result + text['DetectedText'] + "\n"

            print ('Detected text:' + text['DetectedText'])
            print ('Confidence: ' + "{:.2f}".format(text['Confidence']) + "%")
            print ('Id: {}'.format(text['Id']))
            if 'ParentId' in text:
                print ('Parent Id: {}'.format(text['ParentId']))
            print ('Type:' + text['Type'])
            print()
        
    print("result is: ",result)
    return result

# def main():

#     bucket='text20'
#     photo='/text_album//test.png'
#     text_count=detect_text(photo,bucket)
#     print("Text detected: " + str(text_count))


if __name__ == "__main__":
    main()