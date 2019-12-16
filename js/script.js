var isDrawing = false
var drawnChecker = null
var mapParamChanged = true
var isFirst = true
var autocomplete = new google.maps.places.Autocomplete(document.getElementById('location'));

var monthNames = [
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'
]
var datesInMonths = [
  31,28,31,30,31,30,31,31,30,31,30,31
]

var showMap = 1
var toggleMessage = ["Map Editor", "Map Preview"]


var config = {
  width: 500,
  projection: "airy",
  transform: "equatorial",
  center: [180,0,0],
  location: true,
  follow: false,
  background: { fill:"#000000", stroke:"#000000", width:0 },
  adaptable: false,
  interactive: false,
  form: true,
  fullwidth: false,
  controls: false,
  lang: "en",
  container: "celestial-map",
  stars: {
    show: true,    //Show stars
    colors: false,  //Show stars spectral colors, if not use "color"
    limit: 1000,      // Show only stars brighter than limit magnitude
    style: { fill:"#ffffff", opacity:1 }, // Default style for stars
    names: false,   //Show star names
    namestyle: { fill: "#ddddbb", font: "6px Georgia, Times, serif", align: "left", baseline: "top" },
    proper: false, //Show proper names (if none shows designation)
    propernamestyle: { fill: "#ddddbb", font: "6px Georgia, Times, serif", align: "right", baseline: "bottom" },
    desig: false,   //Show designation (Bayer, Flamsteed, Variable star, Gliese, Draper, Hipparcos, whichever applies first)
    namelimit: 5,   //Maximum magnitude with name
    propernamelimit: 1.5,   //Maximum magnitude with name
    size: 3,       // Maximum size (radius) of star circle in pixels
    exponent: -0.26,  // Scale exponent for star size, larger = more linear
    data: 'stars.6.json' // Data source for stellar data
  },
  planets: {
    show: false,
    // List of all objects to show
    which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"],
    // Font styles for planetary symbols
    style: { fill: "#00ccff", font: "bold 8px Georgia, sans-serif", 
             align: "center", baseline: "middle" },
    symbols: {  // Character and color for each symbol in 'which', simple circle \u25cf
      "sol": {symbol: "\u2609 Sun", fill: "#ffff00"},
      "mer": {symbol: "\u263f mer", fill: "#cccccc"},
      "ven": {symbol: "\u2640 ven", fill: "#eeeecc"},
      "ter": {symbol: "\u2295 ter", fill: "#00ffff"},
      "lun": {symbol: "\u25cf lun", fill: "#ffffff"}, // overridden by generated cresent
      "mar": {symbol: "\u2642 mar", fill: "#ff9999"},
      "cer": {symbol: "\u26b3 cer", fill: "#cccccc"},
      "ves": {symbol: "\u26b6 ves", fill: "#cccccc"},
      "jup": {symbol: "\u2643 jup", fill: "#ff9966"},
      "sat": {symbol: "\u2644 sat", fill: "#ffcc66"},
      "ura": {symbol: "\u2645 ura", fill: "#66ccff"},
      "nep": {symbol: "\u2646 nep", fill: "#6666ff"},
      "plu": {symbol: "\u2647 plu", fill: "#aaaaaa"},
      "eri": {symbol: "\u25cf eri", fill: "#eeeeee"}
    }
  },
  constellations: {
    show: true,    //Show constellations
    names: false,   //Show constellation names
    namestyle: { fill:"#cccc99", align: "center", baseline: "middle", opacity:0.8,
               font: ["bold 10px Helvetica, Arial, sans-serif",  // Different fonts for brighter &
                      "bold 8px Helvetica, Arial, sans-serif",  // sdarker constellations
                      "bold 7px Helvetica, Arial, sans-serif"]},
    desig: true,   //Show short constellation names (3 letter designations)
    lines: true,   //Show constellation lines
    linestyle: { stroke: "#cccccc", width: 1, opacity: 0.6 },
    bounds: false,  //Show constellation boundaries
    boundstyle: { stroke: "#cccc00", width: 0.5, opacity: 0.8, dash: [2, 4] }
  },
  dsos: {
    show: false,    //Show Deep Space Objects
    limit: 16,      //up to maximum magnitude
    names: true,   //Show DSO names
    namestyle: { fill: "#cccccc", font: "6px Helvetica, Arial, serif", align: "left", baseline: "top" },
    desig: true,   //Show short DSO names
    namelimit: 16,   //Maximum magnitude with name
    exponent: 1.4,
    data: "dsos.bright.json"
  },
  mw: {
    show: true,    //Show Milky Way outlines
    style: { fill:"#ffffff", opacity:"0.12" }
  },
  lines: {
    graticule: { show: false, stroke: "#cccccc", width: 0.3, opacity: 0.5,      // Show graticule lines
      // grid values: "outline", "center", or [lat,...] specific position
      // lon: {pos: ["center"], fill: "#eee", font: "6px Helvetica, Arial, sans-serif"},
      // grid values: "outline", "center", or [lon,...] specific position
      // lat: {pos: ["center"], fill: "#eee", font: "6px Helvetica, Arial, sans-serif"}
    },
    equatorial: { show: false, stroke: "#aaaaaa", width: 0.3, opacity: 0.5 },    // Show equatorial plane
    ecliptic: { show: false, stroke: "#66cc66", width: 0.3, opacity: 0.5 },      // Show ecliptic plane
    galactic: { show: false, stroke: "#cc6666", width: 0.3, opacity: 0.5 },     // Show galactic plane
    supergalactic: { show: false, stroke: "#cc66cc", width: 0.3, opacity: 0.5 } // Show supergalactic plane
  }
};

