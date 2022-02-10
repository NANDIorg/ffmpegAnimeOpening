const backMainPage = document.querySelector('.page__back');
const videoControlsItems = document.querySelector('.video-controls__item');
const navButtonsItem = document.querySelectorAll('.nav-buttons__item');

Array.from(navButtonsItem).forEach(button => {
    button.onclick = navigate;
});

(backMainPage) ? backMainPage.onclick = back : '';

function navigate(elem) {
    switch(elem.currentTarget.dataset.url) {
        case "youtube":
            location.href = '/pattern_youtube';
            break;
        case "tiktok":
            location.href = '/pattern_tiktok';
            break;
        case "upload":
            location.href = '/upload'
            break;
        default:
            location.href = '/pagenotfound';
            break;
    }
}

function back() {
    location.href = '/'
}