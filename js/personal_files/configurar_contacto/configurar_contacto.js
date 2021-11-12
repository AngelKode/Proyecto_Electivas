
const setDataMenu = () => {
    return new Promise((resolve, reject) => {
        //Obtenemos las cookies, y si es valido el acceso
        $.ajax({
            method : "GET",
            url    : "./php/api/SESSION_DATA.php",
            success : (serverResponse) => {
                
                const jsonResponse = JSON.parse(serverResponse);
                const {status} = jsonResponse;

                if(status !== "OK"){
                    const {message} = jsonResponse;
                    reject(message);
                }else{
                    const {Nombre, Programa} = jsonResponse;

                    $(".name").html(Nombre);
                    $(".name").css({
                        "font-size" : "18px"
                    })
                    
                    $(".program").append(Programa);
                    $(".program").css({
                        "color" : "white",
                        "font-size" : "12px"
                    });
                    resolve();
                }
            }
        })
    })
}

const fetchData = () => {
    return new Promise((resolve,reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/contacto_soporte/fetchData.php',
            success : (serverResponse) => {
                
                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;

                if(status === 'success'){
                    const {data} = jsonResponse;

                    if(data.length > 0){
                        $("#whatsAppValue").html(`${data[0].whats_app}`);
                        $("#telefonoValue").html(`${data[0].telefono_escuela}`);
                        $("#emailValue").html(`${data[0].email}`);
                    }else{
                        $("#whatsAppValue").html("Sin número");
                        $("#telefonoValue").html("Sin número");
                        $("#emailValue").html("Sin email");
                    }
                    resolve();
                }else{
                    reject(message);
                }

            }
        })
    })
}

$(document).ready(() => {

    setDataMenu()
    .then(() => fetchData())
    .then(() => {
        setTimeout(() => {
            $(".page-loader-wrapper").fadeOut();
        }, 50);
    })
    .catch((errMessage) => {

        $(".page-loader-wrapper").css("background","linear-gradient(90deg, rgba(106,81,92,1) 19%, rgba(104,36,68,1) 87%)")
        //Mostramos una notificacion indicando que no hay sesión actual
        swal({
            title: errMessage,
            text: "Redirigiendo...",
            type: "warning",
            showConfirmButton : false,
            background : '#fff'
        });

        setTimeout(() => {
            //Despues de 2.5 segundos, redirigimos al usuario para que inicie sesión
            window.location.replace("login_prueba.html");
        }, 2500);
    })
})