import showNotification from "../notificaciones/notificacion.js";

const requestLoginAdmin = ({adminUser, adminPasswd}) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "GET",
            url    : "./php/api/API_ADMIN.php",
            data   : {
                userAdmin : adminUser,
                passwdAdmin : adminPasswd
            },
            success : (serv) => {
                resolve(serv);
            }
        })
    })
}

$(document).ready(() => {
    const formDOM = document.getElementById("sign_in");

    formDOM.addEventListener('submit' , async (event) => {
        //Prevenimos el comportamiento por default
        event.preventDefault();

        //Obtenemos los datos
        const userValue = formDOM.elements['user_value'].value;
        const passwdValue = formDOM.elements['passwd_value'].value;
        //Hacemos la peticion
        await requestLoginAdmin({adminUser: userValue, adminPasswd : passwdValue}).then(({message,status})=> {
            //Checamos la respuesta del servidor
            if(status !== "OK"){

                //Obtenemos el callback de mostrar la notificacion
                const callB = showNotification({
                                 message : message,
                                 element : ".login-box",
                                 placement : {from : "top",align : "left"},
                                 offset : {x : 0, y : -30},
                                 position : "relative",
                                 custom_width : `style = "width:100%"`,
                                 icon : "warning",
                                 type : "danger"
                              });
                              
                //Ejecutamos el callback
                setTimeout(callB, 1);
            }else{
                //Iniciar sesión
                //Cambiamos de pagina
                window.location.replace("./denominacion_electivas.html"); 
            }
        });
    });

})