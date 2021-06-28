require('dotenv').config({ path: './config/.env' });

const express = require("express");
const app = express();
const {Sequelize, DataTypes} = require("sequelize");

app.use(express.json());

//app.use(express.urlencoded({ extended: true }))


/*********ROUTES*********/
app.get("/", (req, res) => {
	//This route is just here to note that the server has started
	res.send("Hello World!");
	res.redirect("/");
});

app.get("/boards/:boardID", async (req, res) => {
	//res.status(200).send("boards: " + req.params.boardID);
	try{
		const foundBoard = await Board.findOne({
			where: {
				id: getKey(req.params.boardID)
			}
		});
		
		res.status(200).send(foundBoard.board_json);
	}catch(error){
		//TODO: create an error screen for when no entry was found
		console.log(error);
	}
});

app.post("/save", async (req, res) => {
	try{
		const newBoard = await Board.create({board_json: req.body});
		const response = generateURL(newBoard.id);
		res.status(200).send(response);
	}catch(error){
		console.error(error);
	}
});
/*******END ROUTES*******/

const PORT = process.env.PORT;

const sequelize = new Sequelize(
	process.env.DATABASE,
	process.env.DATABASE_USER,
	process.env.DATABASE_PASSWORD,
	{
		host: process.env.DATABASE_HOST,
		port: process.env.DATABASE_PORT,
		dialect: 'postgres',
	},
);

//Start sequelize, connect to database
sequelize.authenticate().then(() => {
  console.log("Database connection established");
}).catch((error) => {
  console.log("Unable to connect to database: " + error);
});

//Database models
const Board = sequelize.define("Board", {
	board_json: {
		type: Sequelize.JSON,
		allowNull: false
	}
}, {
	updatedAt: false
});

Board.sync();

//Start listening to ports
app.listen(PORT, console.log(`Server started on port ${PORT}`));

function generateURL(num){
	//generate a short URL based on database key
	let digits = [], url = "";
	num += 157; //prevent generating extremely small strings
	
    if(num === 0){
    	digits.push(0);
    }
    
	while(num > 0){
		digits.push(num % 62);
		num = Math.floor(num / 62);
	}
	
	digits = digits.reverse();
	
	//numbers begin at 48, capital letters at 65, and lowercase at 97 - modify digits to account for the disjoint
	for(let i = 0; i < digits.length; i++){
    	if(digits[i] >= 52){
			url += String.fromCharCode(48 + digits[i] - 52);
        }else if(digits[i] >= 26){
        	url += String.fromCharCode(65 + digits[i] - 26);
        }else{
        	url += String.fromCharCode(97 + digits[i]);
        }
	}
	
	return url;
}

function getKey(url){
	//get a database key from the URL
    let num = 0, digits = [];
    
    for(let i = 0; i < url.length; i++){
    	if(url.charCodeAt(i) < 65){
        	digits.push(52 + url.charCodeAt(i) - 48);
        }else if(url.charCodeAt(i) < 97){
        	digits.push(26 + url.charCodeAt(i) - 65);
        }else{
        	digits.push(url.charCodeAt(i) - 97);
        }
    }
    
    digits = digits.reverse();
    
    
    for(let i = 0; i < digits.length; i++){
    	num += digits[i] * Math.pow(62, i);
    }
    
    num -= 157;
    return num;
}