import showNotification from "../notificaciones/notificacion.js";

const deleteCookies = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "GET",
            url    : "./php/api/DELETE_COOKIES.php",
            success : (serverResponse) => {
                const jsonResponse = JSON.parse(serverResponse);
                const {status} = jsonResponse;

                if(status !== "OK"){
                    const {message} = jsonResponse;
                    reject(message);
                }else{
                    resolve();
                }
            }
        })
    })
}

$(document).ready(() => {
    document.getElementById("logout").addEventListener('click', async () => {
        //Y eliminamos las cookies
        try {
            await deleteCookies();
            //Si todo salió bien, cambiamos de página
            window.location.replace("login.html");
        } catch (error) {
            showNotification({
                message : error,
                type : 'danger'
            })
        }
    })
})