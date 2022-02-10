let checkboxList = document.getElementsByClassName('checkbox');
const imagePath = "image/check_mark.svg";
const checkMark = `<img src="${imagePath}">`;

const genresArray = []

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
        return;
    }
    genresArray.push(e.currentTarget.id)

    e.currentTarget.dataset.checked = "1";
    e.currentTarget.firstElementChild.innerHTML = checkMark;
   
}