$(document).ready(() => {
    $("#departamentalElectiva").on('change', () => {
        //Si cambia, obtenemos todos los oficios relacionados con el departamental
        $.ajax({
            method : 'GET',
            url    : './php/asignacion_electivas/fetchDataOficios.php',
            data   : {
                id_departamental : $("#departamentalElectiva").val()
            },
            success : (serverResponse) => {
                
                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;

                if(status === 'success'){
                    
                    const {data} = jsonResponse;//Obtenemos los datos obtenidos
                    $("#oficioElectiva>option").remove();//Removemos todas las opciones de los oficios
                    const selectOficios = $("#oficioElectiva");//Obtenemos el select de las opciones

                    //Recorremos los datos obtenidos para agregarlos al select de los oficios
                    data.forEach(({id, fecha, num_oficio}) => {
                        selectOficios.append(`<option value=${id}>${num_oficio}</option>`)
                    })

                    //Una vez agregadas todas las opciones, refrescamos el select
                    selectOficios.selectpicker('refresh');

                }else{
                    console.log(message)
                }
            }
        })
    })
})