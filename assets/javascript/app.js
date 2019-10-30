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
var opponentNum = ""
var gameRoomId = ""
var playerName = "Jose"
var gameRoomRefPath = ""
var P1Pick = "none"
var P2Pick = "none"


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
                opponentNum = 2
                playerNum = 1
            }

            //If there is NOT a player2 in room
            else if (P2IsActive === "false"){
                gameRoomId = roomSnapshot.key
                gameRoomRefPath = database.ref(gameRoomId)
                opponentNum = 1
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
            P1Selection: "none",
            P2Name: "",
            P2IsActive: "false",
            P2Selection: "none"
        })
        playerNum = 1
        opponentNum = 2
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


$(".btn").on("click", function(){

    var buttonVal = $(this).attr("value")
    $("#playerImg").attr("src", "assets/images/playerHand" + buttonVal + ".png")

    database.ref(gameRoomId).update({["P" + playerNum + "Selection"]: buttonVal})
})


function bothPlayersHavePicked(){
    if (P1Pick === "none" || P2Pick === "none"){
        return false
    }
    else{
        return true
    }
}



    //Wait 2 seconds to allow gameRoomId to be set before setting on disconnect
    setTimeout(() => {
        database.ref(gameRoomId).onDisconnect().update({
            ["P" + playerNum + "IsActive"]: "false",
            ["P" + playerNum + "Name"]: ""
        })

        database.ref(gameRoomId + "/P1Selection").on("value",function(snapshot){
            P1Pick=snapshot.val()

            console.log("Changed")
            testResult(snapshot)
        })

        database.ref(gameRoomId + "/P2Selection").on("value",function(snapshot){
            P2Pick=snapshot.val()

            console.log("Changed")
            testResult(snapshot)
        })
    }, 2000);


function testResult (snapshot){
    // var P1Pick = database.ref(gameRoomId + "/P1Selection").get()
    console.log(playerNum)
    if (playerNum === 1){
        if (P1Pick === "rock"){
            if (P2Pick === "rock"){
                console.log("draw")
            }
            else if (P2Pick === "paper"){
                console.log("lose")
            }
            else if (P2Pick === "scissors"){
                console.log("win")
            }
        }
        else if (P1Pick === "paper"){
            if (P2Pick === "rock"){
                console.log("win")
            }
            else if (P2Pick === "paper"){
                console.log("draw")
            }
            else if (P2Pick === "scissors"){
                console.log("lose")
            }
        }
        else if (P1Pick === "scissors"){
            if (P2Pick === "rock"){
                console.log("lose")
            }
            else if (P2Pick === "paper"){
                console.log("win")
            }
            else if (P2Pick === "scissors"){
                console.log("draw")
            }
        }
    }
    // }

    else if (playerNum === 2){
        if (P2Pick === "rock"){
            if (P1Pick === "rock"){
                console.log("draw")
            }
            else if (P1Pick === "paper"){
                console.log("lose")
            }
            else if (P1Pick === "scissors"){
                console.log("win")
            }
        }
        else if (P2Pick === "paper"){
            if (P1Pick === "rock"){
                console.log("win")
            }
            else if (P1Pick === "paper"){
                console.log("draw")
            }
            else if (P1Pick === "scissors"){
                console.log("lose")
            }
        }
        else if (P2Pick === "scissors"){
            if (P1Pick === "rock"){
                console.log("lose")
            }
            else if (P1Pick === "paper"){
                console.log("win")
            }
            else if (P1Pick === "scissors"){
                console.log("draw")
            }
        }
    }

    if (bothPlayersHavePicked()){
        if (playerNum === 1) {
            $("#opponentImg").attr("src", "assets/images/opponentHand" + P2Pick + ".png")
        }
        else{
            $("#opponentImg").attr("src", "assets/images/opponentHand" + P1Pick + ".png")
        }
    }
    console.log ("P1Pick: " + P1Pick)
    console.log("P2Pick: " + P2Pick)
}