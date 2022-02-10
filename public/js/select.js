let selects = document.getElementsByClassName('select__wrapper');

Array.from(selects).forEach(select => {
    select.onclick = function () {
        let selectList = select.querySelector('.select-list');
        let selectButton = select.querySelector('.select__button');
        let selectValue = selectButton.querySelector('span');
        let selectItems = select.querySelector('.select-list');
        
        Array.from(selectItems.children).forEach(item => {
            item.onclick = function () {
                selectValue.innerHTML = item.innerHTML;
                selectButton.dataset.value = item.innerHTML;
            }
        });

        selectButton.classList.toggle('select__button_active');
        selectList.classList.toggle('select-list_show');
    }
});

