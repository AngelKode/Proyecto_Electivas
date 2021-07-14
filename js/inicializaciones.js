const verArchivo = () => {
    //Al darle click al icono, mostramos el modal con el PDF
    $('#modal_archivo_subido').modal('show');
}

$(document).ready(() => {

    $("#date_picker_inicio").datepicker({
        autoclose: true,
        container: '#date_picker_inicio'
    });

    $("#date_picker_fin").datepicker({
        autoclose: true,
        container: '#date_picker_fin'
    });

    $(".btn-group.bootstrap-select").css({
        "top":"5px"
    });

    //Obtenemos los botones que tengan la clase para poder observar el archivo que subieron
    let view_files = [...document.getElementsByClassName("view_uploaded_file")];

    //Para cada uno de ellos, agregamos un listener
    view_files.forEach((element) => {
        element.addEventListener('click',verArchivo,true);
    })

})