module.exports = class DocumentPaginationHandler {

	constructor(documentHelper){

		this.list_of_page_ids = documentHelper.list_of_pages;
		this.page_height = documentHelper.page_height;
		this.page_width = documentHelper.page_width
		this.documentHelper = documentHelper;
		this.floor_page_height = Math.floor(documentHelper.page_height); //I do this to get a minor buffer of space.
		this.current_div_height = 0;

		//This helps us keep track of the list div changed
		this.last_div_added_or_changed = null;
		this.set_listeners();

	}

	set_listeners( ){
		console.log("setting listeners");


		//This listener handles the actual pagination needs
		$('.content-area').on('input', (e) => {
		// your code here
			console.log("Handling pagination");
			this.handle_pagination(e);

		});

		//this listener handles hotkeys
		$('.content-area').on('keydown', (e) => {
		// your code here
			console.log("Handling keystroke");
			this.handle_keystrokes(e);

		});


		/*
		$('.a4').on('DOMCharacterDataModified ', (e) => {
		
			console.log("Handling pagination");
			this.handle_pagination(e);
			e.stopPropagation();
		});*/

		//If our .a4 dom changes, we trigger an event.
		$('.content-area').on('DOMSubtreeModified ', (e) => {
		// your code here
			this.last_div_added_or_changed = e.originalEvent.path[0]

			if( this.last_div_added_or_changed.nodeType == 3){

				this.last_div_added_or_changed = e.originalEvent.path[1]
			}

		});
	}

	handle_keystrokes(event){

		var key = event.keyCode || event.charCode;
		var parent = "#" + event.currentTarget.parentNode.id + " .content-area";

		if( key == 8 || key == 46 ) {
			if($(parent)[0].textContent ==  "" && 
			   event.currentTarget.parentNode.id != "page-1" &&
			   $(parent)[0].innerHTML.length < 27
			   ){
				console.log("inside delete if");
				var lastDiv = $($($(event.currentTarget.parentNode)[0].previousSibling).children(".content-area")[0])[0].lastChild;
				lastDiv.innerText += "Q";
				console.log(lastDiv)
				//this.placeCaretAtEnd($($(event.currentTarget.parentNode)[0].previousSibling).children(".content-area")[0]);
				this.placeCaretAtEnd(lastDiv);
				
				event.currentTarget.parentNode.remove();	
				delete(this.list_of_page_ids.indexOf($(event.currentTarget.parentNode.id)))
			
			} else{
			
				console.log("in if");
				var sel = window.getSelection( );
				console.log(sel);
				sel.deleteContents();
			
			}
			
		
		} 
	}

	//Triggers on the resize
	handle_pagination(event){

		//console.log(event);
		//This grabs the parent of the current editable div we just added something too
		//We use this to find the siblings of the div
		var parent = "#" + event.currentTarget.parentNode.id + " .content-area";

		//to prevent future changes to the last edited div (like when the pages are recreated)
		//we store the value when handle_pagination is called
		var last_div_added_or_changed = this.last_div_added_or_changed;
		
		//to prevent future changes to the last child of this page (like when we move content)
		//we store the value when the handle_pagination is called
		var lastInputChild = $(parent)[0].children[ $(parent)[0].children.length-1 ];
		
		//This code seems decent, need to write tests
		if( this.calculate_height(parent) >= this.floor_page_height ){
			console.log("Should move to next page");

			//In the future I need to handle new lines on dialogue, like adding the CHARACTER(CONT.)
			//I can create two functions to handle it differently for plays/screenplays.
			//If the parent's parent has no sibling, then we must create a new page.
			if( $($(parent)[0].parentNode).next().length == 0 ){

				console.log("Need to insert a new page");
				this.documentHelper.list_of_pages.push(0)
				$("#document-holder")[0].innerHTML = $("#document-holder")[0].innerHTML + (this.documentHelper.generate_following_page())
				this.documentHelper.list_of_pages.pop()
				this.documentHelper.list_of_pages.push($($("#document-holder")[0].lastChild)[0])
				this.set_listeners();

			}

			//This code triggers whether or not we have a parent
			var pageToMoveTo = $($(parent)[0].parentNode).next();
			var contentToMove = this.retrieve_last_inserted_content_and_delete(parent)
			pageToMoveTo.children(".content-area").prepend(contentToMove);
			
			//If the last edited div, is the last child of the page
			//we will move our caret.	
			if ( $(lastInputChild).is( $(last_div_added_or_changed) ) ){
				this.placeCaretAtEnd(pageToMoveTo.children(".content-area").children()[0]);

			} else{
				console.log("no need to move cursor");
				console.log(lastInputChild);
				console.log('last div changed');
				console.log(last_div_added_or_changed)
			}
		
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

		//we are trying to copy innerHTML, instead of just text content
		//to keep whitespace
		var content = $(parent)[0].lastChild.innerHTML;
		console.log(content);
		$(parent)[0].lastChild.remove();

		if (content != "<br>")
			return "<div>" + content + "</div>";	
		else
			return "<div></div>";	
	}	


	placeCaretAtEnd(el) {
		console.log("changing caret");
	    el.focus();
	    if (typeof window.getSelection != "undefined"
	            && typeof document.createRange != "undefined") {
	        var range = document.createRange();
	        range.selectNodeContents(el);
	        range.collapse(false);
	        range.setStartAfter(el)
	        console.log(range)
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
