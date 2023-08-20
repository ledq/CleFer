/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * DUY LE
 */

/** namespace. */
var rhit = rhit || {};
rhit.fbAuthManager = null;
rhit.songManager = null;
rhit.historyManager = null;
rhit.favoriteManager = null;
rhit.singleSongManager = null;
rhit.userManager = null;

// SONG
rhit.FB_COLLECTION_SONG = "Song";
rhit.FB_KEY_SONG_ID = "songId";
rhit.FB_KEY_SONG_NAME = "songName";
rhit.FB_KEY_ARTIST = "artist";
rhit.FB_KEY_TEXT = "text";
rhit.FB_KEY_SONG_LINK = "link";
rhit.FB_KEY_VIEW_NUM = "view";
rhit.FB_KEY_LIKE_NUM = "like";

//USER
rhit.FB_COLLECTION_USER = "User";
rhit.FB_KEY_USER_ID = "userId";
rhit.FB_KEY_USERNAME = "username";
rhit.FB_KEY_ABOUT = "about";  // might need photoURL for avatar
rhit.FB_KEY_URL = "url";

//HISTORY - FAVORITE - FOLLOW
rhit.FB_COLLECTION_HISTORY = "History";
rhit.FB_COLLECTION_FAVORITE = "Favorite";
rhit.FB_COLLECTION_FOLLOW = "Follow"; 

//CREATOR
rhit.FB_KEY_CREATOR_ID = "creatorId";
rhit.FB_KEY_CREATOR_NAME = "creatorName";

//TIME
rhit.FB_KEY_TIME = "time";

//REGEX
rhit.REGEX = /\[(.*?)\]/g;



//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.UserManager = class {
	constructor(uid){
		this._uid = uid;
		this._documentSnapshot = {};
	 	this._unsubscribe = null;
	 	this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USER).doc(uid);
	}

	beginListening(changeListener){
		this._unsubscribe = this._ref.onSnapshot((doc)=>{
			if(doc.exists){
				this._documentSnapshot = doc;
				changeListener();
			}else{
				console.log("No such document");
				this.add(this._uid,"No info");
			}
			
		});

	}
	stopListening() {
		console.log("userManager STOP listening");
		this._unsubscribe();
	}

	add(username,about) {
		// Add a new document in collection "cities"
		this._ref.set({
				[rhit.FB_KEY_USERNAME]:username,
				[rhit.FB_KEY_ABOUT]:about,
				[rhit.FB_KEY_URL]:"https://img1.ak.crunchyroll.com/i/spire2/3f9fa2c72cfd85ca0c5c2f8a0be29ac11674685104_main.jpg",
			})
			.then(() => {
				console.log("Document successfully written!");
			})
			.catch((error) => {
				console.error("Error writing document: ", error);
			});
	}

	update(username,about){
		this._ref.update({
			[rhit.FB_KEY_USERNAME]: username,
			[rhit.FB_KEY_ABOUT]: about,
			[rhit.FB_KEY_URL]:this.URL

			
		}).then(() => {
			console.log("Document successfully updated!");
			//updateUserName();
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
		});

	}
	updatePhotoURL(url){
		this._ref.update({
			[rhit.FB_KEY_USERNAME]:this.username,
			[rhit.FB_KEY_ABOUT]:this.about,
			[rhit.FB_KEY_URL]: url

		}).then(() => {
			console.log("Document successfully updated!");
			//updateUserName();
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
		});
	}


	get isListening(){
		return !!this._unsubscribe;
	}

	get username(){
		return this._documentSnapshot.get(rhit.FB_KEY_USERNAME);
	}
	get about(){
		return this._documentSnapshot.get(rhit.FB_KEY_ABOUT);
	}
	get URL(){
		return this._documentSnapshot.get(rhit.FB_KEY_URL);
	}
}

