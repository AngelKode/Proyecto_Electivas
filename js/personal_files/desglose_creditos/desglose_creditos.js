import fetchDataContacto from "../configurar_contacto/getDataContacto.js";
import setDataMenu from "../setting_data/setDataMenu.js"

const loadChatBot = function(){
    return new Promise((resolve) => {
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/617c07e886aee40a5738ff4c/1fj67tpdj';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        resolve();
    })
}

const getPanelContainer = ({Title = "", CountPanel = 1, TableBody = "", TotalCreditos = 0}) => {
    return `<div class="panel panel-success">
                <div class="panel-heading" role="tab" id="heading_${CountPanel}">
                    <h4 class="panel-title">
                        <a role="button" data-toggle="collapse" data-parent="#panel_info" href="#collapse_${CountPanel}" aria-expanded="true" aria-controls="collapse_${CountPanel}" style="display:inline-block">
                            ${Title}
                        </a>
                    </h4>
                </div>
                <div id="collapse_${CountPanel}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading_${CountPanel}">
                    <div class="panel-body">
                        <!--Tabla de información-->
                        <div class="body table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Constancia</th>
                                        <th>Eje Temático</th>
                                        <th>Modalidad</th>
                                        <th>Horas Totales</th>
                                        <th>Horas Usadas</th>
                                        <th>Equivalencia en Horas</th>
                                        <th>Créditos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${TableBody}
                                </tbody>

                                <tfoot>
                                    <tr>
                                        <th scope="row" colspan="6">Total</td>
                                        <th>${TotalCreditos}</td>
                                    </tr>
                                </tfoot>

                            </table>
                        </div>
                        <!--Tabla de información-->
                    </div>
                </div>
            </div>`;
}

const generateTableBody = (constancias) => {
    //Generamos los renglones de la tabla
    let body = "";
    constancias.forEach(({Actividad,EjeTematico, Modalidad, Horas, Factor, Creditos, Creditos_acumulados}) => {
        //Obtenemos las horas usadas
        const horasPorCredito = parseInt(Factor.substring(Factor.lastIndexOf('x') + 2, Factor.lastIndexOf('horas') - 1));
        const creditosTotales = parseFloat((parseFloat(Horas) / parseFloat(horasPorCredito)).toPrecision(5));
        const horasUsadas = (creditosTotales === Creditos) ? Horas : ((parseFloat(Creditos) * parseFloat(Horas)) / parseFloat(creditosTotales)).toFixed(1);

        body += `<tr>
                    <th scope = "row"><em>${Actividad}</em></th>
                    <td>${EjeTematico}</td>
                    <td>${Modalidad}</td>
                    <td>${Horas}</td>
                    <td>${horasUsadas}</td>
                    <td>${horasPorCredito}</td>
                    <td>${Creditos}</td>
                </tr>`;
    });
    return [body, constancias[0].Creditos_acumulados];
}

const fetchData = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/desglose_creditos/fetchData.php",
            success : (serverResponse) => {
                 
                const jsonResponse = JSON.parse(serverResponse);
                const {status} = jsonResponse;

                if(status !== "success"){
                    const {message} = jsonResponse;
                    reject({
                        status : message,
                        message : message
                    })
                }
                resolve(jsonResponse);
            }
        })
    });
}

const getElectivasAlumno = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/getElectivasAlumno.php",
            success : (serverResponse) => {
    
                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;
    
                if(status === "danger"){
                    reject({
                        message : message
                    });
                }
                resolve(jsonResponse);
            }
        })
    });
}

const createSectionsElectivas = (dataOfEachElectiva) => {
    return new Promise((resolve,reject) => {

        //Recorremos cada electiva del alumno, obteniendo los datos y creando el despleglable de informacion
        let panelCounter = 1;

        for(let electiva in dataOfEachElectiva){
            if (dataOfEachElectiva.hasOwnProperty(electiva)){
                
                //Checamos el tamaño del arreglo, y vemos si generamos o no la tabla para esa electiva
                if(dataOfEachElectiva[electiva].length > 0){
                    //Recorremos el arreglo de las constancias
                    const [tableBody, totalCreditosAcumulados] = generateTableBody(dataOfEachElectiva[electiva]);
                   
                    const panel = getPanelContainer({
                        Title : electiva,
                        CountPanel : panelCounter,
                        TableBody : tableBody,
                        TotalCreditos : totalCreditosAcumulados
                    });

                    //Agregamos el panel
                    $("#panel_info").append(panel);
                }else{
                    //Si no tiene elementos, unicamente agregamos el titulo y creamos el panel del acordion
                    const panel = getPanelContainer({
                        Title : electiva,
                        CountPanel : panelCounter
                    })

                    //Agregamos el panel
                    $("#panel_info").append(panel);
                }
                panelCounter++;
            }else{
                reject({
                    message : "Error al generar las secciones informativas."
                })
            }
        }
        resolve();
    })
}

$(document).ready(()=>{

    setDataMenu()//Configuramos el menu de las secciones
    .then(() => fetchDataContacto())//Obtenemos los datos de contacto
    .then(() => fetchData())//Obtenemos las constancias validadas del alumno
    .then(async({electivas}) => {
        getElectivasAlumno()//Obtenemos las electivas del alumno
        .then(async (electivasAlumno) => {
                //Separamos las constancias por electiva
                const separatedElectivasByName = [];
                electivasAlumno.forEach(({Nombre}) => {
                    separatedElectivasByName[Nombre] = [];
                });

                //Ya teniendo todas las electivas, agregamos las constancias a la electiva donde pertenencen
                electivas.forEach((constancia) => {
                    separatedElectivasByName[constancia.Nombre].push({...constancia});
                });

                try {
                    //Teniendo todos los datos, creamos las secciones
                    await createSectionsElectivas(separatedElectivasByName)
                    .then(() => {
                            setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);

                            //Mostramos el chat bot al cargarse todo
                            loadChatBot();
                    })
                    .catch(({message}) => {
                        const messageHTML = `<div>
                                        ${message}
                                        </div>`;
                        $('.page-loader-wrapper').append(messageHTML);
                    })   
                } catch (error) {
                    showNotification({
                        message : 'Error al obtener los datos de tus electivas. Inténtelo nuevamente',
                        type : 'danger',
                        icon : 'warning'
                    })
                }
        })
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