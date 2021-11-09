
const changeEmail = () =>{
    //Hacemos la peticion para cambiar el email
    $.ajax({
        method : 'POST',
        url    : './php/contacto_soporte/modify_data.php',
        data   : {
            modify   : 'email',
            email : $("#newContentEmail").val().trim()
        },
        success : (serverResponse) => {
            const jsonResponse = JSON.parse(serverResponse);
            const {status, message} = jsonResponse;

            if(status === 'success'){
                //Actualizamos el DOM
                $("#emailValue").html($("#newContentEmail").val().trim());
            }

            //Limpiamos el input
            $("#newContentEmail").val("");

            //Mostramos una notificacion al usuario
            swal({
                title: 'Estatus de la petición:',
                text: message,
                type: status,
                showConfirmButton : false,
                background : '#fff',
                timer : 2000
            })

            //Eliminamos los estilos del input y del boton
            $("#group-email").removeClass('error');
            $("#group-email").removeClass('success');
            $(".input-icon-correct-email").css("display","none");
            $(".input-icon-incorrect-email").css("display","none");
            $("#changeEmailBtn").prop("disabled", true);

        }
    })
}

const changeWhatsApp = () =>{
    //Hacemos la peticion para cambiar el numero de whatsapp
    $.ajax({
        method : 'POST',
        url    : './php/contacto_soporte/modify_data.php',
        data   : {
            modify   : 'whats_app',
            whatsapp : $("#newContentWhatsApp").val().trim()
        },
        success : (serverResponse) => {
            
            const jsonResponse = JSON.parse(serverResponse);
            const {status, message} = jsonResponse;

            if(status === 'success'){
                //Actualizamos el DOM
                $("#whatsAppValue").html($("#newContentWhatsApp").val().trim());
            }

            //Limpiamos el input
            $("#newContentWhatsApp").val("");

            //Mostramos una notificacion al usuario
            swal({
                title: 'Estatus de la petición:',
                text: message,
                type: status,
                showConfirmButton : false,
                background : '#fff',
                timer : 2000
            })

            //Eliminamos los estilos del input y del boton
            $("#group-whatsapp").removeClass('error');
            $("#group-whatsapp").removeClass('success');
            $(".input-icon-correct-whatsapp").css("display","none");
            $(".input-icon-incorrect-whatsapp").css("display","none");
            $("#changeWhatsAppBtn").prop("disabled", true);
        }
    })
}

const changeNumberPhone = () =>{
    //Hacemos la peticion para cambiar el número de contacto
    $.ajax({
        method : 'POST',
        url    : './php/contacto_soporte/modify_data.php',
        data   : {
            modify   : 'telefono_escuela',
            phone : $("#newContentTelefono").val().trim()
        },
        success : (serverResponse) => {
            
            const jsonResponse = JSON.parse(serverResponse);
            const {status, message} = jsonResponse;

            if(status === 'success'){
                //Actualizamos el DOM
                $("#telefonoValue").html($("#newContentTelefono").val().trim());
            }

            //Limpiamos el input
            $("#newContentTelefono").val("");

            //Mostramos una notificacion al usuario
            swal({
                title: 'Estatus de la petición:',
                text: message,
                type: status,
                showConfirmButton : false,
                background : '#fff',
                timer : 2000
            })

            //Eliminamos los estilos del input y del boton
            $("#group-telefono").removeClass('error');
            $("#group-telefono").removeClass('success');
            $(".input-icon-correct-telefono").css("display","none");
            $(".input-icon-incorrect-telefono").css("display","none");
            $("#changeNumberBtn").prop("disabled", true);

        }
    })
}

$(document).ready(() => {
    $("#changeEmailBtn").click(changeEmail)
    $("#changeWhatsAppBtn").click(changeWhatsApp)
    $("#changeNumberBtn").click(changeNumberPhone)
})