# Web app link: 
https://ledq-project.web.app/
# CleFer helps users by:
- Finding songs and their corresponding chords and lyrics for guitar players
- Contributing their own contents to help others
- Creating a community that helps learning and practicing guitar easier

# Tools and APIs: 
- Used Firebase for hosting
- Authentication (Firebase Auth)
- Database (Firestore), and cloud storage (Firebase Storage) for image storing

# Search performance:

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


Future Improvement: 
- Firebase suggests using third-party search services such as Algolia, Elastic, or Typesense for full-text search. 
- I also found this tiny but powerful search engine written in Javascript, which can be easily imported by using CDN: https://github.com/lucaong/minisearch



