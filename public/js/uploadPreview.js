let uploadFile = document.getElementsByClassName('upload__file');

Array.from(uploadFile).forEach(elem => {
    elem.onchange = function () {
        let uploadFill = elem.previousElementSibling;
        let [file] = elem.files;
        if(file) {
            uploadFill.innerHTML = `
            <div class="upload__blackover"></div>
            <img src="${URL.createObjectURL(file)}">
            `;
            uploadFill.classList.add('upload__fill_change')
        }
    }
});