rhit.SingleSongManager = class {
	constructor(id,creatorUsername){
		console.log("Single song created");
		this._id = id;
		this._documentSnapshot = {};
	 	this._unsubscribe = null;
	 	this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SONG).doc(id);
		this._lyricsArray =null;
		this._creatorUsername = creatorUsername;
		
	}

	

	update(songName,artistName,text,link){
		this._ref.update({
			[rhit.FB_KEY_SONG_NAME]: songName,
			[rhit.FB_KEY_ARTIST]: artistName,
			[rhit.FB_KEY_TEXT]: text,
			[rhit.FB_KEY_SONG_LINK]: link
		}).then(() => {
			console.log("Document successfully updated!");
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
		});

	}

	beginListening(changeListener){
		this._unsubscribe = this._ref.onSnapshot((doc)=>{
			if(doc.exists){
				this._documentSnapshot = doc;
				changeListener();
			}else{
				console.log("No such document");
			}
			
		});

	}
	stopListening() {
		this._unsubscribe();
	}
	get songName(){
		
		return this._documentSnapshot.get(rhit.FB_KEY_SONG_NAME);
	}
	get artist(){
		return this._documentSnapshot.get(rhit.FB_KEY_ARTIST);
	}
	get creatorId(){
		return this._documentSnapshot.get(rhit.FB_KEY_CREATOR_ID);
	}
	get creatorName(){
		return this._creatorUsername;
	}
	get text(){
		return this._documentSnapshot.get(rhit.FB_KEY_TEXT);
	}
	get lines(){
		return this.text.split('\n');
	}

	get link(){
		return this._documentSnapshot.get(rhit.FB_KEY_SONG_LINK);
	}



}

rhit.SongManager = class {
	constructor(uid,input){
		console.log("Made song manager");
		this._uid = uid;
		this._input=input;
		if(input){
			this._input = input.toLowerCase();
		}
		
		this._documentSnapshots = [];
		this._rawDocumentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SONG);
		this._unsubscribe = "null";
	}
	

	add(songName,artistName,text,link){
		
		return this._ref.add({
			[rhit.FB_KEY_SONG_NAME]: songName,
			[rhit.FB_KEY_ARTIST]: artistName,
			[rhit.FB_KEY_TEXT]: text,
			[rhit.FB_KEY_CREATOR_ID]: rhit.fbAuthManager.uid,
			[rhit.FB_KEY_SONG_LINK]: link,
			[rhit.FB_KEY_VIEW_NUM]: 0,
			[rhit.FB_KEY_LIKE_NUM]: 0
			
		});

			
	}

	beginListening(changeListener){
		let query = this._ref;
		if(this._uid){
			console.log("This uid is",rhit.fbAuthManager.uid);
			query = query.where(rhit.FB_KEY_CREATOR_ID,"==",this._uid); //For security, use rhit.fbAuthManager.uid, this is for debugging
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Update!");
        	this._rawDocumentSnapshots = querySnapshot.docs;
			if(this._rawDocumentSnapshots){
				console.log("There are songs");
				this._search();
			}
			changeListener();	
    	});
	}

	stopListening() {this._unsubscribe();}

	getDocAtIndex(index,username){
		
		const docSnapshot = this._documentSnapshots[index];
		const song = new rhit.Song(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_SONG_NAME),
			docSnapshot.get(rhit.FB_KEY_ARTIST),
			username
		);
		return song;
	}

	_search(){
		//Case for finding your works:
		if(this._input){
			for(let i=0; i<this._rawDocumentSnapshots.length;i++){
				const documentSnapshot = this._rawDocumentSnapshots[i];
				if(documentSnapshot.get(rhit.FB_KEY_SONG_NAME).toLowerCase().indexOf(this._input)>-1){
					this._documentSnapshots.push(documentSnapshot);
				}
			}
		}else{
			this._documentSnapshots=this._rawDocumentSnapshots;
		}
	}


	get length() {return this._documentSnapshots.length;}

}

