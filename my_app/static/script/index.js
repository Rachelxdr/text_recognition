/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

//snippet-sourcedescription:[s3_photoExample.js demonstrates how to manipulate photos in albums stored in an Amazon S3 bucket.]
//snippet-service:[s3]
//snippet-keyword:[JavaScript]
//snippet-sourcesyntax:[javascript]
//snippet-keyword:[Code Sample]
//snippet-keyword:[Amazon S3]
//snippet-sourcetype:[full-example]
//snippet-sourcedate:[]
//snippet-sourceauthor:[AWS-JSDG]

// ABOUT THIS NODE.JS SAMPLE: This sample is part of the SDK for JavaScript Developer Guide topic at
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

// snippet-start:[s3.JavaScript.photoAlbumExample.complete]
// snippet-start:[s3.JavaScript.photoAlbumExample.config]
// var albumBucketName = "text20";
var albumBucketName_html = document.getElementById("bucketName");
var bucketRegion_html = document.getElementById("region");
// var IdentityPoolId_html;

// function setupName(albumBucketName, bucketRegion, IdentityPoolId){
  albumBucketName = albumBucketName_html.textContent; // TODO: change to user input
  bucketRegion = bucketRegion_html.textContent; //TODO: change to user input
  IdentityPoolId = "us-west-2:c4b428fa-ea5b-4a7b-96dc-afc829cc8d24"; //TODO: change to  user input
  var album_name = document.getElementById('albumName');

// }

// function setUpS3(){
//   setupName();
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

  // return s3;
// }

//getHtml helper function
function getHtml(template) {
  return template.join('\n');
}

// snippet-end:[s3.JavaScript.photoAlbumExample.config]

// snippet-start:[s3.JavaScript.photoAlbumExample.listAlbums]
function listAlbums() {
  // var s3 = setupName(albumBucketName, bucketRegion, IdentityPoolId);
  s3.listObjects({ Delimiter: "/" }, function(err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace("/", ""));
        return getHtml([
          "<li>",
          "<span onclick=\"deleteAlbum('" + albumName + "')\">X</span>",
          "<span onclick=\"viewAlbum('" + albumName + "')\">",
          albumName,
          "</span>",
          "</li>"
        ]);
      });
      var message = albums.length
        ? getHtml([
            "<p>Click on an album name to view it.</p>",
            "<p>Click on the X to delete the album.</p>"
          ])
        : "<p>You do not have any albums. Please Create album.";
      var htmlTemplate = [
        "<h2>Albums</h2>",
        message,
        "<ul>",
        getHtml(albums),
        "</ul>",
        "<button onclick=\"createAlbum(prompt('Enter Album Name:'))\">",
        "Create New Album",
        "</button>"
      ];
      document.getElementById("list_albums").innerHTML = getHtml(htmlTemplate);
    }
  });
}
// snippet-end:[s3.JavaScript.photoAlbumExample.listAlbums]

// snippet-start:[s3.JavaScript.photoAlbumExample.createAlbum]
function createAlbum() {
  // var s3 = setupName(albumBucketName, bucketRegion, IdentityPoolId);
  var albumName = document.getElementById('albumName').value;
  console.log("album name is: ", albumName);
  albumName = albumName.trim();
  if (!albumName) {
    return alert("Album names must contain at least one non-space character.");
  }
  if (albumName.indexOf("/") !== -1) {
    return alert("Album names cannot contain slashes.");
  }
  var albumKey = encodeURIComponent(albumName) + "/";
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
    if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }
    s3.putObject({ Key: albumKey }, function(err, data) {
      if (err) {
        return alert("There was an error creating your album: " + err.message);
      }
      alert("Successfully created album.");
      viewAlbum(albumName);
    });
  });
}
// snippet-end:[s3.JavaScript.photoAlbumExample.createAlbum]

// snippet-start:[s3.JavaScript.photoAlbumExample.viewAlbum]
function viewAlbum(albumName) {
  // var s3 = setupName(albumBucketName, bucketRegion, IdentityPoolId);
  var albumPhotosKey = encodeURIComponent(albumName) + "//";
  console.log("key: ", albumPhotosKey);
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";

    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        '<img style="width:200px;height:200px;object-fit:cover" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span onclick=\"deletePhoto('" +
          albumName +
          "','" +
          photoKey +
          "')\">",
        "X",
        "</span>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>"
      ]);
    });
    var message = photos.length
      ? "<p>Click on the X to delete the photo</p>"
      : "<p>You do not have any photos in this album. Please add photos.</p>";
    var htmlTemplate = [
      "<h2>",
      "Album: " + albumName,
      "</h2>",
      message,
      "<div>",
      getHtml(photos),
      "</div>",
      '<input id="photoupload" type="file" accept="image/*">',
      '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
      "Add Photo",
      "</button>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      '<div>Choose a Photo for Text Recognition</div>',
      // '<form method="POST">',
      //   '<input type="text" name="photoName" id="photoName" required>',
      //   '<input type="submit" value="Choose">',
      // '</form>'
    ];
    document.getElementById("view_album").innerHTML = getHtml(htmlTemplate);
  });
}
// snippet-end:[s3.JavaScript.photoAlbumExample.viewAlbum]

// snippet-start:[s3.JavaScript.photoAlbumExample.addPhoto]
function addPhoto(albumName) {
  // var s3 = setupName(albumBucketName, bucketRegion, IdentityPoolId);
  var files = document.getElementById("photoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(albumName) + "//";
  
  var photoKey = albumPhotosKey + fileName;
  console.log("photoKey: ", photoKey);
  console.log("albumBucketName: ", albumBucketName);
  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file,
      ACL: "public-read"
    }
  });
  var promise = upload.promise();

  promise.then(
    function(data) {
      alert("Successfully uploaded photo.");
      viewAlbum(albumName);
    },
    function(err) {
      console.log(err.message)
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
}
// snippet-end:[s3.JavaScript.photoAlbumExample.addPhoto]

// snippet-start:[s3.JavaScript.photoAlbumExample.deletePhoto]
function deletePhoto(albumName, photoKey) {
  // s3 = setupName(albumBucketName, bucketRegion, IdentityPoolId);
  s3.deleteObject({ Key: photoKey }, function(err, data) {
    if (err) {
      return alert("There was an error deleting your photo: ", err.message);
    }
    alert("Successfully deleted photo.");
    viewAlbum(albumName);
  });
}
// snippet-end:[s3.JavaScript.photoAlbumExample.deletePhoto]

// snippet-start:[s3.JavaScript.photoAlbumExample.deleteAlbum]
function deleteAlbum(albumName) {
  // s3=setupName(albumBucketName, bucketRegion, IdentityPoolId);
  var albumKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumKey }, function(err, data) {
    if (err) {
      return alert("There was an error deleting your album: ", err.message);
    }
    var objects = data.Contents.map(function(object) {
      return { Key: object.Key };
    });
    s3.deleteObjects(
      {
        Delete: { Objects: objects, Quiet: true }
      },
      function(err, data) {
        if (err) {
          return alert("There was an error deleting your album: ", err.message);
        }
        alert("Successfully deleted album.");
        listAlbums();
      }
    );
  });
}
// snippet-end:[s3.JavaScript.photoAlbumExample.deleteAlbum]
// snippet-end:[s3.JavaScript.photoAlbumExample.complete]