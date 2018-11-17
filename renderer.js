// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var {ipcRenderer, remote} = require('electron');  
var main = remote.require("./main.js");
let rulerGenerator = require("./src/ruler_generator.js");
let DocumentPaginationHandler = require("./src/document_pagination_handler.js");
const printer = require('electron-print');
const fs = require('fs');

class DocumentHelper{

	constructor(){

		this.first_page_html = "<div class='individual-page' id='first-page'><div class='a4-header page'></div> <div class='a4 page' contenteditable='true' role='textbox'><div><br></div><div></div></div><div class='a4-footer page'></div> </div>";
		this.default_font = "";
	}

	//We can actually hardcode this to just grab any page, because every page should
	//always have the same height.
	calculate_page_values(){

		this.page_height = $(".a4").height();
		this.page_width = $(".a4").width();
		this.list_of_pages = Array("first-page"); //first-page is special, the rest of the pages will be page-1, page-2, etc.

	}
}

ipcRenderer.on('newFile2Edit', (event, message) => {
    console.log("Need to create new file"); // logs out "Hello second window!"
    createNewDocument();

})

ipcRenderer.on('noRecentFiles', (event,message) => {
	console.log("before addEventListener");
	setup_listener();

})


//Since only the renderer can access the mainWindow, we will grab all of the
//HTML we need and return the string.
ipcRenderer.on('returnHtmlCode', (event,message) => {
	
	//var JSONPdfSettings = "";
	var HTMLString = "<html><head>"+$("head").html()+"</head><body>" + $(".individual-page").html() + "</body></html>";

	ipcRenderer.send("setupHTMLFileAndPrintToPDF",HTMLString);

})

//Since only the renderer can access remote, we just send the pdf print data through message
ipcRenderer.on('writePDF', (event,message) => {
	
	remote.dialog.showSaveDialog(remote.getCurrentWindow(), (filename) => {

		//This is properly a poor way to do this
		if (filename.search(".pdf") == -1){
			filename = filename+".pdf";
		}

    	fs.writeFileSync(filename, message);
    	console.log("afterwrite");

    }); 

})

function setup_listener( ){

	document.querySelector('#create-new-file-link').addEventListener('click', createNewDocument)
}

function createNewDocument(){

	const documentHelper = new DocumentHelper();

	//This sets up everything for the new document to be created
	//If we are loading a document, this would be handled differently
	$(".document-editor").empty();
	$(".home-screen").hide();
	$(".document-editor").show();
	//background-color: #eee;
	$("html, body").css("background-color","#eee");
	$(".document-editor").append("<div class='document'>"+documentHelper.first_page_html+"</div>");


	//When a new document is made when we need to set up some objects
	//This might need to work differently when loading files
	const ruler = new rulerGenerator("auto","auto",21);
	
	documentHelper.calculate_page_values();
	const document_pagination_handler = new DocumentPaginationHandler(documentHelper);

	ipcRenderer.send("OpenDocumentWriter");
	
}
