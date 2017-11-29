const electron = require('electron')
const {ipaddress, scan, print,} = require('./localserver/printer.js');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const axios = require('axios');
let mainWindow
const {ipcMain} = require('electron')
ipcMain.on('mealorderupdated', async (event, args) => {
	if (!args) {
		return false
	}
	let mealorderresult = await axios.post('http://nm.etao.cn/api/graphql', {
		query: `query ($id: Int!) { mealorder(id: $id) { id mealcode deskcode supplier { name } created(fmt: "YYYY-MM-DD HH:mm:ss") paymentmethod { name } customer { name nickname } customernotes mealorderdetail { id quantity price total dishattr{ name } dish{ name } } total customertotal } }`,
		operationName: '',
		variables: {
			id: args.id
		}
	})
	let mealorder = mealorderresult.data.data.mealorder[0]
	if (mealorder.paymentstatus === 0) {
		'订单未支付'
		return false
	}
	print(mealorder, '172.18.13.250')
	console.log(mealorder);
})
ipcMain.on('printer.print', (event, args) => {
	let {ip, port, data,} = JSON.parse(args);
	print(ip, port, data)
})
ipcMain.on('printer.init', (event, args) => {
	scan(function(result) {
		mainWindow.webContents.send('printer.init', result)
	})
})
function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
	})
	// and load the index.html of the app.
	mainWindow.loadURL(`http://nbw.b.etao.cn/`)
	// mainWindow.loadURL(url.format({
	// 	pathname: path.join(__dirname, 'index.html'),
	// 	protocol: 'file:',
	// 	slashes: true,
	// }))
	// Open the DevTools.
	mainWindow.webContents.openDevTools()
	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
	// mainWindow.once('ready-to-show', () => {
	//     mainWindow.show()
	// })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
// Quit when all windows are closed.
app.on('window-all-closed', function() {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
app.on('activate', function() {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
