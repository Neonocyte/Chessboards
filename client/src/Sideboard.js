import { useRef } from 'react';
import { useEffect, useState } from 'react';
import './Sideboard.css';
import bootstrap from 'bootstrap';

//Chess piece images
import PawnW from './images/Pawn_White.svg'
import PawnB from './images/Pawn_Black.svg'
import KnightW from './images/Knight_White.svg'
import KnightB from './images/Knight_Black.svg'
import BishopW from './images/Bishop_White.svg'
import BishopB from './images/Bishop_Black.svg'
import RookW from './images/Rook_White.svg'
import RookB from './images/Rook_Black.svg'
import QueenW from './images/Queen_White.svg'
import QueenB from './images/Queen_Black.svg'
import KingW from './images/King_White.svg'
import KingB from './images/King_Black.svg'
import HelpUI from './images/ChessHelpUI.png'

const Pieces = {
	X:	0,	//no piece
	P:	1,	//pawn
	N:	2,	//knight
	B:	3,	//bishop
	R:	4,	//rook
	Q:	5,	//queen
	K:	6	//king
};

const Colors = {
	W:	0,	//white
	B:	1	//black
};

class ChessPiece{
	constructor(type, color, hasMoved = false){
		//type is a Pieces value (e.g. P, N, B, etc.), color is a Colors value (W or B)
		this.type = type;
		this.color = color;
		this.hasMoved = hasMoved;
	}
}

