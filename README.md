# CleFer
Search Function, Text Parser, and Many-to-Many Relationships in Firestore


Overview:

The project helps find songs with chords and also creates content to share with other users. 


Search function:

One of the main features of this web app is the search function, which allows users to search for their desired songs. This can be achieved by simply using indexOf() method of JS String. 

_search() {


        if (this._input) { // Searching needed
            for (let i = 0; i < this._rawDocumentSnapshots.length; i++) {
                const documentSnapshot = this._rawDocumentSnapshots[i];
                if (documentSnapshot.get(rhit.FB_KEY_SONG_NAME).toLowerCase().indexOf(this._input) > -1) {
                    this._documentSnapshots.push(documentSnapshot);
                }
            }
        } else { // No searching needed
            this._documentSnapshots = this._rawDocumentSnapshots;
        }
}


Note: This is the title search only, not a full-text search. Although we can do full-text search via this method, it might not be efficient. 


Recommendation: 
Firebase suggests using third-party search services such as Algolia, Elastic, or Typesense for full-text search. 
I also found this tiny but powerful search engine written in Javascript, which can be easily imported into your projects by using CDN (with script tag).

Text-parser:

This feature helps users create their own chords and lyric combinations. 


 

Again, this is done by using a Javascript String method: split() and regex (regular expression), I use the square brackets [ ] in this case. This is how I write the square brackets [] in string: 

rhit.REGEX = /\[(.*?)\]/g;

    _createLyrics(line) {
        const parsedLine = line.split(rhit.REGEX);
        let htmlString = ``;
        for (let i = 0; i < parsedLine.length; i++) {
            if (i % 2 == 0) {
                if (parsedLine[i] != "") {
                    const lyrics = `<span class="lyric">${parsedLine[i]}</span>`;
                    htmlString += lyrics;
                }
            } else {
                const chord = `<span class="chord-inline">
                                    <span class="chord">${parsedLine[i]}</span>
                               </span>`;


                htmlString += chord;
            }
        }
        return htmlToElement(`<div class="chord-lyric-line">${htmlString}</div>`);
    }


The split() method separates the strings inside and outside and puts them into an array

After splitting up the chords and lyrics, now we can use HTML and CSS on them.


Many-to-Many relationships:

There is a feature in this app using many-to-many relationships, which is the History. Since one user can view many songs and a song can have many viewers. To store such many-to-many relationships in Firestore, it might be difficult to keep track of and update the data on the changes in just one of these two entities if we only store the history on the User or the Song collection. To avoid data duplications, we need a new collection called History, which stores both userId and songId. These can be used as foreign keys although Firestore doesn’t support foreign keys.

The History collection does not need the UPDATE function since it only needs the ids and timestamps as well and its core function doesn’t allow that. My History collection also has “username” and “songName” fields but these don’t need to be updated for the sake of “history”.


