
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
    fetchData()
    .then(() => {
        setTimeout(() => {
            $(".page-loader-wrapper").fadeOut();
        }, 50);
    })
    .catch(() => {

    })
})