const SideboardApp = (props) => {
	//TODO: pass the refs via prop to Sideboard
	
	const renderHeader = () => {
		return(
			<div class="container-fluid py-2 my-4 ps-5 bg-light border-bottom border-primary text-start"><h1 class="fw-bolder">Mirage Chess</h1></div>
		);
	}
	
	const renderInfo = () => {
		return(
			<div className="SideboardInfo px-5" style={{display: showInfo ? "block" : "none"}}>
				<div className="container">
					<h3 className="text-center fw-bold">Welcome to Mirage Chess</h3>
					<p>
						Plan out your next moves by comparing them side by side. Mirage Chess allows you to create clones of your chessboard to help you decide which moves you like best.
					</p>
					<img src={HelpUI} className="img-fluid" alt="Mirage Chess help diagram" />
					<p className="text-start">
						<ol>
							<li><b>The Chess Board</b>: Clicking on a square will select it (highlighted in yellow). If a piece is selected, legal moves will be highlighted in green. Clicking on a green square will move the selected piece.</li>
							<li><b>Board Functions:</b>
								<ul>
									<li><b>Clone:</b> Create a new copy of the board.</li>
									<li><b>Reset:</b> Restores the board to the setup it was originally created</li>
									<li><b>Delete:</b> Removes the board permanently</li>
								</ul>
							</li>
							<li><b>Chess Piece Functions:</b>
								<ul>
									<li><b>Undo:</b> Restores the last moved piece to its previous position</li>
									<li><b>Redo:</b> Repeats a move that was previously undone</li>
								</ul>
							</li>
							<li><b>New Board Button:</b> Creates a new chess board set up at the start of a new game.</li>
							<li><b>Save Board Button:</b> Saves all boards and produces a link to the saved setup. Copy the link to return to your setup or share it with others.</li>
							<li><b>Help Button:</b> Show this help screen again. Your boards will be restored after closing the help screen.</li>
						</ol>
					</p>
					<button className="btn btn-info" type="button" onClick={() => onInfoClose()}>{hasInit.current ? "Resume" : "Start"}</button>
				</div>
			</div>
		);
	}
	
	const renderSideboards = () => {
		//TODO: render all boards
		
		if(chessboards.length > 0){
			return(
				chessboards.map((boardState, index) => {
					return <Sideboard key={keys[index]} images={chessImages} startingTurn={startingTurns[index]} startingBoard={boardState} startingKings={startingKings[index]} onClone={(boardState, turn, kings) => createNewBoard(boardState, turn, kings)} onDelete={() => deleteBoard(index)} onUpdate={(board, turn, kings) => onMessageReceived(index, board, turn, kings)}/>
				})
			);
		}else{
			return;
		}
	}
	
	const renderSaveText = (id) => {
		if (id != ""){
			return(
				<p class="text-primary"><b>Boards saved to miragechess.com/boards/{id}</b></p>
			);
		}
		
		return;
	}
	
	const renderNewButton = (props) => {
		return(
			<NewButton onClick={() => createBlankBoard()} />
		);
	}
	
	const renderSaveButton = (props) => {
		return(
			<SaveButton onClick={() => saveBoards()} />
		);
	}
	
	const onInfoClose = () => {
		setInfo(false);
		
		//Only load boards on first close - if drawn before, canvas will be blurry
		if (hasInit.current === false){
			if(props.board_json !== "" && props.board_json !== undefined){
				initFromJSON();
			}else{
				createBlankBoard();
			}
			
			hasInit.current = true;
		}
		
		return;
	}
	
	const initFromJSON = () => {
		const parsedJSON = JSON.parse(props.board_json);
		const newBoards = [...parsedJSON.boards], newTurns = [...parsedJSON.turns], newKings = [...parsedJSON.kings], newKeys = [...Array(parsedJSON.boards.length).keys()];
		keyCount.current = parsedJSON.boards.length;
		
		setChessboards(newBoards);
		setTurns(newTurns);
		setKeys(newKeys);
		setKings(newKings);
		
		messages.current = newBoards;
		turnMessages.current = newTurns;
		kingMessages.current = newKings;
	}
	
	const createBlankBoard = () => {
		const newBoards = [...chessboards], newTurns = [...startingTurns], newKeys = [...keys], newKings = [...startingKings];
		
		newBoards.push([
			[new ChessPiece(Pieces.R, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.R, Colors.B)],
			[new ChessPiece(Pieces.N, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.N, Colors.B)],
			[new ChessPiece(Pieces.B, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.B, Colors.B)],
			[new ChessPiece(Pieces.Q, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.Q, Colors.B)],
			[new ChessPiece(Pieces.K, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.K, Colors.B)],
			[new ChessPiece(Pieces.B, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.B, Colors.B)],
			[new ChessPiece(Pieces.N, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.N, Colors.B)],
			[new ChessPiece(Pieces.R, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.R, Colors.B)]
		]);
		newTurns.push(Colors.W);
		newKings.push([[4, 0], [4, 7]]);
		keyCount.current++;
		newKeys.push(keyCount.current);
		setChessboards(newBoards);
		setTurns(newTurns);
		setKeys(newKeys);
		setKings(newKings);
		messages.current.push(newBoards[newBoards.length - 1]);
		turnMessages.current.push(newTurns[newTurns.length - 1]);
		kingMessages.current.push(newKings[newKings.length - 1]);

	}
	
	const saveBoards = () => {
		if(messages.current.length !== 0){
			let http = new XMLHttpRequest();//,params = '{ "boards":[' + stringifyBoard(messages.current[0]);
			//Format and parse boards to send as JSON
			/*for(let i = 1; i < messages.current.length; i++){
				params += "," + messages.current[i];
			}
			params += '] }';*/
			let params = '{ "boards":' + JSON.stringify(messages.current) + ',"turns":' + JSON.stringify(turnMessages.current) + ',"kings":' + JSON.stringify(kingMessages.current) + '}';
			http.onreadystatechange = function() {
				if(http.readyState == XMLHttpRequest.DONE && http.status == 200){
					setSaveID(http.responseText);
				}
			}
			//edit route (2nd arg) to whatever is desired
			http.open("POST", "/node/save", true);
			http.setRequestHeader("Content-type", "application/json");
			http.send(params);
		}
	}
	
	const stringifyBoard = (board) => {
		//TODO: Not needed - delete
		//converts a board array into a JSON ready string
		if(board.length <= 0){
			return '';
		}else if(board[0].length < 0){
			return '';
		}
		
		var boardString = '[';
		
		for(let i = 0; i < board.length; i++){
			if(i !== 0){
				boardString += ',';
			}
			boardString += '['
			for(let j = 0; j < board[i].length; j++){
				if(j !== 0){
					boardString += ',';
				}
				
				if(board[i][j] === 0){
					boardString += '0';
				}else{
					boardString += JSON.stringify(board[i][j]);
				}
			}
			boardString += ']';
		}
		
		boardString += ']';
		
		return boardString;
	}
	
	const createNewBoard = (boardState, turn, kings) => {
		const boardCopy = [], newBoards = [...chessboards], newTurns = [...startingTurns], newKeys = [...keys], newKings = [...startingKings];
		
		
		for(let i = 0; i < boardState.length; i++){
			boardCopy[i] = [];
			for(let j = 0; j < boardState[i].length; j++){
				if(boardState[i][j] === 0){
					boardCopy[i][j] = 0;
				}else{
					let originPiece = boardState[i][j];
					
					boardCopy[i][j] = new ChessPiece(originPiece.type, originPiece.color, originPiece.hasMoved);
				}
				
			}
			//boardCopy[i] = boardState[i].slice();
		}
		
		newBoards.push(boardCopy);
		newTurns.push(turn);
		newKings.push(kings);
		keyCount.current++;
		newKeys.push(keyCount.current);
		setChessboards(newBoards);
		setTurns(newTurns);
		setKeys(newKeys);
		setKings(newKings);
		messages.current.push(boardCopy);
		turnMessages.current.push(turn);
		kingMessages.current.push(kings);
		
		return;
	}
	
	const onMessageReceived = (index, board, turn, kings) => {
		messages.current[index] = board;
		turnMessages.current[index] = turn;
		kingMessages.current[index] = kings;
	}
	
	const deleteBoard = (boardIndex) => {
		const newBoards = [...chessboards], newTurns = [...startingTurns], newKeys = [...keys], newKings = [...startingKings];
		
		//TODO: fix this - it always deletes the last board. Might be due to keys being reused; store how many boards have been created and use that key to keep things correct between rerender?
		//Boards reset to the correct state, at least - the current state just gets mixed up.
		//TODO: create a new blank board button, so you can't delete the entire app.
		newBoards.splice(boardIndex, 1);
		newTurns.splice(boardIndex, 1);
		newKeys.splice(boardIndex, 1);
		newKings.splice(boardIndex, 1);
		messages.current.splice(boardIndex, 1);
		turnMessages.current.splice(boardIndex, 1);
		kingMessages.current.splice(boardIndex, 1);
		
		
		setChessboards(newBoards);
		setTurns(newTurns);
		setKeys(newKeys);
		setKings(newKings);
		
		return;
	}
	
	const create2DArray = (a, b) => {
		let arr2D = new Array(a);
		
		for(let i = 0; i < a; i++){
			arr2D[i] = new Array(b);
		}
		
		return arr2D;
	}
	
	let chessImages = create2DArray(6,2);
	
	
	//TODO: merge chessboards, startingTurns, and keys into an array of objects containing them all.
	/*
	let [chessboards, setChessboards] = useState([		//chessboards contains the starting state of every board created
		[
			[new ChessPiece(Pieces.R, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.R, Colors.B)],
			[new ChessPiece(Pieces.N, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.N, Colors.B)],
			[new ChessPiece(Pieces.B, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.B, Colors.B)],
			[new ChessPiece(Pieces.Q, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.Q, Colors.B)],
			[new ChessPiece(Pieces.K, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.K, Colors.B)],
			[new ChessPiece(Pieces.B, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.B, Colors.B)],
			[new ChessPiece(Pieces.N, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.N, Colors.B)],
			[new ChessPiece(Pieces.R, Colors.W), new ChessPiece(Pieces.P, Colors.W), 0, 0, 0, 0, new ChessPiece(Pieces.P, Colors.B), new ChessPiece(Pieces.R, Colors.B)]
		]
	]);
	*/
	let [chessboards, setChessboards] = useState([]);
	
	let [startingTurns, setTurns] = useState([]);
	let keyCount = useRef(0);
	let [keys, setKeys] = useState([keyCount.current]);
	let [startingKings, setKings] = useState([]);
	let [showInfo, setInfo]= useState(true);
	let messages = useRef([]);
	let turnMessages = useRef([]);
	let kingMessages = useRef([]);
	let [saveID, setSaveID] = useState("");
	let hasInit = useRef(false);
	
	
	//Create images for canvases to draw
	for(let i = 0; i < chessImages.length; i++){
		for(let j = 0; j < 2; j++){
			chessImages[i][j] = new Image();
		}
	}
	chessImages[Pieces.P - 1][Colors.W].src = PawnW;
	chessImages[Pieces.P - 1][Colors.B].src = PawnB;
	chessImages[Pieces.N - 1][Colors.W].src = KnightW;
	chessImages[Pieces.N - 1][Colors.B].src = KnightB;
	chessImages[Pieces.B - 1][Colors.W].src = BishopW;
	chessImages[Pieces.B - 1][Colors.B].src = BishopB;
	chessImages[Pieces.R - 1][Colors.W].src = RookW;
	chessImages[Pieces.R - 1][Colors.B].src = RookB;
	chessImages[Pieces.Q - 1][Colors.W].src = QueenW;
	chessImages[Pieces.Q - 1][Colors.B].src = QueenB;
	chessImages[Pieces.K - 1][Colors.W].src = KingW;
	chessImages[Pieces.K - 1][Colors.B].src = KingB;
	
	return(
		<div className="SideboardApp">
			{renderHeader()}
			{renderInfo()}
			<div className="container" style={{display: !showInfo ? "block" : "none"}}>
				<div className="row">
					{renderSideboards()}
				</div>
					<div className="container bg-light">
						{renderNewButton()}
						{renderSaveButton()}
						<button className="btn btn-info" type="button" onClick={() => setInfo(true)}><i className="bi bi-info-circle"></i>Help</button>
						<div>
							{renderSaveText(saveID)}
						</div>
					</div>
			</div>
		</div>
	);

	/*
	<form action="/" method="post" className="form">
		<input type="text" id="test" name="test" />
		<button type="submit">Connected?</button>
	</form>
	*/
}

