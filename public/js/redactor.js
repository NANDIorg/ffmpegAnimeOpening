const player = new Plyr('#player',{
    controls: [
        'mute', // Toggle mute
        'volume' // Volume control
    ]
})
let idOpening

// player.on('loadedmetadata',()=>{
//     rangeInput.max = player.duration
//     jsonop = JSON.parse(localStorage.getItem('openingJSON'))
//     for (el in jsonop) {
//         if (el === idOpening) {
//             rangeInput.value = jsonop[el].startTime
//         }
//     }
//     player.currentTime = Number(rangeInput.value)
// })

// player.on('timeupdate',()=>{
//     if (player.currentTime >= (Number(rangeInput.value)+20)) {
//         player.currentTime = Number(rangeInput.value)
//     }
// })

function create () {
    let tictokCreate = document.getElementById('tictokCreate').checked
    console.log({"openings" : localStorage.getItem('openingJSON'), "tictokCreate" : tictokCreate})
    $.ajax({
        url: "/createVideo",
        type: "POST",
        data: JSON.stringify({"openings" : localStorage.getItem('openingJSON'), "tictokCreate" : tictokCreate}),
        contentType: "application/json",
        success : (res) => {
            console.log(res)
        }
    })
}

function animeChange(picture, video) { 
    // idOpening = id
    player.controls = [
        'play-large', // The large play button in the center
        'play', // Play/pause playback
        'mute', // Toggle mute
        'volume', // Volume control
    ]
    console.log(video.split('/')[3])
    player.source = {
        type: 'video',
        sources: [
            {
                src: `${video.split('/')[3]}`,
                provider: 'youtube',
            }
        ],
        poster : `${picture}`
    }
    player.play()
}

function video () {
    // time.innerText = rangeInput.value
    player.currentTime = Number(rangeInput.value)
    jsonop = JSON.parse(localStorage.getItem('openingJSON'))
    for (el in jsonop) {
        if (el === idOpening) {
            jsonop[el].startTime = Number(rangeInput.value)
        }
    }
    localStorage.setItem('openingJSON',JSON.stringify(jsonop))
}

const arrOpening = JSON.parse(localStorage.getItem('opening'))
htmlTextAnime = ``
jsonOpening = {}
arrOpening.forEach(el => {
    $.ajax({
        url : `/getVideo/${el}`,
        type : 'GET',
        success : function (result) {    
            console.log(result)
            htmlTextAnime += `
                <li class="redactor-content-list__item" id="${result.id}" onclick="animeChange('${result.picture_url}','${result.video_url}')">
                    <div class="redactor-content-list__image">
                        <img src="${result.picture_url}">
                    </div>
                    <div class="redactor-content-list__data">
                        <h4 class="redactor-content-list__title">${result.name_ru}</h4>
                        <date class="redactor-content-list__release">Год выпуска: ${result.year}</date>
                    </div>
                </li>
            `
            animelist.innerHTML = htmlTextAnime
        }
    })
    jsonOpening[el] = {
        id : el,
        startTime : 0
    }
})
animelist.innerHTML = htmlTextAnime
localStorage.setItem('openingJSON',JSON.stringify(jsonOpening))
// console.log(JSON.parse(localStorage.getItem('openingJSON')))