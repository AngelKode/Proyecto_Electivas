
const getHashArrayData = (array) => {
    return new Promise((resolve) => {
        //Verificamos que sea un array
        if(Array.isArray(array)){
            const newArray = array.reduce((acc, cv) => {
                                //Separamos las fechas en un arreglo
                                const [year, month] = cv.split("-");
                                
                                //Si aun no existe la posicion, la creamos
                                if(acc[`year_${year}`] === undefined){
                                    acc[`year_${year}`] = [];
                                }

                                //Si aun no existe la posicion del mes, la creamos
                                if(acc[`year_${year}`][`month_${month}`] === undefined){
                                    acc[`year_${year}`][`month_${month}`] = 1;
                                }else{
                                    acc[`year_${year}`][`month_${month}`] += 1;
                                }

                                return acc;
                            }, [])
            resolve(newArray)
        }

        resolve([]);
    })
}

const initGraphic = (data) => {
    return new Promise((resolve) =>{
        //Obtenemos el año actual
        const actualYear = new Date().getFullYear();
        let dataYear = data[`year_${actualYear}`];

        let dataOfMonths = [
            (dataYear['month_01']) ? dataYear['month_01'] : 0,
            (dataYear['month_02']) ? dataYear['month_02'] : 0,
            (dataYear['month_03']) ? dataYear['month_03'] : 0,
            (dataYear['month_04']) ? dataYear['month_04'] : 0,
            (dataYear['month_05']) ? dataYear['month_05'] : 0,
            (dataYear['month_06']) ? dataYear['month_06'] : 0,
            (dataYear['month_07']) ? dataYear['month_07'] : 0,
            (dataYear['month_08']) ? dataYear['month_08'] : 0,
            (dataYear['month_09']) ? dataYear['month_09'] : 0,
            (dataYear['month_10']) ? dataYear['month_10'] : 0,
            (dataYear['month_11']) ? dataYear['month_11'] : 0,
            (dataYear['month_12']) ? dataYear['month_12'] : 0,
        ]

        let config = {
            type: 'line',
            data: {
                labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio","Agosto","Septiembre", "Octubre", "Noviembre", "Diciembre"],
                datasets: [{
                    label: "Constancias Recibidas",
                    data: dataOfMonths,
                    borderColor: 'rgba(0, 188, 212, 0.75)',
                    backgroundColor: 'rgba(0, 188, 212, 0.75)',
                    pointBorderColor: 'rgba(0, 188, 212, 0)',
                    pointBackgroundColor: 'rgba(0, 188, 212, 0.9)',
                    pointBorderWidth: 1,
                    fill : false,
                    tension : 0.01
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio : true,
                legend: false,
                legend : {}
            }
        }

        //Inicializamos la grafica
        new Chart(document.getElementById("constancias_chart").getContext("2d"), config);
        resolve(data)
    })
}

const initSelectYear = (dataYears) => {
    return new Promise((resolve) => {
        
        //Obtenemos los años
        let years = [];
        for(let years_label in dataYears){
            if(dataYears.hasOwnProperty(years_label)){
                let array_label = years_label.split("_");
                years.push(array_label[1]);
            }
        }

        //Obteniendo los años, creamos las opciones del select
        $("#changeYearConstanciasGraphic>option").remove();//Eliminamos todas las opciones
        let selectYearDOM = $("#changeYearConstanciasGraphic");//Obtenemos la referencia del DOM

        //Recorremos los años disponibles para poder mostrarse en la gráfica
        const actualYear = new Date().getFullYear();//Dependiendo el año actual, será la selección predeterminada
        years.forEach((year) => {
            //Si es igual, ponemos como seleccionado la opcions
            if(year === `${actualYear}`){
                selectYearDOM.append(`<option value=${year} selected>${year}</option>`)
            }else{
                selectYearDOM.append(`<option value=${year}>${year}</option>`)
            }
        })

        //Refrescamos el selectpicker
        selectYearDOM.selectpicker('refresh');

        resolve()
    })
}

const fetchData = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/dashboard/fetchData.php',
            success : (serverResponse) => {

                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;

                //Verificamos que se haya hecho la peticion correctamente
                if(status === undefined){

                    const {num_constancias_no_validadas, 
                           num_constancias_validadas,
                           num_electivas_liberadas, 
                           numero_alumnos,
                           fechas_constancias_recibidas} = jsonResponse;

                    getHashArrayData(fechas_constancias_recibidas)//Ordenamos las fechas obtenidas por año y por mes
                    .then((orderedArray) => initGraphic(orderedArray))//Con el arreglo obtenido, inicializamos la gráfica
                    .then((arrayYears) => initSelectYear(arrayYears))//Inicializamos el select para poder seleccionar el año de visualización
                    .then(() => {
                        
                        //Asignamos el valor a las tarjetas de información
                        $("#numero_alumnos").attr("data-to",numero_alumnos)
                        $("#numero_constancias_validas").attr("data-to",num_constancias_validadas)
                        $("#numero_constancias_no_validas").attr("data-to",num_constancias_no_validadas)
                        $("#numero_electivas_liberadas").attr("data-to",num_electivas_liberadas)
                        $('.count-to').countTo();//Inicializamos el count-to para que aparezca la animacion
                        resolve()

                    })
                    .catch(() => {
                        reject({
                            status : 'error',
                            message : 'Ha ocurrido un error. Si persiste el error contacte a soporte.'
                        })
                    })

                }else{
                    reject({
                        message : message
                    })
                }
    
            }
        })
    })
}

const verifyUser = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/api/SESSION_DATA_ADMIN.php',
            success : (serverResponse) => {
                
                const {status} = JSON.parse(serverResponse);

                if(status === "OK"){
                    resolve(JSON.parse(serverResponse))
                }else{
                    reject(JSON.parse(serverResponse))
                }
            }
        })
    })
}

$(document).ready(() => {
    //Quitamos la pantalla de carga
    verifyUser()
    .then(() => fetchData())
    .then(() => {
        setTimeout(() => {$(".page-loader-wrapper").fadeOut();}, 50);
    })
    .catch((errMessage) => {
        const {message} = errMessage;
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