function Sideboard(props) {
	
	//TODO: get board selection working, import chess piece images via prop to draw
	
	//!TODO: change variables into refs to keep them after render - better than using state if rerender is not needed.
	
	let boardRef = useRef();
	//TODO: make sure these get set properly in functions - perhaps declare them in each necessary function
	//Can't be moved to refs, due to the canvas element being dropped during render
	let canvas, ctx, boardSize = 200, squareSize = boardSize / 8;
	
	
	let selectedSquare = useRef(null);
	let potentialMoves = useRef([]);
	//let [turnState, setTurnState] = useState(props.startingTurn);
	let turn = useRef(props.startingTurn);
	let kings = useRef(clone2dArray(props.startingKings));
	
	
	//Create board and set pieces to correct location
	//Save canvas context for use in drawing board; consider adding a way to switch which canvas is drawn to, such as by making it an argument of drawBoard()
	//Black player is placed on top
	//Access is [column][row], so [0][0] should return a white rook on a new board.
	//!Remember to rotate when drawing to account for the y axis being flipped, and account for the origin being [1][1] in chess notation
	//let [boardState, setBoardState] = useState(clone2dArray(props.startingBoard));
	let boardSpaces = useRef(clone2dArray(props.startingBoard));
	
	let boardHistory = useRef([]), boardFuture = useRef([]);
	
	const onSquareSelect = (event) => {
		//TODO: move to useEffect so that canvas can be made local to useEffect
		let dpi = window.devicePixelRatio || 1;
		dpi /=
			ctx.backingStorePixelRatio ||
			ctx.webkitBackingStorePixelRatio ||
			ctx.mozBackingStorePixelRatio ||
			ctx.msBackingStorePixelRatio ||
			ctx.oBackingStorePixelRatio ||
			//ctx.backingStorePixelRatio ||
			1;
		let canvasBounds = canvas.getBoundingClientRect();
		let canvasX = event.clientX - canvasBounds.left, canvasY = event.clientY - canvasBounds.top;
		let newSelection = [Math.floor(canvasX / squareSize * dpi), 7 - Math.floor(canvasY / squareSize * dpi)];
		boardSize = canvas.width;
		squareSize = boardSize / 8;
		
		
		if(findMatchingArray(potentialMoves.current, newSelection) >= 0){
			//A square has been selected from the potential moves; move piece accordingly
			//TODO: track removed pieces?
			let selectedPiece = boardSpaces.current[selectedSquare.current[0]][selectedSquare.current[1]];
			
			boardHistory.current.push(clone2dArray(boardSpaces.current));
			
			boardSpaces.current[newSelection[0]][newSelection[1]] = boardSpaces.current[selectedSquare.current[0]][selectedSquare.current[1]];		//Clone piece into new location
			boardSpaces.current[selectedSquare.current[0]][selectedSquare.current[1]] = 0;													//Remove piece from old location
			
			selectedPiece.hasMoved = true;
			
			if(selectedPiece.type === Pieces.K){
				kings.current[selectedPiece.color] = [...newSelection];
			}
			
			turn.current = (turn.current === Colors.W) ? Colors.B : Colors.W;
			boardFuture.current = [];
			
			props.onUpdate(boardSpaces.current, turn.current, kings.current);
			//setBoardState(clone2dArray(boardSpaces.current));
			//setTurnState(turn);
		}
		
		
		if(selectedSquare.current !== null && selectedSquare.current[0] === newSelection[0] && selectedSquare.current[1] === newSelection[1]){
			//Same square selected twice, deselect it
			selectedSquare.current = null;
				
		}else if(newSelection[0] < 0 || newSelection[0] >=8 || newSelection[1] < 0 || newSelection[1] >=8){
			selectedSquare.current = null;
		}else{
			selectedSquare.current = newSelection;
		}
		
		potentialMoves.current = [];
		
		//TODO: don't let this run after selecting a piece to capture
		//TODO: chess piece movement progress:
		//Allow pawns to capture diagonally
		//Allow pawns to move 2 squares forward on first move
		//Allow pawns to en passant
		//Rework rooks to send out tracers to move/capture properly
		//Allow queens to move - send out tracers
		//Allow kings to castle
		//Prevent kings from moving into check - generate potential moves from king using all piece types, preventing move if it detects an opposing piece of the correct type
		//Prevent moves that keep kings in check
		//Determining check:
		//each move, search for potential moves for that piece for the next turn, and determine if the king is in any of those squares
		//save the attack path and the attacking piece's square, and disallow any moves outside of that path except for the king
		//king is only allowed moves outside of that path
		if(selectedSquare.current !== null){
			let selectedPiece = boardSpaces.current[selectedSquare.current[0]][selectedSquare.current[1]];
			
			if(selectedPiece !== 0 && selectedPiece.color === turn.current){
				
				//generate potential moves
				if(selectedPiece.type === Pieces.P){
					
					potentialMoves.current = potentialMoves.current.concat(findPawnSquares(selectedSquare.current));
					
				}else if(selectedPiece.type === Pieces.N){

					potentialMoves.current = potentialMoves.current.concat(findKnightSquares(selectedSquare.current));
					
				}else if(selectedPiece.type === Pieces.B){
					
					potentialMoves.current = potentialMoves.current.concat(findDiagonalSquares(selectedSquare.current));
					
				}else if(selectedPiece.type === Pieces.R){

					potentialMoves.current = potentialMoves.current.concat(findCardinalSquares(selectedSquare.current));
					
				}else if(selectedPiece.type === Pieces.Q){
					
					potentialMoves.current = potentialMoves.current.concat(findCardinalSquares(selectedSquare.current), findDiagonalSquares(selectedSquare.current));
					
				}else{	//Piece is a King
					
					potentialMoves.current = potentialMoves.current.concat(findKingSquares(selectedSquare.current));
					
				}
			}
		}
		
		//drawBoard();
	}
	
	const renderCloneButton = () => {
		return(
			<CloneButton
				onClick={() => props.onClone(boardSpaces.current, turn.current, kings.current)}
			/>
		)
	}
	
	const renderDeleteButton = () => {
		return(
			<DeleteButton
				onClick={() => props.onDelete()}
			/>
		)
	}
	
	//TODO: make it update board visuals correctly
	const renderResetButton = () => {
		return(
			<ResetButton
				onClick={() => onReset()}
			/>
		)
	}
	
	const renderForwardButton = () => {
		return(
			<ForwardButton
				onClick={() => onForward()}
			/>
		)
	}
	
	const renderBackButton = () => {
		return(
			<BackButton
				onClick={() => onBack()}
			/>
		)
	}
	
	const onBack = () => {
		
		if(boardHistory.current.length > 0){
			
			boardFuture.current.push(boardSpaces.current);
			boardSpaces.current = boardHistory.current.pop();
			turn.current = (turn.current === Colors.W) ? Colors.B : Colors.W;
			potentialMoves.current = [];
			
		}
		
		//drawBoard();
	}
	
	const onForward = () => {
		
		if(boardFuture.current.length > 0){
			
			boardHistory.current.push(boardSpaces.current);
			boardSpaces.current = boardFuture.current.pop();
			turn.current = (turn.current === Colors.W) ? Colors.B : Colors.W;
			potentialMoves.current = [];
			
		}
		
		//drawBoard();
	}
	
	const onReset = () => {
		boardSpaces.current = clone2dArray(props.startingBoard);
		turn.current = props.startingTurn;
		potentialMoves.current = [];
		boardFuture.current = [];
		boardHistory.current = [];
		//drawBoard();
	}
	
	//Functions for piece movement
	const findCardinalSquares = (sourceSquare, selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]]) => {
		//let selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]];
		let foundSquares = [];
		
		//Send tracers horizontally and vertically
		for(let i = 1; sourceSquare[0] + i < 8; i++){
			if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1]] === 0){
				foundSquares.push([sourceSquare[0] + i, sourceSquare[1]]);
			}else if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1]] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1]].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0] + i, sourceSquare[1]]);
				}
				
				break;
			}
		}
		
		for(let i = 1; sourceSquare[0] - i >= 0; i++){
			if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1]] === 0){
				foundSquares.push([sourceSquare[0] - i, sourceSquare[1]]);
			}else if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1]] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1]].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0] - i, sourceSquare[1]]);
				}
				
				break;
			}
		}
		
		for(let i = 1; sourceSquare[1] + i < 8; i++){
			if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] + i] === 0){
				foundSquares.push([sourceSquare[0], sourceSquare[1] + i]);
			}else if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] + i] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] + i].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0], sourceSquare[1] + i]);
				}
				
				break;
			}
		}
		
		for(let i = 1; sourceSquare[1] - i >= 0; i++){
			if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] - i] === 0){
				foundSquares.push([sourceSquare[0], sourceSquare[1] - i]);
			}else if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] - i] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] - i].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0], sourceSquare[1] - i]);
				}
				
				break;
			}
		}
		
		return foundSquares;
	}
	
	const findDiagonalSquares = (sourceSquare, selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]]) => {
		//let selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]];
		let foundSquares = [];
		
		//Send tracers diagonally
		for(let i = 1; sourceSquare[0] + i < 8 && sourceSquare[1] + i < 8; i++){
			if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] + i] === 0){
				foundSquares.push([sourceSquare[0] + i, sourceSquare[1] + i]);
			}else if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] + i] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] + i].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0] + i, sourceSquare[1] + i]);
				}
				
				break;
			}
		}
		
		for(let i = 1; sourceSquare[0] - i >= 0 && sourceSquare[1] + i < 8; i++){
			if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1] + i] === 0){
				foundSquares.push([sourceSquare[0] - i, sourceSquare[1] + i]);
			}else if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1] + i] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1] + i].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0] - i, sourceSquare[1] + i]);
				}
				
				break;
			}
		}
		
		for(let i = 1; sourceSquare[0] + i < 8 && sourceSquare[1] - i >= 0; i++){
			if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] - i] === 0){
				foundSquares.push([sourceSquare[0] + i, sourceSquare[1] - i]);
			}else if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] - i] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] - i].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0] + i, sourceSquare[1] - i]);
				}
				
				break;
			}
		}
		
		for(let i = 1; sourceSquare[0] - i >= 0 && sourceSquare[1] - i >= 0; i++){
			if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1] - i] === 0){
				foundSquares.push([sourceSquare[0] - i, sourceSquare[1] - i]);
			}else if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1] - i] !== selectedPiece){
				if(boardSpaces.current[sourceSquare[0] - i][sourceSquare[1] - i].color !== selectedPiece.color){
					foundSquares.push([sourceSquare[0] - i, sourceSquare[1] - i]);
				}
				
				break;
			}
		}
		
		return foundSquares;
	}
	
	const findPawnSquares = (sourceSquare, selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]]) => {
		//TODO: find spots that can be moved to via capture or en passant
		//let selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]];
		let foundSquares = [];
		
		if(selectedPiece.color === Colors.W){
			if(sourceSquare[1] + 1 < 8 && boardSpaces.current[sourceSquare[0]][sourceSquare[1] + 1] === 0){	//space forward is empty
				foundSquares.push([sourceSquare[0], sourceSquare[1] + 1]);
			}
			
			if(sourceSquare[1] === 1 && boardSpaces.current[sourceSquare[0]][sourceSquare[1] + 2] === 0){	//pawn has not been moved and space 2 forward is empty
				foundSquares.push([sourceSquare[0], sourceSquare[1] + 2]);
			}
			
			if(sourceSquare[0] - 1 >= 0 && sourceSquare[1] + 1 < 8 && boardSpaces.current[sourceSquare[0] - 1][sourceSquare[1] + 1] !== 0 && boardSpaces.current[sourceSquare[0] - 1][sourceSquare[1] + 1].color !== selectedPiece.color){	//diagonal space forward can be captured
				foundSquares.push([sourceSquare[0] - 1, sourceSquare[1] + 1]);
			}
			
			if(sourceSquare[0] + 1 < 8 && sourceSquare[1] + 1 < 8 && boardSpaces.current[sourceSquare[0] + 1][sourceSquare[1] + 1] !== 0 && boardSpaces.current[sourceSquare[0] + 1][sourceSquare[1] + 1].color !== selectedPiece.color){	//diagonal space forward can be captured
				foundSquares.push([sourceSquare[0] + 1, sourceSquare[1] + 1]);
			}
			
		}else{	//Piece is black, moves in opposite direction
			if(boardSpaces.current[sourceSquare[0]][sourceSquare[1] - 1] === 0){	//space forward is empty
				foundSquares.push([sourceSquare[0], sourceSquare[1] - 1]);
			}
			
			if(sourceSquare[1] === 6 && boardSpaces.current[sourceSquare[0]][sourceSquare[1] - 2] === 0){	//pawn has not been moved and space 2 forward is empty
				foundSquares.push([sourceSquare[0], sourceSquare[1] - 2]);
			}
			
			if(sourceSquare[0] - 1 >= 0 && sourceSquare[1] - 1 >= 0 && boardSpaces.current[sourceSquare[0] - 1][sourceSquare[1] - 1] !== 0 && boardSpaces.current[sourceSquare[0] - 1][sourceSquare[1] - 1].color !== selectedPiece.color){	//diagonal space forward can be captured
				foundSquares.push([sourceSquare[0] - 1, sourceSquare[1] - 1]);
			}
			
			if(sourceSquare[0] + 1 < 8 && sourceSquare[1] - 1 > 0 && boardSpaces.current[sourceSquare[0] + 1][sourceSquare[1] - 1] !== 0 && boardSpaces.current[sourceSquare[0] + 1][sourceSquare[1] - 1].color !== selectedPiece.color){	//diagonal space forward can be captured
				foundSquares.push([sourceSquare[0] + 1, sourceSquare[1] - 1]);
			}
		}
		
		return foundSquares;
	}
		
	const findKnightSquares = (sourceSquare, selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]]) => {
		//let selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]];
		let foundSquares = [];
		
		foundSquares.push([sourceSquare[0] + 2, sourceSquare[1] + 1]);
		foundSquares.push([sourceSquare[0] - 2, sourceSquare[1] + 1]);
		foundSquares.push([sourceSquare[0] + 2, sourceSquare[1] - 1]);
		foundSquares.push([sourceSquare[0] - 2, sourceSquare[1] - 1]);
		foundSquares.push([sourceSquare[0] + 1, sourceSquare[1] + 2]);
		foundSquares.push([sourceSquare[0] - 1, sourceSquare[1] + 2]);
		foundSquares.push([sourceSquare[0] + 1, sourceSquare[1] - 2]);
		foundSquares.push([sourceSquare[0] - 1, sourceSquare[1] - 2]);
		
		for(let i = 0; i < foundSquares.length; i++){
			if(
				foundSquares[i][0] < 0 			||	//Square is off of the board
				foundSquares[i][0] >= 8 		||
				foundSquares[i][1] < 0 			||
				foundSquares[i][1] >= 8 		||
				(
					boardSpaces.current[foundSquares[i][0]][foundSquares[i][1]] !== 0					&&		//Square is occupied by allied piece
					boardSpaces.current[foundSquares[i][0]][foundSquares[i][1]].color === selectedPiece.color	
				)	
			){
				foundSquares.splice(i, 1);
				i--;
			}
		}
		
		return foundSquares;
	}

	const findKingSquares = (sourceSquare, selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]]) => {
		//TODO: allow castling, disallow moving when it would place in check
		//let selectedPiece = boardSpaces.current[sourceSquare[0]][sourceSquare[1]];
		let foundSquares = [];
		
		for(let i = -1; i < 2; i++){
			for(let j = -1; j < 2; j++){
				if(	//filter out different illegal moves
					(i !== 0 || j !== 0)			&&	//can't move to same square
					sourceSquare[0] + i >= 0		&&	//move is off board
					sourceSquare[0] + i < 8			&&
					sourceSquare[1] + j >= 0		&&
					sourceSquare[1] + j < 8			&&
					boardSpaces.current[sourceSquare[0] + i][sourceSquare[1] + j].color !== selectedPiece.color	//can't move on top of allied piece
				){
					foundSquares.push([sourceSquare[0] + i, sourceSquare[1] + j]);
				}
			}
		}
		
		return foundSquares;
	}
	
	//TODO: finish and implement - currently (test this) scans for Bishops, Rooks, Knights, and Queens attacking a square
	//Needs Pawns and Kings implemented
	//Track King for check scan?
	const findCheck = (sourceSquare, checkSquare = sourceSquare) => {
		let foundSquares = [];
		let checkSquares = [];
		
		foundSquares.concat(findCardinalSquares(checkSquare, boardSpaces.current[sourceSquare[0]][sourceSquare[1]]));
		
		for(let i = 0; i < sourceSquare.length; i++){
			if(foundSquares[i] !== 0 && (foundSquares[i].type === Pieces.R || foundSquares[i].type === Pieces.Q)){
				checkSquares.push(foundSquares[i]);
			}
		}
		
		foundSquares = [];
		foundSquares.concat(findDiagonalSquares(checkSquare, boardSpaces.current[sourceSquare[0]][sourceSquare[1]]));
		
		for(let i = 0; i < sourceSquare.length; i++){
			if(foundSquares[i] !== 0 && (foundSquares[i].type === Pieces.B || foundSquares[i].type === Pieces.Q)){
				checkSquares.push(foundSquares[i]);
			}
		}
		
		foundSquares = [];
		foundSquares.concat(findKnightSquares(checkSquare, boardSpaces.current[sourceSquare[0]][sourceSquare[1]]));
		
		for(let i = 0; i < sourceSquare.length; i++){
			if(foundSquares[i] !== 0 && foundSquares[i].type === Pieces.N){
				checkSquares.push(foundSquares[i]);
			}
		}
		
		
	}
	
	//TODO: make pieces draw on load
	useEffect(() => {
		let animID;
		
		//Setup board after mount
		canvas = boardRef.current;
		
		const drawBoard = () => {
			//TODO: size board and squares properly, use colorblind friendly colors/symbols flip pieces to orient correctly(y axis is different between chess notation and computer) elevate outside of Chessboard?
			//top left square from either player's direction is light
			//!data reflects chess orientation - flip the y axis when drawing to correctly match computer orientation
			
			canvas = boardRef.current;
			
			if(canvas === undefined || canvas === null){
				return;
			}
			
			ctx = canvas.getContext("2d");
			//boardSize = canvas.width;
			//squareSize = boardSize / 8;
			
			//ctx.scale(dpi, dpi);
			ctx.clearRect(0, 0, boardSize, boardSize);
			
			drawBackground();
			
			drawPieces();
			
			animID = requestAnimationFrame(drawBoard);
		}
		
		const drawBackground = () => {
			const DARK_SQUARE = "#335588";
			const LIGHT_SQUARE = "#8899DD";
			const SELECT_HIGHLIGHT = "#AAAA55AA";
			const MOVES_HIGHLIGHT = "#44AA44AA";
			
			//Draw checkerboard pattern
			ctx.fillStyle = LIGHT_SQUARE;
			ctx.fillRect(0, 0, boardSize, boardSize);
			
			ctx.fillStyle = DARK_SQUARE;
			for(let curRow = 0; curRow < 8; curRow++){
				for(let curColumn = 0; curColumn < 8; curColumn++){
					if((curRow + curColumn) % 2 === 1){
						ctx.fillRect(curColumn * squareSize, curRow * squareSize, squareSize, squareSize);
					}
				}
			}
			
			//Draw highlighted square
			if(selectedSquare.current != null){
				ctx.fillStyle = SELECT_HIGHLIGHT;
				ctx.fillRect(selectedSquare.current[0] * squareSize, (7 - selectedSquare.current[1]) * squareSize, squareSize, squareSize);
			}
			
			//TODO: Consider drawing as a separate shape
			//Draw potential moves
			ctx.fillStyle = MOVES_HIGHLIGHT;
			for(let i = 0; i < potentialMoves.current.length; i++){
				ctx.fillRect(potentialMoves.current[i][0] * squareSize, (7 - potentialMoves.current[i][1]) * squareSize, squareSize, squareSize);
			}
		}
		
		const drawPieces = () => {

			for(let i = 0; i < 8; i++){
				for(let j = 0; j < 8; j++){
					let curPiece = boardSpaces.current[i][j];
					if(curPiece !== 0){
						ctx.drawImage(props.images[curPiece.type - 1][curPiece.color], i * squareSize, (7 - j) * squareSize, squareSize, squareSize);
					}
				}
			}
		}
		
		if(canvas !== undefined){
			ctx = canvas.getContext("2d");
			let dpi = window.devicePixelRatio || 1;
			dpi /=
				ctx.backingStorePixelRatio ||
				ctx.webkitBackingStorePixelRatio ||
				ctx.mozBackingStorePixelRatio ||
				ctx.msBackingStorePixelRatio ||
				ctx.oBackingStorePixelRatio ||
				//ctx.backingStorePixelRatio ||
				1;
			
		
			canvas.setAttribute("height", (+getComputedStyle(canvas).getPropertyValue("height").slice(0, -2)) * dpi);
			canvas.setAttribute("width", (+getComputedStyle(canvas).getPropertyValue("width").slice(0, -2)) * dpi);
			
			//boardSize = getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);
			boardSize = canvas.width;
			squareSize = boardSize / 8;
			
			drawBoard();
			//ctx.font = "30px Arial";
			//ctx.fillText("DPI: " + dpi, 5, 50);

			canvas.addEventListener("mousedown", onSquareSelect);
		}
		
		return () => {
			if(canvas !== undefined && canvas !== null){
				canvas.removeEventListener("mousedown", onSquareSelect);
			}
			cancelAnimationFrame(animID);
		}
	}, []);
	
	/*
	useEffect(() => {
		drawBoard();
	}, [boardState]);
	*/
	
	//TODO: make reset button rerender board properly, and maybe clear history
	return (
		<div className="col" style={{minWidth: "300px"}}>
			<div className="card text-center my-2">
				<div className="card-header text-center">
					<canvas
						ref={boardRef}
						style={{
								width: "250px",
								height: "250px"
							}}
					></canvas>
				</div>
				<div className="card-body">
					<div className="btn-toolbar justify-content-center" role="toolbar">
						<div class="btn-group me-2" role="group">
							{renderCloneButton()}
							{renderResetButton()}
							{renderDeleteButton()}
						</div>
						<div class="btn-group me-2" role="group">
							{renderBackButton()}
							{renderForwardButton()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function NewButton(props) {
	return (
		<button className="NewButton btn btn-success" type="button" onClick={props.onClick}>
			New Board
		</button>
	);
}

function SaveButton(props) {
	return (
		<button className="SaveButton btn btn-primary" type="button" onClick={props.onClick}>
			Save Boards
		</button>
	);
}

function CloneButton(props) {
	return (
		<button className="cloneButton btn btn-primary" type="button" onClick={props.onClick}>
			Clone
		</button>
	);
}

function DeleteButton(props) {
	return (
		<button className="deleteButton btn btn-primary" type="button" onClick={props.onClick}>
			Delete
		</button>
	);
}

function ForwardButton(props) {
	return (
		<button className="forwardButton btn btn-secondary" type="button" onClick={props.onClick} disabled={props.disabled}>
			<i className="bi bi-arrow-clockwise"></i>
			{"Redo"}
		</button>
	);
}

function BackButton(props) {
	return (
		<button className="backButton btn btn-secondary" type="button" onClick={props.onClick} disabled={props.disabled}>
			<i className="bi bi-arrow-counterclockwise"></i>
			{"Undo"}
		</button>
	);
}

function ResetButton(props) {
	return (
		<button className="resetButton btn btn-primary" type="button" onClick={props.onClick}>
			Reset
		</button>
	);
}

function findMatchingArray(arr, val){
	//Finds array val inside array of arrays arr
	//Returns -1 if not found
	//TODO: optimize
	
	for(let i = 0; i < arr.length; i++){
		let match = true;
		
		for(let j = 0; j < arr[i].length; j++){
			if(arr[i][j] !== val[j]){
				match = false;
				break;
			}
		}
		
		if(match){
			return i;
		}
	}
		
	return -1;
}

function clone2dArray(arr){
	let newArray = [];
	
	for(let i = 0; i < arr.length; i++){
		newArray[i] = arr[i].slice();
	}
	
	return newArray;
}

export default SideboardApp;