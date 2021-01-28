// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-west-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '<identity pool id>',
});

// S3 details
const BUCKET_NAME = '<bucket name>';
const UPLOAD_FOLDER = 'images'

const selectBorderMessageDiv = document.getElementById("selectBorderMessageDiv");
const submitMessageDiv = document.getElementById("submitMessageDiv");
const frozen2Border = "images/540x360-frozen-border.png";
const myLittleLaurenBorder = "images/lauren-3rd-bday-540x360-border.png";
const lambda = new AWS.Lambda();

let selectedBorder = "";
let borderFilename = "";

function uploadPhoto() {
  let files = document.getElementById("photoupload").files;
    
  if (!files.length || selectedBorder === "") {
    submitMessageDiv.innerHTML = "Please select a border and upload a photo then click submit";
    submitMessageDiv.className = "alert alert-danger";
    return;
  }

  let file = files[0];
  let folder = encodeURIComponent(UPLOAD_FOLDER) + "/";
  let photoKey = folder + file.name;
  
  console.log(photoKey);

  // Use S3 ManagedUpload class as it supports multipart uploads
  let upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: BUCKET_NAME,
      Key: photoKey,
      Body: file,
      ACL: "public-read"
    }
  });

  let promise = upload.promise();
  
  promise.then(
    function(data) {
      submitMessageDiv.innerHTML = "Successfully uploaded photo";
      submitMessageDiv.className = "alert alert-success";
    },
    function(err) {
      submitMessageDiv.innerHTML = "There was an error uploading your photo: " + err.message;
      submitMessageDiv.className = "alert alert-danger";
    }
  )
  .then(
    function(data) {
      lambda.invoke({
        FunctionName: 'pictureProcessor',
        Payload: JSON.stringify({
          "inputImage": photoKey,
          "borderImage": borderFilename
        })
      },
      function(err, data) {
        if(err) {
          submitMessageDiv.innerHTML = "There was an error processing the photo: " + err.message;
          submitMessageDiv.className = "alert alert-danger";
        }
        else {
          submitMessageDiv.innerHTML = "Successfully processed photo";
          submitMessageDiv.className = "alert alert-success";
        }    
      });
    }
  );
}

function getBorderFilename(borderName) {
  if(borderName === 'Frozen 2') {
    borderFilename = frozen2Border;
  }
  else if (borderName === 'My Little Lauren') {
    borderFilename = myLittleLaurenBorder
  }
}

// function runPictureProcessorLambda() {
//   // TODO:
//   alert("TODO: create runPictureProcessorLambda()");
// }

let form = document.getElementById("pictureProcessorForm");

form.addEventListener("submit", function(evt) {
  evt.preventDefault();
  uploadPhoto();
  submitMessageDiv.style = "display:block";
  //runPictureProcessorLambda();
});

//let selectBorderButton = document.getElementById("selectBorderButton");

// selectBorderButton.addEventListener("click", function() {
//   selectedBorder = selectBorderButton.dataset.name;
//   selectBorderMessageDiv.innerHTML = `${selectedBorder} border selected`;
// });

const borderButtonClick = function () {
  selectedBorder = this.dataset.name;
  getBorderFilename(selectedBorder);
  selectBorderMessageDiv.innerHTML = `${selectedBorder} border selected`;
};

document.querySelectorAll(".borderButton").forEach(btn => btn.addEventListener('click', borderButtonClick));
