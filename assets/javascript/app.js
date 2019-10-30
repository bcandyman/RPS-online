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

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var playerNum = ""
var gameRoomId = ""
var playerName = "Jose"
var gameRoomRefPath = ""


function findRoom(snapshot){

    //var i keeps track of next room number to be created if a room with an open slot is not found
    var i = 0

    //loop through each available room
    console.log("ID1: " + gameRoomId)
    snapshot.forEach(function(roomSnapshot) {
        
        var P1IsActive = roomSnapshot.child("P1IsActive").val()
        var P2IsActive = roomSnapshot.child("P2IsActive").val()

        //If a room has not yet been found
        if (gameRoomId === ""){
            
            i++

            // If there is NOT a player1 in room
            if (P1IsActive === "false"){
                gameRoomId = roomSnapshot.key
                gameRoomRefPath = database.ref(gameRoomId)
                playerNum = 1
            }

            //If there is NOT a player2 in room
            else if (P2IsActive === "false"){
                gameRoomId = roomSnapshot.key
                gameRoomRefPath = database.ref(gameRoomId)
                playerNum = 2
            }
            
        }
    })


    // if an open room was not found, create a new one
    if (gameRoomId === ""){
        i++
        gameRoomRefPath = database.ref("Room" + i)
        gameRoomId = "Room" + i
        console.log("Must create a room")
        database.ref(gameRoomRefPath).set({
            P1Name: "",
            P1IsActive: "false",
            P2Name: "",
            P2IsActive: "false"
        })
        playerNum = 1
    }


    //set database parameters
    gameRoomRefPath.update({
        ["P" + playerNum + "IsActive"]: "true",
        ["P" + playerNum + "Name"]: playerName,
        ["P" + playerNum + "Selection"]: "none"
    })
}



database.ref().once('value', function(snapshot) {
    findRoom(snapshot)
});





    //Wait 2 seconds to allow gameRoomId to be set before setting on disconnect
    setTimeout(() => {
        database.ref(gameRoomId).onDisconnect().update({
            ["P" + playerNum + "IsActive"]: "false",
            ["P" + playerNum + "Name"]: ""
        })
    }, 2000);


