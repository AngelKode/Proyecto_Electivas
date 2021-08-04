$(document).ready(() => {
    //Al cambiar si la constancia es válida o no
    $("#isValidaConstancia").on('change', ({currentTarget}) => {
        const isDisabled = (parseInt(currentTarget.value) === 3) ? true : false;
      
        //De acuerdo si es valida o no, habilitamos/deshabilitamos el select para la denominacion   
        $("#denominacionConstancia").prop('disabled', isDisabled);

        //Refrescamos el select-picker
        $("#denominacionConstancia").selectpicker('refresh');    
    });

})