let nd = new Date()

var wallConfig = {
  message: {
    title: '',
    subtitle: '',
    message: '',
    font: 'Lato'
  },
  design: 'circular-design',
  mapOptions: {
    date: `${nd.getFullYear()}-${nd.getMonth()+1}-${nd.getDate()}`,
    color: '#181b25',
    time: '12:00:PM',
    location: {
      label: 'Amsterdam',
      lat: 52.3667,
      lng: 4.8945
    },
    grid: false,
    planetName: false,
    showMK: true,
    constellations: false,
  },
  border: false,
  size: '33.1x46.8 in',
  frame: "yes",
  borderArt: false
}

$("#mobile-view-toggle").click(function() {
  showMap = 1 - showMap
  let pvz = $(".poster-preview").css('z-index')
  let pez = $(".poster-editor").css('z-index')

  $(".poster-preview").css({
    zIndex: pez
  })
  $(".poster-editor").css({
    zIndex: pvz
  })

  $(this).html(toggleMessage[1 - showMap])
})

$(".time-picker").hide()
$("#exact-time-toggle").click(() => {
  $(".time-picker").show()
  $("#exact-time-toggle").hide()
})
$("#PosterForm").accordion({
  heightStyle: "content"
})
for(let i = 1900; i < 2100; i ++) {
  $("#date-year").append(`<option value="${i}">${i}</option>`)
}
for(let i = 0; i < 12; i ++) {
  $("#date-month").append(`<option value="${i}">${monthNames[i]}</option>`)
}
for(let i = 0; i < 31; i ++) {
  $("#date-date").append(`<option value="${i+1}">${i+1}</option>`)
}

for(let i = 1; i <= 12; i ++) {
  $("#time-hour").append(`<option value="${i}">${i}</option>`)
}
for(let i = 0; i < 60; i ++) {
  $("#time-minute").append(`<option value="${i}">${i}</option>`)
}

$("#date-month").click(() => {
  let m = parseInt($("#date-month").val(),10)
  $("#date-date").html('')
  for(let i = 0; i < datesInMonths[m]; i ++) {
    $("#date-date").append(`<option value="${i+1}">${i+1}</option>`)
  }
})

try {
  let str = decodeURI(window.location.hash.slice(1))
  console.log(str)
  cfg = JSON.parse(str)
  wallConfig=cfg
} catch (e) {
  console.log("Url param load failed!", e)
}

function appendUrlParams() {
  let paramsString =  encodeURI(JSON.stringify(wallConfig))
  window.history.pushState("object or string", "Title", `#${paramsString}`);
}

function initializeDropDowns() {
  $(".dropdown").each((idx, el) => {
    let ul = $(`<ul class="list-item" id="${$(el).attr("id")}" ></ul>`)
    $(el).parent().append(ul)
    let firstOption = $(el).children('option').first()
    $(ul).append('<li value="' + $(firstOption).val() + '">'+$(firstOption).text()+'</li>')
    $(el).children('option').each(function() {
      $(ul).append('<li value="' + $(this).val() + '">'+$(this).text()+'</li>')
    })
    $(el).remove()
    $(ul).children().first().addClass('init');
    $(ul).on('click', '.init', function() {
      $(this).closest('.list-item').children('li:not(.init)').toggle()
    })
    var allOptions = $(ul).children('li:not(.init)')
    $(ul).on("click", "li:not(.init)", function() {
        allOptions.removeClass('selected')
        $(this).addClass('selected')
        $(ul).children('.init').html($(this).html())
        allOptions.toggle()
    });
  })
}

// initializeDropDowns()

