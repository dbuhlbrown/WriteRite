module.exports = class DocumentPaginationHandler {

	constructor(documentHelper){

		this.list_of_page_ids = documentHelper.list_of_pages;
		this.page_height = documentHelper.page_height;
		this.page_width = documentHelper.page_width
		this.floor_page_height = Math.floor(documentHelper.page_height); //I do this to get a minor buffer of space.
		this.set_listeners();
	}



	set_listeners( ){
		console.log("setting listeners");

		$('.a4').on('input', (e) => {
		// your code here
			this.handle_pagination(e);
		});

	}

	//Triggers on the resize
	handle_pagination(event){

		console.log(event)

		var parent = event.currentTarget.parentNode;
		var divContentHeight = 0;
		$("#"+parent.id+" .a4").children().each(function(){
			divContentHeight = divContentHeight + $(this).outerHeight(true);
		});

		console.log(divContentHeight);
		console.log(this.floor_page_height);

		if( divContentHeight >= this.floor_page_height ){
			console.log("Should move to next page");
		}
		//parent.id gives the parents ID.
	}
}
