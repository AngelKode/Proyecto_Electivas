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

                    //Arreglamos el nombre del alumno
                    const nombreArray = Nombre.split(" ");
                    let fixedNombre = "";
                    nombreArray.forEach((palabra) => {
                        fixedNombre += palabra[0].toUpperCase() + palabra.substr(1,palabra.length - 1);
                        fixedNombre += " ";
                    });

                    $(".name").html(fixedNombre);
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

export {
    setDataMenu as default
}