$(".map-color-item").each((idx, el) => {
  $(el).find('.color-preview').css({
    backgroundColor: $(el).attr('data-value')
  })
})
$("#drawing-now").hide()
$("#border-mask").hide()

function drawMap(conf) {
  isDrawing = true
  $("#drawing-now").fadeIn()
  setTimeout(() => {
    Celestial.display(conf)
    setTimeout(() => {
      Celestial.rotate({center: conf.center})
      $("#drawing-now").fadeOut()
    }, 500)
  }, 1000)
}

function syncForm() {
  $('.map-form-item').each((idx, item) => {
    let key = $(item).attr('data-key')
    let formVal = JSON.parse(JSON.stringify(wallConfig))
    key.split('.').map(k => {
      formVal =formVal[k]
    })
    if ($(item).hasClass('map-form-item--list')) {
      let valueItems = $(item).find('.map-form-item--value')
      $(valueItems).each((idx, vItem) => {
        if (vItem.tagName === 'DIV') {
          $(vItem).removeClass('img-radio-item--active')
        }
        if (vItem.tagName === 'INPUT') {
          $(vItem).attr('checked', false)
        }
        if ($(vItem).attr('data-value') === formVal) {
          if (vItem.tagName === 'DIV') {
            $(vItem).addClass('img-radio-item--active')
          }
          if (vItem.tagName === 'INPUT') {
            $(vItem).attr('checked', true)
          }
        }
      })
    } else {
      $(item).val(formVal)
      if ($(item).attr('type') === 'checkbox') {
        $(item).attr('checked', formVal)
      }
    }
  })
  let d = new Date(`${wallConfig.mapOptions.date} ${wallConfig.mapOptions.time}`)
  let updatedConfig = JSON.parse(JSON.stringify(config))
  updatedConfig.lines.graticule.show = updatedConfig.lines.equatorial.show = wallConfig.mapOptions.grid
  updatedConfig.planets.show = wallConfig.mapOptions.planetName
  updatedConfig.mw.show = wallConfig.mapOptions.showMK
  updatedConfig.constellations.show = wallConfig.mapOptions.constellations
  updatedConfig.background.fill = wallConfig.mapOptions.color
  var c = wallConfig.mapOptions.color.substring(1);      // strip #
  var rgb = parseInt(c, 16);   // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff;  // extract red
  var g = (rgb >>  8) & 0xff;  // extract green
  var b = (rgb >>  0) & 0xff;  // extract blue

  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  if (luma < 70) {
    updatedConfig.stars.style.fill = 
    updatedConfig.mw.style.fill =
    updatedConfig.lines.graticule.stroke = 
    updatedConfig.lines.equatorial.stroke = '#ffffff'
  } else {
    updatedConfig.stars.style.fill = 
    updatedConfig.mw.style.fill =
    updatedConfig.lines.graticule.stroke = 
    updatedConfig.lines.equatorial.stroke = '#000000'
  }
  if (wallConfig.design === 'full-design') {
    if (luma < 70) {
      $("#message-box *").css({
        color: '#ffffff'
      })
      $("#border-mask").css({
        borderColor: '#ffffff'
      })
    } else {
      $("#message-box *").css({
        color: '#000000'
      })
      $("#border-mask").css({
        borderColor: '#000000'
      })
    }
  } else {
    $("#message-box *").css({
      color: '#000000'
    })
    $("#border-mask").css({
      borderColor: '#000000'
    })
  }

  if (wallConfig.design === 'bw-design') {
    updatedConfig.background.fill = '#000'
    updatedConfig.stars.style.fill = '#ffffff'
    updatedConfig.mw.style.fill = '#ffffff'
  }

  $("#message-title").text(wallConfig.message.title || 'Title')
  $("#message-subtitle").text(wallConfig.message.subtitle || 'Subtitle')
  $("#message-message").text(wallConfig.message.message || 'Message')

  $("#message-coordinate").text(`${wallConfig.mapOptions.location.label} ${wallConfig.mapOptions.location.lat}°N  ${wallConfig.mapOptions.location.lng}°E`)
  $("#message-datetime").text(`${monthNames[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`)

  let wWidth = wallConfig.size.split(' ')[0].split('x')[0]
  let wHeight = wallConfig.size.split(' ')[0].split('x')[1]
  let measureUnit = wallConfig.size.split(' ')[1]
  $("#width-indicator").text(`${wWidth} ${measureUnit}`)
  $("#height-indicator").text(`${wHeight} ${measureUnit}`)

  let unit = measureUnit === 'cm'? 1: 2.54
  let baseWidth = 550
  let ratio = parseFloat(wHeight) / parseFloat(wWidth)

  const place = autocomplete.getPlace()
  if (place) {
    wallConfig.mapOptions.location.lat = place.geometry.location.lat()
    wallConfig.mapOptions.location.lng = place.geometry.location.lng()
  }

  updatedConfig.center = Celestial.horizontal(
    new Date(`${wallConfig.mapOptions.date} ${wallConfig.mapOptions.time}`),
    [wallConfig.mapOptions.location.lat, wallConfig.mapOptions.location.lng],
    [0,0],
  )

  if (wallConfig.border) {
    $("#border-mask").show()
  } else {
    $("#border-mask").hide()
  }

  if (wallConfig.borderArt && wallConfig.design !== 'full-design') {
    $("#border-art-mask").show()
    $(".map-preview").addClass('border-art')
  } else {
    $("#border-art-mask").hide()
    $(".map-preview").removeClass('border-art')
  }

  $("#font").val(wallConfig.message.font)

  $("#message-box").attr('data-font', wallConfig.message.font)

  $("#date-year").val(d.getFullYear())
  $("#date-month").val(d.getMonth())
  setTimeout(() => {
    $("#date-date").val(d.getDate())
  },100)
  let h = d.getHours()
  let a = h < 12? 'AM': 'PM'
  h = h % 12 || 12
  $("#time-hour").val(h)
  $("#time-minute").val(d.getMinutes())
  $("#time-ap").val(a)

  updatedConfig.center[1] = 0

  $(".design-mask").hide()
  $(".map-preview").addClass(wallConfig.design)
  $(".map-preview").addClass(`frame-${wallConfig.frame}`)

  switch (wallConfig.design) {
    case 'circular-design':
      break
    case 'full-design':
      updatedConfig.width = 1200
      break
    case 'bw-design':
      $("#design-bw-mask").show()
      $("#color-mask").css({
        backgroundColor: 'transparent'
      })
      break
    case 'heart-design':
      $("#design-heart-mask").show()
      break
  }

  mapParamChanged = mapParamChanged || 
    (parseInt($("#celestial-map canvas").attr('width')) !== updatedConfig.width)

  if (mapParamChanged) {
    setTimeout(() => {
      drawMap(updatedConfig)
    })
  }

  appendUrlParams()
}

