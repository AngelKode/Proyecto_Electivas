const fetchDataContacto = () => {
    $.ajax({
        method : 'GET',
        url    : './php/contacto_soporte/fetchData.php',
        success : (serverResponse) => {
            
            //Obtenemos la respuesta y asignamos al modal
            const jsonResponse = JSON.parse(serverResponse);
            const {status, message} = jsonResponse;
            
            //Si se hizo con exito la peticion, asignamos los datos al modal
            if(status === 'success'){
                const {data} = jsonResponse;
                $("#whatsappContact").html(data[0].whats_app);
                $("#emailContact").html(data[0].email);
                $("#phoneContact").html(data[0].telefono_escuela);
            }
            //Quitamos el cargador al ya obtener las electivas del alumno y los ejemplos de actividades
            setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
        }
    })
}

export default fetchDataContacto;