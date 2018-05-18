'use strict';

var me = App.Key.Hash;

var BOARD_SIZE = 10;
var PIECE_SIZES = [5,4,3,3,2];



/*=============================================
=            public zome functions            =
=============================================*/

function newInvitation(data) {
  var board = data.board;
  var invitee = data.invitee;

  var boardHash = commitPrivateBoard(board);

  // commit the game with the local hash of the board

  var invitation = {
    creator: me,
    creatorBoardHash: boardHash,
    invitee: invitee
  };

  var inviteHash = commit("invitation", invitation);

  // link to both players
  commit("inviteLinks", { 
    Links: [ { Base: me, Link: inviteHash, Tag: "creator" },
             { Base: me, Link: inviteHash, Tag: "invitee" } ]
  });

  return inviteHash;
}


function acceptInvitation(data) {
  var inviteHash = data.inviteHash;
  var board = data.board;

  var game = get(inviteHash);

  var boardHash = commitPrivateBoard(board);
  game.inviteeBoardHash = boardHash;

  var gameHash = commit("game", game);

    // link to both players
  commit("gameLinks", { 
    Links: [ { Base: game.invitee, Link: gameHash, Tag: "game" },
             { Base: game.creator, Link: gameHash, Tag: "game" } ] 
  });

  return gameHash;
}

function getOtherPlayer(game) {
  if(game.creator === me) {
    return game.invitee;
  } else if (game.invitee === me) {
    return game.creator;
  } else {
    throw "Node is not a player in this game";
  }
}


function makeGuess(data) {
  var gameHash = data.gameHash;
  var guess = data.guess;
  guess.playerHash = me;
  guess.gameHash = gameHash;

  // commit the guess to the global dht. This will trigger the validation
  var guessHash = commit("guess", guess);

  commit("guessLinks", { 
    Links: [ { Base: gameHash, Link: guessHash, Tag: me } ] 
  });

  // message the guess hash to the other player
  // they will post a response if it is valid
  var game = get(gameHash);
  send(getOtherPlayer(game), {guessHash: guessHash});

  return guessHash;

}

function getSentInvitations(playerHash) {
  return getLinks(playerHash, "creator", { Load: true });
}

function getReceivedInvitations(playerHash) {
  return getLinks(playerHash, "invitee", { Load: true });
}

function getCurrentGames(playerHash) {
  return getLinks(playerHash, "game", { Load: true });
}


/*=====  End of public zome functions  ======*/

/*============================================
=            local zome functions            =
============================================*/

function generateSalt() {
  // this is not a true random generator but ok for a game
  // return "" + Math.random() + "" + Math.random();
  return "000" // use this for testing to make it deterministic
}

function commitPrivateBoard(board) {
  // commit the board to the local chain. 
  // This may fail if the board is not valid
  board.salt = generateSalt();
  var boardHash = commit("privateBoard", board);
  return boardHash;
}


function hasCorrectNumberOfPieces(board) {
  return board.pieces.len === PIECE_SIZES.len;
}


function piecesInBounds(board) {
  // 'every' returns the logical AND of the function evaluated on each array element
  return board.pieces.every(function(piece, i) {
    if (piece.orientation === "h") {
      return piece.x >= 0 && piece.x + PIECE_SIZES[i] - 1 < BOARD_SIZE && piece.y >= 0 && piece.y < BOARD_SIZE
    } else {
      return piece.x >= 0 && piece.x < BOARD_SIZE && piece.y >= 0 && piece.y + PIECE_SIZES[i] - 1 < BOARD_SIZE
    }
  });
}


function noPiecesOverlapping(board) {
  return true;
}

function boardIsValid(board) {
  return hasCorrectNumberOfPieces(board) 
    && piecesInBounds(board) 
    && noPiecesOverlapping(board);
}

function evaluateGuess(board, guess) {
  // return if a guess is a hit (true) or miss (false) on this board
  // 'some' returns the logical OR of the function evaluated on each array element
  return board.pieces.some(function(piece, i) {
    
  });
}

function getGuesses(gameHash) {
  return getLinks(gameHash, "", { Load : true });
}

function isPlayersTurn(gameHash, playerHash) {
  // for it to be a players turn the most recent guess must not belong to this player
  var guesses = getGuesses(gameHash);

  if (guesses.length === 0) {
    // this is the first guess of the game
    // the invitee gets the first guess
    game = get(gameHash);
    return playerHash === game.invitee;
  }

  var lastGuess = guesses[guesses.length - 1].Entry;
  return lastGuess.playerHash !== playerHash; // this prevents a node playing with themselves
}

function guessWithinBounds(guess) {
  return guess.x > 0 && guess.x < BOARD_SIZE
    && guess.y > 0 && guess.y < BOARD_SIZE;
}

function guessIsValid(guess) {
  return isPlayersTurn(guess.gameHash, guess.playerHash)
    && guessWithinBounds(guess);
}


/*=====  End of local zome functions  ======*/



/*=================================
=            Callbacks            =
=================================*/


function receive(from, message) {
  // receiving a message means a player is requesting response to a guess.
  // If a guess is in the DHT it has already been validated by other nodes so
  // no additional verification is required
  var guessHash = message.guessHash;
  var guess = get(guessHash);
  var game = get(guess.gameHash);

  // next up find which board in the local chain to verify against
  var boardHash;
  if (game.creator === me) {
    boardHash = game.creatorBoardHash;
  } else if (game.invitee == me) {
    boardHash = game.inviteeBoardHash;
  } else {
    throw "Cannot resond to guess";
  }

  var board = get(boardHash, {Local: true});

  return evaluateGuess(board, guess);
}


function genesis() {
  return true;
}


function validateCommit (entryName, entry, header, pkg, sources) {
  return true;
}

function validatePut (entryName, entry, header, pkg, sources) {
  return true;
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

/*=====  End of Callbacks  ======*/

/*==========================================
=            function overrides            =
==========================================*/
// used for creating sequence diagrams
// delete these for production

agentShortname = App.Agent.String.substr(0, App.Agent.String.indexOf('@')); 

var oldCommit = commit;
commit = function(entryType, entryData) {
  if(entryType.indexOf("private") !== -1) {
    debug('<mermaid>' + agentShortname + '-->>' + agentShortname +': '+ entryType + '</mermaid>');
  } else {
    debug('<mermaid>' + agentShortname + '-->>DHT: '+ entryType + '</mermaid>');
  }
  return oldCommit(entryType, entryData);
};

var oldGet = get;
get = function(hash, options) {
  result = oldGet(hash, options);
  debug('<mermaid>' + 'DHT-->>' + agentShortname + ': '+ hash + '</mermaid>');
  return result;
};

var oldSend = send;
send = function(to, message, options) {
  debug('<mermaid>' + agentShortname + '-->>' + to + ': '+ message + '</mermaid>');
  return oldSend(to, message, options);
}

/*=====  End of function overrides  ======*/
