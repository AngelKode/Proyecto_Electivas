import fetchDataContacto from "../configurar_contacto/getDataContacto.js";
import showNotification from "../notificaciones/notificacion.js";
import setDataMenu from "../setting_data/setDataMenu.js";

const loadChatBot = function(){
    return new Promise((resolve) => {
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/617c07e886aee40a5738ff4c/1fj67tpdj';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        resolve()
    })
}

const getCard = ({Creditos, Creditos_acumulados, Nombre}) => {

    const percentageElectiva = (parseFloat(Creditos_acumulados) > 0) ? (parseFloat(Creditos_acumulados) * parseFloat(100)) / parseFloat(Creditos) : parseFloat(0);

    if(percentageElectiva === parseFloat(100)){
        return `<div class="card" style="border-left: 10px solid#4CAF50;">
                    <div class="header" style="padding:10px;padding-left: 15px;">
                        <h5>
                            ${Nombre}
                        </h5>
                    </div>
                    <div class="body" style="padding: 10px;">
                        <div class="progress" style="margin: 5px;">
                            <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"><em>Completado</em></div>
                        </div>
                    </div>
                </div>`;
    }else if(percentageElectiva > parseFloat(0)){
        return `<div class="card" style="border-left: 10px solid #FF9800;">
                    <div class="header" style="padding:10px;padding-left: 15px;">
                        <h5>
                            ${Nombre}
                        </h5>
                    </div>
                    <div class="body" style="padding: 10px;">
                        <div class="progress" style="margin: 5px;">
                            <div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: ${parseInt(percentageElectiva)}%;"><em>${parseInt(percentageElectiva)}%</em></div>
                        </div>
                    </div>
                </div>`;
    }

    return `<div class="card" style="border-left: 10px solid #F44336">
                <div class="header" style="padding:10px;padding-left: 15px;">
                    <h5>
                        ${Nombre}
                    </h5>
                </div>
                <div class="body" style="padding: 10px;">
                    <div class="progress" style="margin: 5px;text-align: center;">
                        <span><em style = "color:red">0%</em></span>
                        <div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>
                    </div>
                </div>
            </div>`;
}


const fetchData = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/estado_liberacion_electivas/fetchData.php",
            success : (serverResponse) => {
                const jsonResponse = JSON.parse(serverResponse);
                const {status} = jsonResponse;

                if(status !== "success"){
                    const {message} = jsonResponse;
                    reject({
                        status : status,
                        message : message
                    })
                }

                resolve(jsonResponse);
            }
        })
    });
}

const fetchDataEjemplosActividades = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "GET",
            url    : "./php/denominaciones/fetchDataDenominacion.php",
            success : (serverResponse) => {

                const jsonResponse = JSON.parse(serverResponse);
                const {status} = jsonResponse;

                if(status === "danger"){
                    const {message} = jsonResponse;
                    const notificacion = showNotification({
                        message : message,
                        type : status,
                    });
                    setTimeout(notificacion, 1);
                    reject();
                }

                resolve(jsonResponse);
            }
        })
    });
}

const createElementList = (Ejemplos) => {
    let elements = "";

    //Convertimos en arreglo
    const ejemplosArray = Ejemplos.split("\n");

    //Vamos creando los elementos en la lista
    ejemplosArray.forEach((ejemplo) => {
        elements += `<li>${ejemplo.substring(1)}</li>`;
    })

    return elements;
}