syncForm()

function handleChange(ev) {
  if ($(ev.target).hasClass('map-form-item--value'))
    return
  let key = $(ev.target).attr('data-key')
  let val
  let changed
  if ($(ev.target).attr('type') === 'checkbox') {
    val = ev.target.checked
    eval(`changed = wallConfig.${key} !== ${val}`)
    eval(`wallConfig.${key} = ${val}`)
  } else {
    val = ev.target.value
    eval(`changed = wallConfig.${key} !== "${val}"`)
    eval(`wallConfig.${key} = "${val}"`)
  }
  if (!changed)
    return
  mapParamChanged = false
  if (key.indexOf("mapOptions") === 0)
    mapParamChanged = true
  syncForm()
}

$(".map-form-item").blur(function(ev) {
  if ($(this).attr('type') === 'checkbox')
    return
  handleChange(ev)
})
function evHandle(ev) {
  handleChange(ev)
}
$(".map-form-item").on('change textInput input', evHandle)
$(".map-form-item--value").click(function(ev) {
  mapParamChanged = false
  let val = $(this).attr('data-value')
  let key = $(this).closest('.map-form-item').attr('data-key')
  if (key.indexOf("mapOptions") === 0)
    mapParamChanged = true
  if (key === 'design' && val === 'full-design')
    mapParamChanged = true
  if (key === 'design' && val === 'bw-design') {
    mapParamChanged = true
    wallConfig.mapOptions.color = '#000'
  }
  if (key === 'design')
    $(".map-preview").removeClass(wallConfig.design)
  if (key === 'frame')
    $(".map-preview").removeClass(`frame-${wallConfig.frame}`)
  if (key === 'design' && wallConfig.design === 'bw-design') {
    wallConfig.mapOptions.color = '#181b25'
  }
  eval(`wallConfig.${key} = "${val}"`)
  if (wallConfig.design === 'bw-design' && key === 'mapOptions.color') {
    mapParamChanged = false;
    wallConfig.mapOptions.color = '#000'
  }
  syncForm()
})
$(".datetime-select").change(() => {
  wallConfig.mapOptions.date = `${$("#date-year").val()}-${parseInt($("#date-month").val())+1}-${$("#date-date").val()}`
  wallConfig.mapOptions.time = `${$("#time-hour").val()}:${$("#time-minute").val()} ${$("#time-ap").val()}`
  mapParamChanged = true
  syncForm()
})
