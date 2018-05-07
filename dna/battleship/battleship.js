'use strict';

var me = App.Key.Hash;

////////////////////// public zome functions

function newInvitation(data) {
  var board = data.board;
  var invitee = data.invitee;

  var boardHash = commitPrivateBoard(board);

  // commit the game with the local hash of the board
  var inviteHash = commit("invitation", {
    creator: me,
    creatorBoardHash: boardHash,
    invitee: invitee
  });

  debug(inviteHash);
  debug(get(inviteHash));

  // link to both players
  commit("inviteLinks", { 
    Links: [ { Base: me, Link: inviteHash, Tag: "inviter" },
             { Base: invitee, Link: inviteHash, Tag: "invitee" } ] 
  });

  return inviteHash;
}


function acceptInvitation(data) {
  var inviteHash = data.inviteHash;
  var board = data.board;

  debug(inviteHash);
  var invite = get(inviteHash);
  debug(invite);

  var boardHash = commitPrivateBoard(board);
  invite.inviteeBoardHash = boardHash;

  // update the game to include the new player
  var gameHash = commit("game", invite);
  return gameHash;
}


function makeGuess(data) {
  var gameHash = data.gameHash;
  var guess = data.guess;

  var game = get(gameHash);

  // commit the guess to the global dht. This will trigger the validation
  var guessHash = commit("guess", data);

  commit("guessLinks", { 
    Links: [ { Base: gameHash, Link: guessHash, Tag: me } ] 
  });

  // message the other user to get the response to the guess
  // send(game);

  return guessHash;
}

/////////////////////// Local Functions

function generateSalt() {
  var salt = "" + Math.random() + "" + Math.random();
  return salt;
}

function commitPrivateBoard(board) {
  // commit the board to the local chain. 
  // This may fail if the board is not valid
  board.salt = generateSalt();
  var boardHash = commit("privateBoard", board);
  return boardHash;
}


/////////////////////// Message Callbacks

function receive(from, message) {
  var type = msg.type;
  if (type=="ping") {
    return App.Agent.Hash
  }
  return "unknown type"
}


/////////////////////// Validation Callbacks

function genesis() {
  return true;
}

function validateCommit (entryName, entry, header, pkg, sources) {
  return true;
  // switch (entryName) {
  //   case "game":
  //     return true;
  //   case "privateBoard":
  //     return true;
  //   case "publicBoard":
  //     return true;
  //   case "guess":
  //     return true;
  //   case "invitation":
  //     return true;
  //   case "result":
  //     return true;
  //   case "gameLinks": // these are called when links are added to the local chain
  //   case "guessLinks":
  //   case "inviteLinks":
  //   case "resultLinks":
  //     return validateLink(entryName, entry, header, pkg, sources);
  //   default:
  //     return false;
  // }
}

function validatePut (entryName, entry, header, pkg, sources) {
  return true;
  // validateCommit(entryName, entry, header, pkg, sources);
}

function validateMod (entryName, entry, header, replaces, pkg, sources) {
  return false; // no modifications allowed
}

function validateDel (entryName, hash, pkg, sources) {
  return false; // no deletions are allowed
}

function validateLink(linkEntryType,baseHash,links,pkg,sources) {
  return true;
}

function validatePutPkg (entryName) {
  return null;
}

function validateModPkg (entryName) {
  return null;
}

function validateDelPkg (entryName) {
  return null;
}

function validateLinkPkg (entryName) {
  return null;
}