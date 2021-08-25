const setDataMenu = () => {
    return new Promise((resolve, reject) => {
        //Obtenemos las cookies, y si es valido el acceso
        $.ajax({
            method : "GET",
            url    : "./php/api/COOKIES.php",
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
                    
                    $(".program").append("Ingeniería: " + Programa);
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

export {
    setDataMenu as default
}