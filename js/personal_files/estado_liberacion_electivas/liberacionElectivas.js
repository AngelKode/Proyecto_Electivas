
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
                            <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;">Completado</div>
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
                            <div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: ${parseInt(percentageElectiva)}%;">${parseInt(percentageElectiva)}%</div>
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
                        <span>0%</span>
                        <div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">Sin avance.</div>
                    </div>
                </div>
            </div>`;
}


const fetchData = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/estado_liberacion_electivas/fetchData.php",
            data   :{
                Alumno_id : 2
            },
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


$(document).ready(()=>{
    fetchData()
    .then((electivasAlumno) => {
        //Obtenemos las electivas, y mostramos el porcentaje de cada una
        electivasAlumno['electivas'].forEach((electivaAlumno) => {
            const cardToAdd = getCard(electivaAlumno);
            $("#body_card_electivas").append(cardToAdd);
        })

        //Quitamos el cargador al ya obtener las electivas del alumno
        setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
    })
    .catch(({message}) => {
        const messageHTML = `<div>
                               ${message}
                            </div>`;
        $('.page-loader-wrapper').append(messageHTML);
    })
})