rhit.HistoryManager = class {
	constructor(uid){
		console.log("History manager constructed");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_HISTORY);
		this._unsubscribe = "null";
	}
	beginListening(changeListener){
		let query = this._ref.orderBy(rhit.FB_KEY_TIME,"desc").where(rhit.FB_KEY_USER_ID,"==",rhit.fbAuthManager.uid);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Update!");
        	this._documentSnapshots = querySnapshot.docs;
			if(this._documentSnapshots){
				console.log("There are songs");
			}
			changeListener();	
    	});
	}

	stopListening(){
		this._unsubscribe();
	}

	getDocAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const song = new rhit.Song(
			docSnapshot.get(rhit.FB_KEY_SONG_ID),
			docSnapshot.get(rhit.FB_KEY_SONG_NAME),
			docSnapshot.get(rhit.FB_KEY_ARTIST),
			docSnapshot.get(rhit.FB_KEY_CREATOR_NAME)
		);
		return song;
	}

	add(songId,songName,artistName,creatorName,userId){
		
		return this._ref.add({
			[rhit.FB_KEY_SONG_ID]: songId,
			[rhit.FB_KEY_SONG_NAME]: songName,
			[rhit.FB_KEY_ARTIST]: artistName,
			[rhit.FB_KEY_CREATOR_NAME]: creatorName,
			[rhit.FB_KEY_USER_ID]: userId,
			[rhit.FB_KEY_TIME]: firebase.firestore.Timestamp.now()
			
		});
	
	}
	delete(documentIdToDelete) {
		this._ref.doc(documentIdToDelete).delete().then(() => {
			console.log("Document successfully deleted!");
		}).catch((error) => {
			console.error("Error removing document: ", error);
		});
	}


	get length(){
		return this._documentSnapshots.length;
	}
}

rhit.FavoriteManager = class {
	constructor(uid){
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_FAVORITE);
		this._unsubscribe = "null";
	}
	beginListening(changeListener){
		let query = this._ref;
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Update!");
        	this._documentSnapshots = querySnapshot.docs;
			if(this._documentSnapshots){
				console.log("There are songs");
			}
			changeListener();	
    	});
	}

	stopListening(){
		this._unsubscribe();
	}

	getDocAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const song = new rhit.Song(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_SONG_NAME),
			docSnapshot.get(rhit.FB_KEY_ARTIST),
			docSnapshot.get(rhit.FB_KEY_CREATOR_NAME)
		);
		return song;
	}
	get length(){
		return this._documentSnapshots.length;
	}
}

rhit.Song = class {
	constructor(id,songName,artist,creator){
		this.id = id;
		this.songName = songName;
		this.artist = artist;
		this.creator = creator;
	}
}

rhit.AccountPageController = class {
	constructor(){
		console.log("Account page reached");
		
		document.querySelector("#upload-button").addEventListener("click",(event) => {
			document.querySelector("#load-file").click();
		});

		document.querySelector("#load-file").addEventListener("change",(event) => {
			const file = event.target.files[0];
			const storageRef = firebase.storage().ref().child(rhit.fbAuthManager.uid);
			storageRef.put(file).then((uploadTaskSnapshot) => {
				//GET URL
				storageRef.getDownloadURL().then((downloadURL) => {
					rhit.userManager.updatePhotoURL(downloadURL)
				})

			});
		});
		


		document.querySelector("#save-info").addEventListener("click",(event) => {
			const username = document.querySelector("#username-input").value;
			const about = document.querySelector("#about-input").value;
			rhit.userManager.update(username,about);
			
		});

		rhit.userManager.beginListening(this.updateView.bind(this));
		
		

		
	}
	updateView(){
		document.querySelector("#username-input").value= rhit.userManager.username;
		document.querySelector("#about-input").value= rhit.userManager.about;
		document.querySelector("#ava").src = rhit.userManager.URL;
		
		

	}
}

rhit.EditPageController = class {
	constructor() {
		console.log("Edit page constructed");

		document.querySelector("#save-button").addEventListener("click",(event)=>{		
			const songName = document.querySelector("#song-name-input").value;
			const artistName = document.querySelector("#artist-name-input").value;
			const text = document.querySelector("#text-area-input").value;
			const link = document.querySelector("#inputLink").value
			console.log("Text is",text);
			rhit.singleSongManager.update(songName,artistName,text,link);
		});

		

		rhit.singleSongManager.beginListening(this.updateView.bind(this));
	}
	updateView(){
		document.querySelector("#song-name-input").value = rhit.singleSongManager.songName; 
		document.querySelector("#artist-name-input").value = rhit.singleSongManager.artist; 
		document.querySelector("#text-area-input").value = rhit.singleSongManager.text; 
		document.querySelector("#link-button").addEventListener("click",(event)=>{		
			document.querySelector("#inputLink").value = rhit.singleSongManager.link;
		});
	}
}

