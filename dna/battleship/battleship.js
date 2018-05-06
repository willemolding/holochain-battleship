'use strict';

var me = App.Key.Hash;

////////////////////// public zome functions

function createNewGameRequest(data) {
  var board = data.board;
  var invitee = data.invitee;

  // commit the board to the local chain. 
  // This may fail if the board is not valid
  board.salt = generateSalt();
  var boardHash = commit("privateBoard", board);


  // commit the game with the local hash of the board
  commit("game", {
    "creator": me,
    "creatorBoardHash": boardHash,
    "invitee": ,

  });

  return true;
}

function acceptGameRequest(data) {
  return true;
}

function makeGuess(data) {
  return true;
}

/////////////////////// Local Functions

function generateSalt() {
  var salt = "" + Math.random() + "" + Math.random();
  return salt;
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
  switch (entryName) {
    case "game":
      return true;
    case "privateBoard":
      return true;
    case "publicBoard":
      return true;
    case "guess":
      return true;
    case "gameLinks": // these are called when links are added to the local chain
    case "guessLinks":
      return validateLink(entryName, entry, header, pkg, sources);
    default:
      return false;
  }
}

function validatePut (entryName, entry, header, pkg, sources) {
  validateCommit(entryName, entry, header, pkg, sources);
}

function validateMod (entryName, entry, header, replaces, pkg, sources) {
  switch (entryName) {
    case "game":
      return true;
    default:
      return false;
  }
}

function validateDel (entryName, hash, pkg, sources) {
  return false; // no deletions are allowed
}

function validateLink(linkEntryType,baseHash,links,pkg,sources) {
  switch (entryName) {
    case "gameLinks":
      return true;
    case "guessLinks":
      return true;
    default:
      return false;
  }
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