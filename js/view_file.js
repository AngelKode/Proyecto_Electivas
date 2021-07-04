const verArchivo = () => {
    //Al darle click al icono, mostramos el modal con el PDF
    $('#modal_archivo_subido').modal('show');
}

$(document).ready(() => {
    //Obtenemos todos los elementos para ver el archivo
    let view_file = document.getElementsByClassName("view_file");
    //Convertimos el HTMLCollection a un array
    let array_view_file = [...view_file];

    //Para cada elemento, agregamos un listener
    array_view_file.forEach(element => {
        element.firstElementChild.addEventListener('click',verArchivo,true);
    });
});