rhit.AddPageController = class {
	constructor() {
		console.log("Add page constructed");

		document.querySelector("#save-button").addEventListener("click",(event)=>{		
			const songName = document.querySelector("#song-name-input").value;
			const artistName = document.querySelector("#artist-name-input").value;
			const text = document.querySelector("#text-area-input").value;
			const link = document.querySelector("#inputLink").value;
			console.log("Text is",text);
			rhit.songManager.add(songName,artistName,text,link).then((docRef) => {
				console.log("Document written with ID: ", docRef.id);
				window.location.href = `/list.html?type=works&uid=${rhit.fbAuthManager.uid}`;
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
			
		});

		

		

		
	}

}

rhit.DetailPageController = class {
	constructor() {

		console.log("Detail page constructed");
		
		document.querySelector("#creator-link").addEventListener("click",(event) => {
			
		})
		rhit.singleSongManager.beginListening(this.updateView.bind(this));
		
	}
	updateView(){
		document.querySelector("#songLink").setAttribute('href',rhit.singleSongManager.link );
		document.querySelector("#song-title").innerHTML = rhit.singleSongManager.songName; 
		document.querySelector("#artist-title").innerHTML = rhit.singleSongManager.artist; 
		document.querySelector("#creator-link").innerHTML = `By: ${rhit.singleSongManager.creatorName}`; 

		document.querySelector("#creator-link").addEventListener("click",(event) => {
			const creatorId = rhit.singleSongManager.creatorId;
			window.location.href = `profile.html?uid=${creatorId}`
		})
		//document.querySelector(".chord-lyric-line").innerHTML = rhit.singleSongManager._documentSnapshot.get(rhit.FB_KEY_TEXT); 
		const newList = htmlToElement(`<div id="contents"></div>`);
		
		for(let i=0; i<rhit.singleSongManager.lines.length;i++){
			const newLine = this._createLyrics(rhit.singleSongManager.lines[i]);
			newList.appendChild(newLine);
		}

		// Remove old quoteListContainer
		const oldList = document.querySelector("#contents");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// Put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
		
	}

	_createLyrics(line){
		const parsedLine = line.split(rhit.REGEX);
		let htmlString = ``;
		for(let i=0; i<parsedLine.length;i++){
			if(i%2==0){
				if(parsedLine[i]!=""){
					const lyrics = `<span class="lyric">${parsedLine[i]}</span>` ;
					htmlString+=lyrics;
				}
			}else{
				const chord = `<span class="chord-inline">
									<span class="chord">${parsedLine[i]}</span>
			 				   </span>`;
				
				htmlString+=chord;
			}
		}
		return htmlToElement(`<div class="chord-lyric-line">${htmlString}</div>`);
	}
}

rhit.MenuController = class {
	constructor() {

		document.querySelector("#search-redirect").addEventListener("click",(event)=>{	
			console.log("SEARCHING ...");	
			const searchInput = document.querySelector("#search-input").value;
			if(searchInput){
				window.location.href = `list.html?type=search&input=${searchInput}`;
			}
			

			
		});

		document.querySelector("#menuEditAcc").addEventListener("click",(event)=>{	
			console.log("CLIKED Edit profile");	
			window.location.href = `myaccount.html`;
			
		});

		document.querySelector("#menuSignOut").addEventListener("click",(event)=>{	
			console.log("CLIKED menusign out");	
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#history").addEventListener("click",(event)=>{		
			console.log("SHOW HISTORY");
			window.location.href = "/list.html?type=history";
		});

		document.querySelector("#home").addEventListener("click",(event)=>{		
			
			window.location.href = "/home.html";     
		});

		document.querySelector("#your-works").addEventListener("click",(event)=>{		
			console.log("SHOW YOUR WORKS");
			window.location.href = `/list.html?type=works&uid=${rhit.fbAuthManager.uid}`;
		});
		

		//Start listening
		//rhit.fbPhotosManager.beginListening(this.updateList.bind(this));

	}

}

rhit.ListPageController = class{
	constructor(prompt){
		//Listener:
		console.log("ListPageController constructed");
		this._prompt = prompt;
		this._manager = rhit.songManager;
		this._manager.beginListening(this.updateView.bind(this));
		

	}
	updateView(){
		document.querySelector("#prompt").innerHTML = this._prompt;

		const newList = htmlToElement(`<div id="list-container"></div>`);
		if(this._manager.length<=0){
			const zeroSongResult = htmlToElement(`<div> NO SONG FOUND</div>`);
			const sadBochi = htmlToElement(`<div class="pan" ><img
            									src="images/bochiSlime.png"
            									alt="(sad)">
          									</div>`);
			newList.appendChild(zeroSongResult);
			newList.appendChild(sadBochi);
		}
		
		
		for (let i = 0; i < this._manager.length;i++){
			const creatorId = this._manager._documentSnapshots[i].get(rhit.FB_KEY_CREATOR_ID);
			const user = new rhit.UserManager(creatorId);
			user.beginListening(() => {
				const doc = this._manager.getDocAtIndex(i,user.username);
				const newCard = this._createCard(doc);
				newCard.onclick = (event)=>{
					if(this._manager._uid){
					
						console.log("REDIRECT TO YOUR EDIT",this._manager._uid);
						window.location.href = `/edit.html?id=${doc.id}`;
					}else{
						const songId = doc.id;
						const songName = doc.songName;
						const artistName = doc.artist;
						const creatorName = doc.creator;
						const userId = rhit.fbAuthManager.uid;
						rhit.historyManager.add(songId, songName, artistName, creatorName, userId).then((docRef) => {
							console.log("Document written with ID: ", docRef.id);
							window.location.href = `/detail.html?id=${doc.id}&username=${user.username}`;
						})
						.catch((error) => {
							console.error("Error adding document: ", error);
						});


						
						
					}
		

				}

				newList.appendChild(newCard);
			})
			
		}

		// Remove old quoteListContainer
		const oldList = document.querySelector("#list-container");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// Put in new quoteListContainer
		oldList.parentElement.appendChild(newList);

		console.log("WILL YOU...");
		if(this._manager._uid){
			console.log("SHOW THE BUTTON");
			document.querySelector("#myfab").style.display = "block";
			document.querySelector("#myfab").addEventListener("click", (event) => {
				
				window.location.href = `/edit.html?`; 
			});
		}
	}

	//helper method 
	_createCard(song) {
		return htmlToElement(`<div class="card" style="margin-bottom: 10px;">
		<div class="card-body" style="background-color: #ffffffc4;">
		  <h5 class="card-title" style="color: #D35298;">${song.songName}</h5>
		  <h6 class="card-subtitle mb-2 text-muted">${song.artist}</h6>
		  <h7>By: ${song.creator}</h7>  
		</div>
	  </div>`);
	}
}

rhit.HistoryPageController = class{
	constructor(prompt){
		//Listener:
		console.log("HistoryController constructed");
		this._prompt = prompt;
		this._manager = rhit.historyManager;
		this._manager.beginListening(this.updateView.bind(this));
	}
	updateView(){
		document.querySelector("#prompt").innerHTML = this._prompt;

		const newList = htmlToElement(`<div id="list-container"></div>`);
		if (this._manager.length <= 0) {
			const zeroSongResult = htmlToElement(`<div> NO SONG FOUND</div>`);
			const sadBochi = htmlToElement(`<div class="pan" ><img
            									src="images/bochiSlime.png"
            									alt="(sad)">
          									</div>`);
			newList.appendChild(zeroSongResult);
			newList.appendChild(sadBochi);
		}


		for (let i = 0; i < this._manager.length; i++) {
			if ((i+1<this._manager.length)&&(this._manager._documentSnapshots[i].get(rhit.FB_KEY_SONG_NAME) ==
					this._manager._documentSnapshots[i + 1].get(rhit.FB_KEY_SONG_NAME))) {
				//SKIP because cannot
			} else {
				const doc = this._manager.getDocAtIndex(i);
				const newCard = this._createCard(doc);
				newCard.querySelector(".card-title").onclick = (event) => {
					if (this._manager._uid) {
						console.log("REDIRECT TO YOUR EDIT", this._manager._uid);
						window.location.href = `/edit.html?id=${doc.id}`;
					} else {
						// const songId = doc.id;
						// const songName = doc.songName;
						// const artistName = doc.artist;
						// const creatorName = doc.creator;
						// const userId = rhit.fbAuthManager.uid;
						// rhit.historyManager.add(songId, songName, artistName, creatorName, userId);
						window.location.href = `/detail.html?id=${doc.id}&username=${doc.creator}`;
					}

				}
				newCard.querySelector("button").onclick = (event) => {
					const historyId = rhit.historyManager._documentSnapshots[i].id;
					console.log("Click on: ",historyId);
					rhit.historyManager.delete(historyId);
				}

				newList.appendChild(newCard);
			}
		}

		// Remove old quoteListContainer
		const oldList = document.querySelector("#list-container");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// Put in new quoteListContainer
		oldList.parentElement.appendChild(newList);

		console.log("WILL YOU...");
		if (this._manager._uid) {
			console.log("SHOW THE BUTTON");
			document.querySelector("#myfab").style.display = "block";
			document.querySelector("#myfab").addEventListener("click", (event) => {

				window.location.href = `/edit.html?`;
			});
		}
	}

	//helper method 
	_createCard(song) {
		return htmlToElement(`<div class="cardContainer"><div class="card" style="margin-bottom: 10px;">
		<div class="card-body" style="background-color: #ffffffc4;">
		  <h5 class="card-title" style="color: #D35298;">${song.songName}</h5>
		  <h6 class="card-subtitle mb-2 text-muted">${song.artist}</h6>
		  <h7>By: ${song.creator}</h7>  
		</div>
	  </div>  <div class="flexible-icon"><button class=" flexible-button btn bmd-btn-icon">
	  <i class="material-icons">delete</i>
	</button></div>    </div>`);
	}
}

rhit.ProfilePageController = class{
	constructor(){
		//Listener:
		console.log("ProfilePageController constructed");
		
		
		rhit.songManager.beginListening(this.updateWrapper.bind(this));
		
		

	}
	updateWrapper(){
		if(!rhit.userManager.isListening){
			rhit.userManager.beginListening(this.updateView.bind(this));
		}
		
	}

	updateView(){
		document.querySelector("#profile-name-display").innerHTML = rhit.userManager.username;
		document.querySelector("#about").innerHTML = rhit.userManager.about;
		document.querySelector("#profile-ava").src = rhit.userManager.URL;

		
		const newList = htmlToElement(`<div id="list-container"></div>`);
		if(rhit.songManager.length<=0){
			console.log("yo");
			const zeroSongResult = htmlToElement(`<div> NO SONG FOUND</div>`);
			const sadBochi = htmlToElement(`<div class="pan" ><img
            									src="images/bochiSlime.png"
            									alt="(sad)">
          									</div>`);
			newList.appendChild(zeroSongResult);
			newList.appendChild(sadBochi);
		}
		
		
		for (let i = 0; i < rhit.songManager.length;i++){
			console.log(rhit.songManager._documentSnapshots[i]);
			const doc = rhit.songManager.getDocAtIndex(i,rhit.userManager.username);
			const newCard = this._createCard(doc);
			newCard.onclick = (event)=>{
				
					const songId = doc.id;
					const songName = doc.songName;
					const artistName = doc.artist;
					const creatorName = doc.creator;
					const userId = rhit.fbAuthManager.uid;
					rhit.historyManager.add(songId, songName, artistName, creatorName, userId).then((docRef) => {
						console.log("Document written with ID: ", docRef.id);
						window.location.href = `/detail.html?id=${doc.id}&username=${doc.creator}`;
					})
					.catch((error) => {
						console.error("Error adding document: ", error);
					});
			}
			newList.appendChild(newCard);

			
		}

		// Remove old quoteListContainer
		const oldList = document.querySelector("#list-container");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// Put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
		console.log("COME TO THE END");

	}

	//helper method 
	_createCard(song) {
		return htmlToElement(`<div class="card" style="margin-bottom: 10px;">
		<div class="card-body" style="background-color: #ffffffc4;">
		  <h5 class="card-title" style="color: #D35298;">${song.songName}</h5>
		  <h6 class="card-subtitle mb-2 text-muted">${song.artist}</h6>
		  <h7>By: ${song.creator}</h7>  
		</div>
	  </div>`);
	}
}


// Login Page:
rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event)=>{
			rhit.fbAuthManager.signIn();
		}
		
	}
}
   
rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
		console.log("FbAuth Manager");
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
			
		});
	}
	signIn() {
		console.log("Sign-in with Rose-fire");
		Rosefire.signIn("880d9378-8239-482f-abf3-4362dd9c88b0", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);
			
			// TODO: Use the rfUser.token with your server.
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error)=> {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
				  alert('The token you provided is not valid.');
				} else {
				  console.error("Custom auth error",errorCode,errorMessage);
				}
			  });
		  });
		  
	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			// An error happened.
			console.log("Sign out error",error);
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

   
rhit.checkForRedirects = function () {
	if(document.querySelector("#loginPage")&&rhit.fbAuthManager.isSignedIn){
		window.location.href = "/home.html";
		

	}
	if(!document.querySelector("#loginPage")&&!rhit.fbAuthManager.isSignedIn){
		window.location.href = "/";
	}
}

rhit.initializePage = function () {
	if (!document.querySelector("#loginPage")) {
		new rhit.MenuController();
	}
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	
	// List page
	if (document.querySelector("#listPage")) {
		console.log("This is list page");

		const input = urlParams.get("input");
		const uid = urlParams.get("uid");
		const type = urlParams.get("type");
		console.log(`uid: ${uid}   type: ${type}  input: ${input}`);
		rhit.historyManager = new rhit.HistoryManager(uid); // need to construct this
		let prompt = null;
		switch (type) {
			case "search":
				rhit.songManager = new rhit.SongManager(uid, input); // need to construct this
				
				prompt = "Search result:";
				new rhit.ListPageController(prompt);
				break;
			case "history":
				
				
				
				prompt = "History:";
				new rhit.HistoryPageController(prompt);
				break;
			case "favorite":
				rhit.favoriteManager = new rhit.FavoriteManager(uid); // need to construct this
				
				prompt = "Favorite songs:";
				new rhit.FavoritePageController(prompt);
				break;
			case "works":
				rhit.songManager = new rhit.SongManager(uid, input); // need to construct this
				
				prompt = "Your works: ";
				new rhit.ListPageController(prompt);
				break;
			default:
				// code block
		}
		console.log(type);

		
	}

	// DetailPage
	if (document.querySelector("#detailPage")) {
		console.log("This is detail page");

		const username = urlParams.get("username");
		const songId = urlParams.get("id");
		if (!songId) {
			console.log("Missing song id");
			window.location.href = "/";
		}
		rhit.singleSongManager = new rhit.SingleSongManager(songId,username);
		new rhit.DetailPageController();
		

	}

	// EditPage
	if (document.querySelector("#editPage")) {
		console.log("This is edit page");

		const songId = urlParams.get("id");
		if (!songId) {
			console.log("Missing song id");
			rhit.songManager = new rhit.SongManager(rhit.fbAuthManager.uid, null);
			new rhit.AddPageController();
		}else{
			rhit.singleSongManager = new rhit.SingleSongManager(songId,"");
			new rhit.EditPageController();
		}
	}

	// MyAccountPage
	if (document.querySelector("#myAccountPage")) {
		console.log("This is my account page");
		rhit.userManager = new rhit.UserManager(rhit.fbAuthManager.uid);
		new rhit.AccountPageController();

	}

	// ProfilePage
	if (document.querySelector("#profilePage")) {
		console.log("This is profile page");
		const uid = urlParams.get("uid");
		rhit.userManager = new rhit.UserManager(uid);
		rhit.songManager = new rhit.SongManager(uid,"");
		rhit.historyManager = new rhit.HistoryManager(rhit.fbAuthManager.uid);
		new rhit.ProfilePageController();

	}



	// LoginPage
	if (document.querySelector("#loginPage")) {
		console.log("This is login page");
		rhit.startFirebaseUI();
		new rhit.LoginPageController();
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	//
	rhit.fbAuthManager = new rhit.FbAuthManager();
	
	rhit.fbAuthManager.beginListening(()=>{
		console.log("isSignedIn: ",rhit.fbAuthManager.isSignedIn);
		
		rhit.checkForRedirects();
	
		
		rhit.initializePage();
	});
	


};
rhit.startFirebaseUI = function () {
	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: '#',
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
		// tosUrl and privacyPolicyUrl accept either url string or a callback
		// function.
		// Terms of service url/callback.
		tosUrl: '<your-tos-url>',
		// Privacy policy url/callback.
		privacyPolicyUrl: function () {
			window.location.assign('<your-privacy-policy-url>');
		}
	};

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);
};

rhit.main();
