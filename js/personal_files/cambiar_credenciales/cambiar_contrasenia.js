
const verifyUser = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "GET",
            url    : "./php/api/SESSION_DATA_ADMIN.php",
            success : (serverResponse) => {
            
                const jsonResponse = JSON.parse(serverResponse)
                const {status} = jsonResponse;

                if(status !== "OK"){
                    reject(jsonResponse)
                }else{
                    resolve(jsonResponse)
                }
            }
        })
    })
}

$(document).ready(() => {
    verifyUser()
    .then(() => {
        //Quitamos la pantalla de carga
        setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
    })
    .catch(({message}) => {
        $(".page-loader-wrapper").css("background","linear-gradient(90deg, rgba(106,81,92,1) 19%, rgba(104,36,68,1) 87%)")
        //Mostramos una notificacion indicando que no hay sesión actual
       swal({
           title: message,
           text: "Redirigiendo...",
           type: "warning",
           showConfirmButton : false,
           background : '#fff',
       });

       setTimeout(() => {
           //Despues de 2.5 segundos, redirigimos al usuario para que inicie sesión
           window.location.replace("login_admin.html");
       }, 2500);
    })
})