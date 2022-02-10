const nameAnimeParm = document.getElementById('nameAnimeParm')
const yearFilter = document.getElementById('yearFilter')
const seasonFilter = document.getElementById('seasonFilter')
const list_anime = document.getElementById('list_anime')

const genresArray = []

let checkboxList = document.getElementsByClassName('checkbox');
const imagePath = "image/check_mark.svg";
const checkMark = `<img src="${imagePath}">`;



function setOnClickCheckbox() {
    Array.from(checkboxList).forEach(elem => {
        elem.onclick = setCheckbox
    });
}

function setCheckbox(e) {

    if(e.currentTarget.dataset.checked == "1") {
        e.currentTarget.firstElementChild.innerHTML = '';
        e.currentTarget.dataset.checked = "0";
        let i = genresArray.indexOf(e.currentTarget.id)
        genresArray.splice(i, 1)
        getVideosParametr()
        return;
    }

    genresArray.push(e.currentTarget.id)

    getVideosParametr()

    e.currentTarget.dataset.checked = "1";
    e.currentTarget.firstElementChild.innerHTML = checkMark;
   
}

function getVideosParametr() {
    $.ajax({
        url: `/getVideosParametr?genres=${JSON.stringify(genresArray)}&name=${nameAnimeParm.value}&seasonFilter=${seasonFilter.dataset.value}&yearFilter=${yearFilter.value}`,
        type: "GET",
        success: (result) => {
            htmlText = ""
            result.forEach(el => {
                let genres = ""
                JSON.parse(el.genres).forEach(el2 => {
                    genres += ', ' + el2 + ''
                })
                let genresArr = genres.split('')
                genresArr.splice(0,1)
                htmlText += `
                    <li class="videos__item" onclick="video(this.id)" id="${el.id}">
                        <div class="videos__image">
                            <img src="screnshot/${el.id}.png">
                        </div>
                        <div class="videos__info">
                            <h2 class="videos__title">${el.name_ru}</h2>
                            <p class="videos__genres">Жанры: ${genresArr.join('')}</p>
                            <date class="videos__release">Год выпуска: ${el.year}</date>
                        </div>
                    </li>`
            })
            list_anime.innerHTML = htmlText
        }
    })
}