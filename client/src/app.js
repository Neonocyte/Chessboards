import React from "react";
import {BrowserRouter as Router, Switch, Route, useParams} from "react-router-dom";

import SideboardApp from './Sideboard';

export default function App(){
	return(
		<Router>
			<Switch>
				<Route path="/boards/:id" children={<PrebuiltBoard />} />
				<Route path="/">
					<SideboardApp board_json=""/>
				</Route>
			</Switch>
		</Router>
	);
}

function PrebuiltBoard() {
	let {id} = useParams();
	let json = "";
	
	
	let http = new XMLHttpRequest();
	http.onreadystatechange = () => {
		if(http.readyState == XMLHttpRequest.DONE){
			json = http.responseText;
		}
	}
	
	//async false to guarantee json is received - set to true if making a load screen
	http.open("GET", "/node/boards/" + id, false);
	http.send();
	
	
	return(
		<div>
			<SideboardApp board_json={json}/>
		</div>
	);
}