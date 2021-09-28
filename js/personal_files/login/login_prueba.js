import showNotification from "../notificaciones/notificacion.js";

const requestLogIn = (boletaAlumno, passwdAlumno) => {
    return new Promise( async (resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/api/APIRequest.php",
            data   : {
                boletaAlumno : boletaAlumno,
                passwdAlumno : passwdAlumno
            },
            success : (serv) => {
                //Enviamos la respuesta del servidor
                resolve(JSON.parse(serv))
            }
        })
    });
}

$(document).ready(() => {
    const formDOM = document.getElementById("sign_in");

    formDOM.addEventListener('submit' , async (event) => {
        //Prevenimos el comportamiento por default
        event.preventDefault();

        //Mostramos una notificacion sobre el estado de petición del usuario
        swal({
            title: "Procesando petición",
            text: "Estamos verificando tus datos:)",
            type: "info",
            showConfirmButton : false
        });

        //Obtenemos los datos
        const boletaValue = formDOM.elements['boleta_value'].value;
        const passwdValue = formDOM.elements['passwd_value'].value;

        //Hacemos la peticion
        await requestLogIn(boletaValue, passwdValue).then(({estatus,datos})=> {
            //Checamos la respuesta del servidor
            if(estatus !== "true"){
                //Mostramos un mensaje al usuario de error de autenticación
                swal({
                    title: "¡Error de autenticación!",
                    text: datos,
                    type: "warning",
                    showConfirmButton : false,
                    timer: 2000
                });
            }else{
                //Mostramos el mensaje al usuario
                swal({
                    title: "¡Autenticación exitosa!",
                    text: "Iniciando sesión...",
                    type: "success",
                    showConfirmButton : false,
                    timer: 1700
                });

                setTimeout(() => {
                    //Despues de mostrar el mensaje, iniciamos sesión
                   window.location.replace("./"); 
                }, 1700);
            }
        });
    });

})