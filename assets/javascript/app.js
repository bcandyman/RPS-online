
  var firebaseConfig = {
    apiKey: "AIzaSyCGO6D3n580DOHUx3ytbZ0UJOK-tOSpSAU",
    authDomain: "click-counter01-8462f.firebaseapp.com",
    databaseURL: "https://click-counter01-8462f.firebaseio.com",
    projectId: "click-counter01-8462f",
    storageBucket: "click-counter01-8462f.appspot.com",
    messagingSenderId: "161936918055",
    appId: "1:161936918055:web:3e9aa1acde66ce0a9d3002",
    measurementId: "G-V3NQGHS0YR"
};
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();


database.ref().on("child_added", function(snapshot) {
    var databaseData = snapshot.val()
})



