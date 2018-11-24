module.exports = class DocumentPaginationHandler {

	constructor(documentHelper){

		this.list_of_page_ids = documentHelper.list_of_pages;
		this.page_height = documentHelper.page_height;
		this.page_width = documentHelper.page_width
		this.documentHelper = documentHelper
		this.floor_page_height = Math.floor(documentHelper.page_height); //I do this to get a minor buffer of space.
		this.current_div_height = 0;
		this.set_listeners();

	}



	set_listeners( ){
		console.log("setting listeners");


		$('.a4').on('input', (e) => {
		// your code here
			console.log("Handling pagination");
			this.handle_pagination(e);
		});


		

	}

	//Triggers on the resize
	handle_pagination(event){

		console.log(event);
		console.log(document.activeElement)
		//This grabs the parent of the current editable div we just added something too
		//We use this to find the siblings of the div
		var parent = "#" + event.currentTarget.parentNode.id + " .a4";
		//console.log("parent = " + parent)

		//console.log(divContentHeight);
		//console.log(this.floor_page_height);

		//This code seems decent, need to write tests

		if( this.calculate_height(parent) >= this.floor_page_height ){
			console.log("Should move to next page");

			//In the future I need to handle new lines on dialogue, like adding the CHARACTER(CONT.)
			//I can create two functions to handle it differently for plays/screenplays.
			//If the parent's parent has no sibling, then we must create a new page.
			if( $($(parent)[0].parentNode).next().length == 0 ){

				console.log("Need to insert a new page");
				
				$("#document-holder")[0].innerHTML = $("#document-holder")[0].innerHTML + (this.documentHelper.generate_following_page())
								
				this.set_listeners();
			}

			//This code triggers whether or not we have a parent
			var pageToMoveTo = $($(parent)[0].parentNode).next();
			var contentToMove = this.retrieve_last_inserted_content_and_delete(parent)
			pageToMoveTo.children(".a4").prepend(contentToMove);
			

			this.placeCaretAtEnd(pageToMoveTo.children(".a4").children()[0]);
			
		} 
		
	}
	
	//returns the height of all elements inside the div, in this case
	//whatever contenteditable div is passed in.
	calculate_height(parent){

		var tmpHeight = 0;
		$(parent).children().each(function(){
			tmpHeight += $(this).outerHeight(true);
		});

		return tmpHeight;
	}

	//Need to recode this since I changed a lot above.
	//I also need to continue removing divs, until the height is correct.
	retrieve_last_inserted_content_and_delete(parent){

		var content = $(parent)[0].lastChild.textContent;
		$(parent)[0].lastChild.remove();

		return "<div>" + content + "</div>";		
	}	


	placeCaretAtEnd(el) {
	    el.focus();
	    if (typeof window.getSelection != "undefined"
	            && typeof document.createRange != "undefined") {
	        var range = document.createRange();
	        range.selectNodeContents(el);
	        range.collapse(false);
	        var sel = window.getSelection();
	        sel.removeAllRanges();
	        sel.addRange(range);
	    } else if (typeof document.body.createTextRange != "undefined") {
	        var textRange = document.body.createTextRange();
	        textRange.moveToElementText(el);
	        textRange.collapse(false);
	        textRange.select();
	    }
}

}
