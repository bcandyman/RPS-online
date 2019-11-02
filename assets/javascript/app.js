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
var opponentName = ""
var opponentNum = ""
var gameRoomId = ""
var playerName = ""
var gameRoomRefPath = ""
var P1Pick = "none"
var P2Pick = "none"
var isFlyOutActive = false; //tracks status of flyout
var wins = 0
var losses = 0



var P1Name = ""
var P2Name = ""



function flyout(){
    // event.stopPropagation()
    if(!isFlyOutActive){
        var flyoutDiv = $("<div>")
        flyoutDiv.attr("id","flyoutName")
        flyoutDiv.addClass("flyout")
        flyoutDiv.html($("<H3>").text("Please enter your name"))
        flyoutDiv.append($("<hr />"))
        flyoutDiv.append('<input type="text" id = "inputName" class="form-control mb-2" placeholder="First name">')
        flyoutDiv.append('<button type="button" class="btn btn-primary themeColor2" id="submitName">Lets Go!</button>')
        $(".container").append(flyoutDiv)
        isFlyOutActive = true;
    }
    else{
        closeFlyout()
    }
}



//Closes flyout
function closeFlyout(){
    if (isFlyOutActive){
        $("#flyoutName").remove()
        isFlyOutActive = false;
    }
}



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
            P1Chat: "",
            P2Name: "",
            P2IsActive: "false",
            P2Selection: "none",
            P2Chat: ""
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


//checks if both players have made their selection
//this returns true or false, true means both players have made a selection
function bothPlayersHavePicked(){
    if (P1Pick === "none" || P2Pick === "none"){
        return false
    }
    else{
        return true
    }
}


//this function prints a players message to the database
//this function will be triggered upon either players send message click.
//str is the message to be displayed. 
function updateChatWindow(str){
    $("#chatWindow").prepend( str + "\n" )
}






//this is fired upon page load and looks on the database for an empty slot in a game room.
database.ref().once('value', function(snapshot) {
    findRoom(snapshot)
});

//used to capture player's name upon entry
flyout()






//triggered when a player makes a rock, paper or scissor selection.
$(".btn-userSelection").on("click", function(){
    var buttonVal = $(this).attr("value")
    $("#playerImg").attr("src", "assets/images/playerHand" + buttonVal + ".png")

    database.ref(gameRoomId).update({["P" + playerNum + "Selection"]: buttonVal})
})


//used to accept player name when flyout is active
$(document).on("click", "#submitName", function(){
    
    playerName = $("#inputName").val()
    //check if player input text as a name
    if (playerName.trim().length !== 0){
        gameRoomRefPath.update({
            ["P" + playerNum + "Name"]: playerName,
            ["P" + playerNum + "Chat"]: "player joined",
        })
        $("button").removeAttr("disabled","")
        $("#chatText").removeAttr("disabled","")
        chatText
        closeFlyout()
    }
})


//Chat submit button
$("#chatSubmit").on("click",function(){
    var chatText = $("#chatText").val()
    console.log(chatText)
    database.ref(gameRoomId).update({["P" + playerNum + "Chat"]: chatText})
    $("#chatText").val("")
})




//Wait 2 seconds to allow gameRoomId to be set before setting on disconnect
setTimeout(() => {

    //On disconnect, will deactivate player in database.
    //On disconnect, will display disconnect message in chat window.
    database.ref(gameRoomId).onDisconnect().update({
        ["P" + playerNum + "IsActive"]: "false",
        ["P" + playerNum + "Name"]: "",
        P1Chat:"player disconnected",
        P2Chat:"player disconnected",
    })


    //these monitor changes in players' selection
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


    //monitors if either player has sent a new message within the chat window
    database.ref(gameRoomId + "/P1Chat").on("value",function(snapshot){
        P1Chat=snapshot.val()
        updateChatWindow(P1Name + ": " + P1Chat)
    })

    database.ref(gameRoomId + "/P2Chat").on("value",function(snapshot){
        P2Chat=snapshot.val()
        updateChatWindow(P2Name + ": " + P2Chat)
    })


    //monitors a name change in the database.
    //This is only triggered if a new player enters the game room.
    database.ref(gameRoomId + "/P1Name").on("value",function(snapshot){
        P1Name=snapshot.val()
        console.log(P1Name)
    })

    database.ref(gameRoomId + "/P2Name").on("value",function(snapshot){
        P2Name=snapshot.val()
        console.log(P2Name)
    })
}, 2000);



// $(".btn-userSelection").attr("disabled","")
// $(".btn-userSelection").removeAttr("disabled","")


































//Way huge function I have not idea how to make smaller...

function testResult (snapshot){
    console.log(playerNum)
    if (playerNum === 1){
        if (P1Pick === "Rock"){
            if (P2Pick === "Rock"){
                console.log("draw")
            }
            else if (P2Pick === "Paper"){
                console.log("lose")
                losses++
            }
            else if (P2Pick === "Scissors"){
                console.log("win")
                wins++
            }
        }
        else if (P1Pick === "Paper"){
            if (P2Pick === "Rock"){
                console.log("win")
                wins++
            }
            else if (P2Pick === "Paper"){
                console.log("draw")
            }
            else if (P2Pick === "Scissors"){
                console.log("lose")
                losses++
            }
        }
        else if (P1Pick === "Scissors"){
            if (P2Pick === "Rock"){
                console.log("lose")
                losses++
            }
            else if (P2Pick === "Paper"){
                console.log("win")
                wins++
            }
            else if (P2Pick === "Scissors"){
                console.log("draw")
            }
        }
    }

    else if (playerNum === 2){
        if (P2Pick === "Rock"){
            if (P1Pick === "Rock"){
                console.log("draw")
            }
            else if (P1Pick === "Paper"){
                console.log("lose")
                losses++
            }
            else if (P1Pick === "Scissors"){
                console.log("win")
                wins++
            }
        }
        else if (P2Pick === "Paper"){
            if (P1Pick === "Rock"){
                console.log("win")
                wins++
            }
            else if (P1Pick === "Paper"){
                console.log("draw")
            }
            else if (P1Pick === "Scissors"){
                console.log("lose")
                losses++
            }
        }
        else if (P2Pick === "Scissors"){
            if (P1Pick === "Rock"){
                console.log("lose")
                losses++
            }
            else if (P1Pick === "Paper"){
                console.log("win")
                wins++
            }
            else if (P1Pick === "Scissors"){
                console.log("draw")
            }
        }
    }


    //Displays opponent's pick only if both users have made their selection
    if (bothPlayersHavePicked()){
        if (playerNum === 1) {
            $("#opponentImg").attr("src", "assets/images/opponentHand" + P2Pick + ".png")
        }
        else{
            $("#opponentImg").attr("src", "assets/images/opponentHand" + P1Pick + ".png")
        }

        $("#wins").text(wins)
        $("#losses").text(losses)
        setTimeout(() => {
            database.ref(gameRoomRefPath).update({
                P1Selection: "none",
                P2Selection: "none",
            })
            $("#playerImg").attr("src","assets/images/blank.png")
            $("#opponentImg").attr("src","assets/images/blank.png")
        }, 3000);
    }
    console.log ("P1Pick: " + P1Pick)
    console.log("P2Pick: " + P2Pick)
}