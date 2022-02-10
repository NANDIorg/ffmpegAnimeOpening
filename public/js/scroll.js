const filtersBlock = document.querySelector('.filters');
const pageUp = document.querySelector('.page-up');

window.addEventListener('scroll', function () {
    toFixElement(filtersBlock);

    (window.pageYOffset > 300) ? pageUp.classList.add('page-up_show') : pageUp.classList.remove('page-up_show');
});

function toFixElement(elem) {
    if (window.pageYOffset > 300) {
        elem.style.transform = `translateY(${window.pageYOffset - 300}px)`;
    } else {
        elem.style.transform = `translateY(0)`;
    }
}

pageUp.onclick = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}