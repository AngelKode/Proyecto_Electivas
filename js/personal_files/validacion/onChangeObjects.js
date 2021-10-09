$(document).ready(() => {
    //Al cambiar si la constancia es válida o no
    if($("#isValidaConstancia")){
        $("#isValidaConstancia").on('change', ({currentTarget}) => {
            const isDisabled = (parseInt(currentTarget.value) === 3) ? true : false;
          
            //De acuerdo si es valida o no, habilitamos/deshabilitamos el select para la denominacion   
            $("#denominacionConstancia").prop('disabled', isDisabled);
    
            //Refrescamos el select-picker
            $("#denominacionConstancia").selectpicker('refresh');    
        });
    }
    
    if($("#newRowHoras") && $("#updateHoras")){
        //Al ingresar algún caracter en la cantidad de horas
        $("#newRowHoras").keydown(function({which}){
            if(which === 69 || which === 187 || which === 189){
                return false;
            }
            return true;
        })

        $("#updateHoras").keydown(function({which}){
            if(which === 69 || which === 187 || which === 189){
                return false;
            }
            return true;
        })
    }
})
