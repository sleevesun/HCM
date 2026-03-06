;(function (wm) {
	window.wmdivs = []
	var loadMark = function (settings) {
		var defaultSettings = {
			wmtxt: '测试水印',
			wmx: 20,
			wmy: 20,
			wmrows: 0,
			wmcols: 0,
			wmxspace: 100,
			wmyspace: 50,
			wmfont: '微软雅黑',
			wmcolor: 'black',
			wmfontsize: '18px',
			wmalpha: 0.35,
			wmwidth: 150,
			wmheight: 100,
			wmangle: 15,
		}
		if (arguments.length === 1 && typeof arguments[0] === 'object') {
			var src = arguments[0] || {}
			for (key in src) {
				if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) continue
				else if (src[key]) defaultSettings[key] = src[key]
			}
		}
		if (window.wmdivs && window.wmdivs.length > 0) {
			document.body.removeChild(document.getElementById('otdivid'))
			window.wmdivs = []
		}
		var page_width = Math.max(document.body.scrollWidth, document.body.clientWidth)
		var page_height = Math.max(document.body.scrollHeight, document.body.clientHeight)
		var oTemp = document.createDocumentFragment()
		var otdiv = document.getElementById('otdivid')
		if (!otdiv) {
			otdiv = document.createElement('div')
			otdiv.id = 'otdivid'
			otdiv.style.pointerEvents = 'none'
			otdiv.style.position = 'absolute'
			otdiv.style.width = '100%'
			otdiv.style.left = 0
			otdiv.style.top = 0
			otdiv.style['overflow-x'] = 'hidden'
			document.body.appendChild(otdiv)
		}
		if (
			defaultSettings.wmcols == 0 ||
			parseInt(
				defaultSettings.wmx +
					defaultSettings.wmwidth * defaultSettings.wmcols +
					defaultSettings.wmxspace * (defaultSettings.wmcols - 1),
			) > page_width
		) {
			defaultSettings.wmcols = parseInt(
				(page_width - defaultSettings.wmx + defaultSettings.wmxspace) /
					(defaultSettings.wmwidth + defaultSettings.wmxspace),
			)
			if (defaultSettings.wmcols - 1 >= 1) {
				defaultSettings.wmxspace = parseInt(
					(page_width - defaultSettings.wmx - defaultSettings.wmwidth * defaultSettings.wmcols) /
						(defaultSettings.wmcols - 1),
				)
			}
		}
		if (
			defaultSettings.wmrows == 0 ||
			parseInt(
				defaultSettings.wmy +
					defaultSettings.wmheight * defaultSettings.wmrows +
					defaultSettings.wmyspace * (defaultSettings.wmrows - 1),
			) > page_height
		) {
			defaultSettings.wmrows = parseInt(
				(defaultSettings.wmyspace + page_height - defaultSettings.wmy) /
					(defaultSettings.wmheight + defaultSettings.wmyspace),
			)
			if (defaultSettings.wmrows - 1 >= 1) {
				defaultSettings.wmyspace = parseInt(
					(page_height - defaultSettings.wmy - defaultSettings.wmheight * defaultSettings.wmrows) /
						(defaultSettings.wmrows - 1),
				)
			}
		}
		var x
		var y
		for (var i = 0; i < defaultSettings.wmrows; i++) {
			y = defaultSettings.wmy + (defaultSettings.wmyspace + defaultSettings.wmheight) * i
			for (var j = 0; j < defaultSettings.wmcols + 1; j++) {
				x = defaultSettings.wmx + (defaultSettings.wmwidth + defaultSettings.wmxspace) * j
				var mask_div = document.createElement('div')
				var oText = document.createTextNode(defaultSettings.wmtxt)
				mask_div.appendChild(oText)
				mask_div.id = 'mask_div' + i + j
				mask_div.style.webkitTransform = 'rotate(-' + defaultSettings.wmangle + 'deg)'
				mask_div.style.MozTransform = 'rotate(-' + defaultSettings.wmangle + 'deg)'
				mask_div.style.msTransform = 'rotate(-' + defaultSettings.wmangle + 'deg)'
				mask_div.style.OTransform = 'rotate(-' + defaultSettings.wmangle + 'deg)'
				mask_div.style.transform = 'rotate(-' + defaultSettings.wmangle + 'deg)'
				mask_div.style.visibility = ''
				mask_div.style.position = 'absolute'
				mask_div.style.left = x + 'px'
				mask_div.style.top = y + 'px'
				mask_div.style.overflow = 'hidden'
				mask_div.style.zIndex = '9999'
				mask_div.style.opacity = defaultSettings.wmalpha
				mask_div.style.fontSize = defaultSettings.wmfontsize
				mask_div.style.fontFamily = defaultSettings.wmfont
				mask_div.style.color = defaultSettings.wm_color
				mask_div.style.textAlign = 'center'
				mask_div.style.width = defaultSettings.wmwidth + 'px'
				mask_div.style.height = defaultSettings.wmheight + 'px'
				mask_div.style.display = 'block'
				otdiv.appendChild(mask_div)
				window.wmdivs.push(otdiv)
			}
		}
		otdiv.style.height = (page_height || defaultSettings.wmrows * 150) + 'px'
		document.body.appendChild(oTemp)
	}
	wm.init = function (settings) {
		window.onload = function () {
			loadMark(settings)
		}
		window.onresize = function () {
			loadMark(settings)
		}
	}
	wm.load = function (settings) {
		loadMark(settings)
	}
})((window.wm = {}))

function formatTime(val) {
	if (val >= 0 && val <= 9) return '0' + val
	return val
}
function getNowFormatDate() {
	var date = new Date()
	var seperator1 = '-'
	var seperator2 = ':'
	var month = formatTime(date.getMonth() + 1)
	var strDate = formatTime(date.getDate())
	var hour = formatTime(date.getHours())
	var minutes = formatTime(date.getMinutes())
	var seconds = formatTime(date.getSeconds())
	var currentdate =
		date.getFullYear() +
		seperator1 +
		month +
		seperator1 +
		strDate +
		' ' +
		hour +
		seperator2 +
		minutes +
		seperator2 +
		seconds
	return currentdate
}