const createSectionEjemplosActividades = (EjesTematicos) => {
    return new Promise((resolve) => {

        let counter = 1; 
        for(let eje in EjesTematicos){
            if (EjesTematicos.hasOwnProperty(eje)){

                //Creamos el titulo de la seccion
                const titleSeccion =`<div class="panel-heading" role="tab" id="eje_${counter}">
                                        <h4 class="panel-title">
                                            <a role="button" data-toggle="collapse" data-parent="#panel_ejemplos" href="#eje_collapse_${counter}" aria-expanded="true" aria-controls="eje_collapse_${counter}">
                                                ${eje}
                                            </a>
                                        </h4>
                                    </div>`;

                //Creamos los renglones de la tabla
                let contenidoTabla = "";

                for(let modalidad in  EjesTematicos[eje]){
                    const titulo = modalidad;
                    const ejemploActividad = (EjesTematicos[eje][modalidad]);
                    const {Ejemplos, Descripcion} = ejemploActividad[0];

                    contenidoTabla += `                                                    
                    <tr>
                        <td>${titulo}</td>
                        <td>
                            <ul>
                               ${createElementList(Ejemplos)}
                            </ul>
                        </td>
                        <td>${Descripcion}</td>
                    </tr>`;
                }

                //Creamos el contenedor donde ir?? la tabla
                const contenido = `<div id="eje_collapse_${counter}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="eje_${counter}" aria-expanded = "true">
                                    <div class="panel-body">
                                        <!--Tabla de informaci??n-->
                                        <div class="body table-responsive">
                                            <table class="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Modalidad</th>
                                                        <th>Ejemplos de Actividades</th>
                                                        <th>Cr??ditos</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${contenidoTabla}                       
                                                </tbody>
                                            </table>
                                        </div>
                                        <!--Tabla de informaci??n-->
                                    </div>
                                </div>`;

                //Por ultimo, creamos el contenedor principal, y agregamos el titulo de la seccion,
                //y el contenido de la misma
                const divContainer = `<div class="panel panel-info">
                                        ${titleSeccion}
                                        ${contenido}
                                      </div>`;
                
                //Lo agregamos el div que va a tener todas las secciones
                $("#panel_ejemplos").append(divContainer);
            }
            counter++;
        }


        resolve();
    });
}

$(document).ready(()=>{

    setDataMenu()//Mostramos el nombre del alumno y su carrera
    .then(() => fetchData())//Obtenemos los datos del alumno respecto al avance de sus electivas
    .then((electivasAlumno) => {
        //Obtenemos las electivas, y mostramos el porcentaje de cada una
        electivasAlumno['electivas'].forEach((electivaAlumno) => {
            const cardToAdd = getCard(electivaAlumno);
            $("#body_card_electivas").append(cardToAdd);
        })
            
        //Y mostramos los ejemplos de actividades dados de alta
        return fetchDataEjemplosActividades();
    })
    .then(async (denominaciones) => {
    
        //Separamos por ejes tematicos
        const hashEjemplosActividades = await denominaciones.reduce((acc,cv) => {
            //Verificamos si ya existe la posicion del arreglo, si no,la creamos
            if(acc[cv.EjeTematico] === undefined){
                acc[cv.EjeTematico] = [];
            }

            //Verificamos que exista la posicion del arreglo de la modalidad en el eje tematico actual,
            //si no existe, lo creamos
            if(acc[cv.EjeTematico][cv.Modalidad] === undefined){
                acc[cv.EjeTematico][cv.Modalidad] = [];
            }

            //Agregamos los ejemplos a la modalidad actual
            acc[cv.EjeTematico][cv.Modalidad].push(cv);

            //Retornamos el acumulador
            return acc;
        },[])

        //Con el hash, creamos las diferentes secciones
        await createSectionEjemplosActividades(hashEjemplosActividades);

        //Mostramos el chat-bot al cargarse todo
        return loadChatBot();
    })
    .then(() => fetchDataContacto())
    .catch((errMessage) => {
        $(".page-loader-wrapper").css("background","linear-gradient(90deg, rgba(106,81,92,1) 19%, rgba(104,36,68,1) 87%)")
         //Mostramos una notificacion indicando que no hay sesi??n actual
        swal({
            title: errMessage,
            text: "Redirigiendo...",
            type: "warning",
            showConfirmButton : false,
            background : '#fff'
        });

        setTimeout(() => {
            //Despues de 2.5 segundos, redirigimos al usuario para que inicie sesi??n
            window.location.replace("login_prueba.html");
        }, 2500)
    })
})