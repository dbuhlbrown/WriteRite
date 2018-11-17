// Modules to control application life and create native browser window

/*Addons I use
https://github.com/nathanbuchar/electron-settings
https://www.npmjs.com/package/fs-extra
*/

const {app, BrowserWindow, Menu, ipcMain , dialog,ipcRenderer} = require('electron')
const database_handler = require("./src/database_handler.js")
const db = require('electron-db');
const fs = require('fs');
const ElectronPDF = require('electron-pdf')
//var customMenu = require('./src/mainMenu');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
//Print example: printer.print("Text sent to printer.")
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 1200})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  //Once the dom is loaded we send the noRecentFiles message
  mainWindow.webContents.once('dom-ready', () => {
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    var succ
    var data
    db.getAll('recent_files', (succ, data)=>{
      //Doesn't work
      console.log("before send noRecentFiles")
      console.log(mainWindow)
      mainWindow.webContents.send('noRecentFiles')

    })
  })
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null

  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

const menuTemplate = [ {
          label: 'File',
          submenu: [
            {
                label: 'New',
                accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
                click: () => {
                    mainWindow.webContents.send('newFile2Edit');
                }
            },
            {
                label: 'Open',
                accelerator: process.platform === 'darwin' ? 'Command+O' : 'Ctrl+O',
                click: () => { 
                    mainWindow.webContents.send('openNewFile');
                }
            },
            {
                label: 'Save',
                accelerator: process.platform === 'darwin' ? 'Command+S' : 'Ctrl+S',
                click: () => {   
                    mainWindow.webContents.send('saveCurrentFile');
                }
            },
            {
                label: 'Export to PDF',
                click: ()=>{
                 
                  //Tells the renderer.js to a return a string containing all of the HTML code to be printed
                  mainWindow.webContents.send('returnHtmlCode');
                }
            },
            {
                label: 'Print',
                accelerator: process.platform === 'darwin' ? 'Command+P' : 'Ctrl+P',
                click: () => {   
                     mainWindow.webContents.print();
                }
            },
            {
              label: 'Quit',
              accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
              click: () => { app.quit(); }
            }
          ]
        },
        {
            label: 'Edit',
            submenu: [
              {
                  label: 'Undo',
                  accelerator: process.platform === 'darwin' ? 'Command+Z' : 'Ctrl+Z',
                  click: () => { mainWindow.webContents.send('editorDoUndo'); }
              },
              {
                label: 'Redo',
                accelerator: process.platform === 'darwin' ? 'Command+Shift+Z' : 'Ctrl+Shift+Z',
                click: () => { mainWindow.webContents.send('editorDoRedo'); }
              },
              {type: 'separator'},
              {role: 'cut'},
              {role: 'copy'},
              {role: 'paste'},
              {role: 'pasteandmatchstyle'},
              {role: 'delete'},
              {
                  label: 'Select All',
                  accelerator: process.platform === 'darwin' ? 'Command+A' : 'Ctrl+A',
                  click: () => { mainWindow.webContents.send('editorSelectAll'); }
              }
            ]
        },
        {
            label: 'View',
            submenu: [
              {role: 'reload'},
              {role: 'forcereload'},
              {role: 'toggledevtools'},
              {type: 'separator'},
              {role: 'resetzoom'},
              {role: 'zoomin'},
              {role: 'zoomout'},
              {type: 'separator'},
              {role: 'togglefullscreen'}
            ]
        },
        {
            role: 'window',
            submenu: [
              {role: 'minimize'},
              {role: 'close'}
            ]
        }
    ];
      
    if (process.platform === 'darwin') {
        menuTemplate.unshift({
            label: app.getName(),
            submenu: [
              {role: 'about'},
              {type: 'separator'},
              {role: 'services', submenu: []},
              {type: 'separator'},
              {role: 'hide'},
              {role: 'hideothers'},
              {role: 'unhide'},
              {type: 'separator'},
              {
                role: 'quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q'
              }
            ]
        });
    }


const mainMenu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(mainMenu);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  console.log("activating");
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.
    console.log("inside activate");
  }

})

ipcMain.on('OpenDocumentWriter', (event, message) => {
    //mainWindow.loadFile('document_writer.html')
    
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.send('documentWriterOpen')
  })
    
})


//Writes out the PDF by creating a new hidden BrowserWindow to hold
//the HTML file.
ipcMain.on("setupHTMLFileAndPrintToPDF", (event,message) =>{

  fs.writeFileSync("./for_print.html",message);

  //FUTURE: These settings need to come from the database when a file is opened. 
  //They will be set as sessionStorage(? not sure it's a thing) variables

  var paperSizeArray = ["A4", "A5"];
  var option = {
    landscape: false,
    marginsType: 1,
    printBackground: false,
    printSelectionOnly: false,
    pageSize: paperSizeArray[0],
  };

  //This creates a fake window for the HTML we returned from the renderer
  window_to_PDF = new BrowserWindow({show : false});
  window_to_PDF.loadFile('for_print.html');
  
  //We use the .once dom-ready to make sure the hidden window is fully loaded before
  //we try to print it.
  window_to_PDF.webContents.once('dom-ready', () => {

    window_to_PDF.webContents.printToPDF(option, function(err, data) {

        if (err) {
            //do whatever you want
            console.log(err)
            return ;
        }
        try{
            console.log("before sendingwritePDF")
            mainWindow.webContents.send("writePDF",data);
            //Since only renderer can use the writeFileSync we send the printtopdf data along with the message

            
        }catch(err){
            //unable to save pdf..
            console.log(err)
        }
       
    })
  });

});