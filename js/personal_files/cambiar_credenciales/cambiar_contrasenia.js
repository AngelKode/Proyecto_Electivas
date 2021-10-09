
const verifyUser = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "GET",
            url    : "./php/api/COOKIES_ADMIN.php",
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
        const messageHTML = `<div>
                               ${message}
                            </div>`;
        $('.page-loader-wrapper').append(messageHTML);
    })
})