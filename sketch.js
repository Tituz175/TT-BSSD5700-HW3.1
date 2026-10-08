/*
 * Lesson 3.1 Homework: drawKeyPoints modified as in class (eyes, and a mouth
 * placed with the eye-to-nose distance), plus a head circle at the nose and a
 * mouth height based on the mic volume (p5 "Sound: Mic Threshold" example).
 */

let video;
let bodyPose;
let poses = [];
let connections;
let mic;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();

  // Create an Audio input (Mic Threshold example)
  mic = new p5.AudioIn();
  mic.start();
}

// the browser only allows the mic after a click, so click the canvas once
function mousePressed() {
  userStartAudio();
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);
  //drawSkeleton();
  drawKeyPoints();
}

function drawKeyPoints() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    //draw a head circle at the nose that covers the whole head
    let headNose = pose.keypoints[0];
    let headEyeY = pose.keypoints[2].y;
    fill(255);
    noStroke();
    circle(headNose.x, headNose.y, (headNose.y - headEyeY) * 7);

    fill(255, 0, 0);
    noStroke();
    let keypoint;

    //draw eyes
    keypoint = pose.keypoints[1];
    ellipse(keypoint.x, keypoint.y, 10, 15);

    keypoint = pose.keypoints[2];
    ellipse(keypoint.x, keypoint.y, 10, 15);

    //save eye y
    let eyeY = keypoint.y;

    //get nose
    keypoint = pose.keypoints[0];
    //distance from eyes to nose
    let distEN = keypoint.y - eyeY;

    //Homework 2: mouth height based on the mic volume
    // Get the overall volume (between 0 and 1.0)
    let volume = mic.getLevel();
    // talking is quiet, so 0 to 0.1 is mapped instead of 0 to 1
    let mouthH = map(volume, 0, 0.1, 10, 60);

    //draw mouth
    ellipse(keypoint.x, keypoint.y + distEN, 50, mouthH);
  }
}

function drawSkeleton() {
  // Draw the skeleton connections
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];
      // Only draw a line if both points are confident enough
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }

  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is bigger than 0.1
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 10);
      }
    }
  }
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
