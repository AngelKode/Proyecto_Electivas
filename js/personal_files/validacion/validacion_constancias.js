let ID_Constancia;
let allDataConstancias = [];
let allDataDenominaciones = [];
let constanciaActual;

const showNotification = ({message = "", type = "info", element = "body", offset = {x : 30,y : 75},placement = {from : "top", align : "right"}, icon="ok"}) => {
    return $.notify({
        message: message,
        icon : `glyphicon glyphicon-${icon}`
    },{
        type: type,
        allow_dismiss: false,
        newest_on_top: true,
        element : element,
        placement: placement,
        timer: 800,
        offset : offset,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        },
        template : `<div data-notify="container" class="alert alert-{0}" role="alert">
                        <span data-notify="icon"></span>
                        <span data-notify="message">{2}</span>
                    </div>`
    })
}

const setIDConstancia = (ID, isRevisada = false) => {
    ID_Constancia = ID;
    constanciaActual = allDataConstancias.find((constancia) => constancia.ID === `${ID_Constancia}`);

    const notification = showNotification({
        message : "Obteniendo la información..."
    });

    getDenominacionData().then(() => {
        setInputDataModal(constanciaActual, isRevisada);
        setTimeout(() => {
            $("#modal_validar_constancias").modal('show');
            notification.close();
        },500);
    });
}

const refreshEmbedFile = () => {
    $("#fileViewerContainer>embed").remove();
    $("#fileViewerContainer").html(`<embed src="" type="application/pdf" style="width: 100%;height: 70vh;overflow-y: scroll;" id="fileViewer">`); 
}

const setFileToView = () => {
    $("#fileViewer").attr("src",`./files/${constanciaActual.Archivo}`);
    $('#modal_archivo_subido').modal('show');
}

const setInputDataModal = ({Nombre,Actividad,Fecha_inicio, Fecha_fin,Horas,Denominacion_id,Valida,Observaciones_encargado}, isRevisada) => {
    document.getElementById("alumnoConstancia").innerHTML = Nombre;
    document.getElementById("nombreActividadConstancia").value = Actividad;
    document.getElementById("fechaInicioConstancia").value = Fecha_inicio;
    document.getElementById("fechaFinConstancia").value = Fecha_fin;
    document.getElementById("horasConstancia").value = Horas;

    enableSelectPicker("denominacionConstancia");

    $(".form-line").toggleClass("focused");
    if(isRevisada){
        //Validacion elegida
        setValueSelectPicker(Valida,"isValidaConstancia");

        //Denominacion elegida
        const valDenominacion = (parseInt(Valida) === 2) ? parseInt(Denominacion_id) : 0;
        if(valDenominacion === 0){
            disableSelectPicker("denominacionConstancia");
        }
        setValueSelectPicker(valDenominacion, "denominacionConstancia");
        $("#observacionesConstancia").val(Observaciones_encargado);

    }else{
        //Validacion elegida
        setValueSelectPicker(0, "isValidaConstancia");

        //Denominacion elegida
        setValueSelectPicker(0, "denominacionConstancia");

        //Observaciones del encargado
        $("#observacionesConstancia").val("");
    }
    //Observaciones del encargado
    $(".form-line").addClass("focused");
}

const setValueSelectPicker = (value, id) => {
    $(`#${id}`).val(`${value}`);
    $(`#${id}`).selectpicker('render');
}

const disableSelectPicker = (id) =>{
    $(`#${id}`).prop("disabled", true);
    $(`#${id}`).selectpicker('refresh');
}

const enableSelectPicker = (id) => {
    $(`#${id}`).prop("disabled", false);
    $(`#${id}`).selectpicker('refresh');
}

const getCreditosOtorgados = (Factor) => {
    //Calculamos los créditos que serán otorgados en caso de ser válida
    const horasPorCredito = parseInt(Factor.substring(Factor.lastIndexOf('x') + 2, Factor.lastIndexOf('horas') - 1));
    const horasConstancia = parseInt($("#horasConstancia").val().trim());
    return horasConstancia / horasPorCredito;
}

const addDataConstancias = (newConstancia) => {
    //Agregamos el nuevo registro
    allDataConstancias = [
        ...allDataConstancias,
        {...newConstancia}
    ];
}

const addDataDenominacion = (newDenominacion) => {
    //Agregamos el nuevo registro
    allDataDenominaciones = [
        ...allDataDenominaciones,
        {...newDenominacion}
    ];
}

const updateLocalDataConstancias = (newData) => {
    //Lo agregamos al arreglo de todos los datos
    allDataConstancias.find(({ID},index) => {
        if(ID === `${ID_Constancia}`){
            allDataConstancias[index] = {...allDataConstancias[index], ...newData};
            return true;
        }
        return false;
    });
}

const getDenominacionData = () => {
    return new Promise((resolve) => {
        $.ajax({
            method : "GET",
            url    : "./php/denominaciones/fetchDataDenominacion.php",
            data : {},
            success : (serverResponse) => {
                allDataDenominaciones = [];//Limpiamos los anteriores datos

                const jsonResponse = JSON.parse(serverResponse);//Convertimos a JSON la respuesta
                $("#denominacionConstancia>option").remove();//Removemos todas las opciones del eje tematico
                const selectElementDenominaciones = $("#denominacionConstancia");//Obtenemos el select de las opciones

                jsonResponse.forEach((denominacion) => {
                    //Obtenemos la información de la denominación
                    const {ID,EjeTematico,Modalidad} = denominacion;
                    //Agregamos las opciones al select
                    selectElementDenominaciones.append(`<option value="${ID}">${EjeTematico} -- ${Modalidad}</option>`);
                    addDataDenominacion({...denominacion});
                });

                //Una vez agregadas todas las opciones, refrescamos el select
                selectElementDenominaciones.selectpicker('refresh');

                resolve();
            }
        })
    });
}

const fetchData = () => {
    return new Promise((resolve) => {
        $.ajax({
            method : "GET",
            url    : "./php/constancias_validar/fetchDataValidaciones.php",
            data   : {},
            success : (serverResponse) => {
                //Convertimos a JSON
                const jsonResponse = JSON.parse(serverResponse);
                const {status} = jsonResponse;

                if(status === undefined){

                    const {dataConstancias} = jsonResponse;
                    const dataTable = $("#tabla_registros_constancias_validar").DataTable();

                    dataConstancias.forEach((constancia) => {

                        const {ID : ID_Constancia,Nombre : Nombre_Alumno, Actividad : Actividad_Alumno, 
                               Programa : Programa_Alumno, Horas, Valida} = constancia;

                        const btnCheckConstancia = (parseInt(Valida) === 1) ? `<div style="width: 100%; height: 100%;">
                                                                        <button type="button" style="width: 100%; height: 100%;" class="btn btn-warning waves-effect" onclick="setIDConstancia(${ID_Constancia},false)">
                                                                            <i class="material-icons">query_builder</i>
                                                                            <span>Validar</span>
                                                                        </button>
                                                                    </div>`
                                                                  : `<div style="width: 100%; height: 100%;">
                                                                        <button type="button" style="width: 100%; height: 100%;" class="btn btn-info waves-effect" onclick="setIDConstancia(${ID_Constancia},true)">
                                                                            <i class="material-icons">update</i>
                                                                            <span>Editar validación</span>
                                                                        </button>
                                                                    </div>`;
                        dataTable.row.add([
                            Programa_Alumno, Nombre_Alumno, Actividad_Alumno, Horas, btnCheckConstancia
                        ]).draw().node().id = `row_ID_${ID_Constancia}`;

                        //Agregamos los datos
                        addDataConstancias(constancia);
                    });
                    
                }else{

                }
                resolve();
            }
        });
    });
}

const uploadRevision = () => {

    const isValida = $('#isValidaConstancia').val().trim();
    const observacionesEncargado = $('#observacionesConstancia').val().trim();

    if(parseInt(constanciaActual.Valida) === 1){
        //Checamos si la constancia es válida o no
        if(isValida === ""){
            swal({
                title: "¡Cuidado!",
                text: "Elige si la constancia es válida o no.:)",
                type: "warning",
                showConfirmButton : false,
                timer: 2000
            });
        }else{

            let dataSend = {
                ID  : ID_Constancia,
                Denominacion_id : 0,
                Valida : parseInt(isValida),
                Observaciones_encargado : "",
                Creditos : 0,
                Alumno_id : constanciaActual.Alumno_id
            };

            let newDataConstancia = {
                Denominacion_id : 0,
                Observaciones_encargado : observacionesEncargado,
                Valida : isValida
            };

            if(parseInt(isValida) === 3){
                if(!(observacionesEncargado === "")){
                    dataSend.Observaciones_encargado = observacionesEncargado;
                }else{
                    swal({
                        title: "¡Cuidado!",
                        text: "1 o más datos faltantes. Chécalos:)",
                        type: "warning",
                        showConfirmButton : false,
                        timer: 2000
                    });
                }
            }else{
                const denominacion = ($("#denominacionConstancia").val() === null) ? "" : $("#denominacionConstancia").val().trim();
                //Checamos si todos los campos están llenos
                if(!(denominacion === "" || observacionesEncargado === "")){
                    //Obtenemos el factor de la denominacion
                    const {Factor} = allDataDenominaciones.find(({ID}) => ID === denominacion);

                    const creditosOtorgados = getCreditosOtorgados(Factor);
                    
                    dataSend.Denominacion_id = parseInt(denominacion);
                    dataSend.Observaciones_encargado = observacionesEncargado;
                    dataSend.Creditos = creditosOtorgados.toFixed(3);

                    newDataConstancia.Denominacion_id = parseInt(denominacion);
                }else{
                    swal({
                        title: "¡Cuidado!",
                        text: "1 o más datos faltantes. Chécalos:)",
                        type: "warning",
                        showConfirmButton : false,
                        timer: 2000
                    });
                }
            }
            //Hacemos la petición
            $.ajax({
                method : "POST",
                url    : "./php/constancias_validar/update_status_constancia.php",
                data   : dataSend,
                success : (serverResponse) => {
                    const {status, message} = JSON.parse(serverResponse);

                    if(status === "success"){
                        //Actualizamos la tabla
                        const dataTable = $("#tabla_registros_constancias_validar").DataTable();
                        let data = dataTable.row(`#row_ID_${ID_Constancia}`).data();

                        data[data.length - 1] = `<div style="width: 100%; height: 100%;">
                                                    <button type="button" style="width: 100%; height: 100%;" class="btn btn-info waves-effect" onclick="setIDConstancia(${ID_Constancia},true)">
                                                        <i class="material-icons">update</i>
                                                        <span>Editar validación</span>
                                                    </button>
                                                </div>`;
                        dataTable.row(`#row_ID_${ID_Constancia}`).data(data);
                    }

                    showNotification({
                        message : message,
                        type : status
                    })
                    
                    updateLocalDataConstancias(newDataConstancia);

                    //Cerramos el modal
                    $("#modal_validar_constancias").modal('hide');
                }
            });
        }
    }else{

        //Aqui, haremos las actualizaciones correspondientes de las electivas del alumno
        let dataSend = {
            ID  : ID_Constancia,
            Denominacion_id : 0,
            Valida : parseInt(isValida),
            Observaciones_encargado : "",
            Creditos : 0,
            Alumno_id : constanciaActual.Alumno_id
        };

        let newDataConstancia = {
            Denominacion_id : 0,
            Observaciones_encargado : observacionesEncargado,
            Valida : isValida
        };

        const isNewStatusConstanciaValida = (isValida === "2") ? true : false;
        const isDenominacionElegida = ($("#denominacionConstancia").val() === null) ? false : true;
        const newDenominacionConstancia = (isDenominacionElegida && isNewStatusConstanciaValida) ? $("#denominacionConstancia").val().trim() : 0;

        if(isDenominacionElegida && isNewStatusConstanciaValida){
            const {Factor} = allDataDenominaciones.find(({ID}) => ID === newDenominacionConstancia);
                    
            const creditosOtorgados = getCreditosOtorgados(Factor);

            dataSend.Denominacion_id = parseInt(newDenominacionConstancia);
            dataSend.Observaciones_encargado = observacionesEncargado;
            dataSend.Creditos = creditosOtorgados;

            newDataConstancia.Denominacion_id = parseInt(newDenominacionConstancia);
        }else if((!isDenominacionElegida) && isNewStatusConstanciaValida){
            swal({
                title: "¡Cuidado!",
                text: "1 o más datos faltantes. Chécalos:)",
                type: "warning",
                showConfirmButton : false,
                timer: 2000
            });
        }

        getElectivasAlumno(constanciaActual)
            .then((electivasAlumno) => {
                const denominacionNueva = allDataDenominaciones.find(({ID}) => ID === newDenominacionConstancia);
                if(isNewStatusConstanciaValida){
                    //Si es valida, checamos si va a haber cambios, se adaptan los créditos o si se va a eliminar
                    if(isValida){
                        //Checamos si habrá cambios en los créditos
                        if(constanciaActual.Denominacion_id !== newDenominacionConstancia){
                            dataSend.Denominacion_id = parseInt(newDenominacionConstancia);
                        }
                        //Checamos que se hayan ingresado las observaciones del encargado
                        if(observacionesEncargado !== ""){
                            dataSend.Observaciones_encargado = observacionesEncargado;
                        } 
                    }else{

                    }
                }else{
                    //Si no es valida, checamos si va a seguir igual o si va a cambiar a 'Válida'
                }
               return getNewCreditosElectivas(electivasAlumno,4);
            }).then((newDataElectivas) => {
                swal({
                    title: "¡Implementación en proceso!",
                    text: "Edición de validación de constancias en proceso...",
                    type: "warning",
                    showConfirmButton : false,
                    timer: 3000
                })
                /* $.ajax({
                    method : "POST",
                    url    : "./php/constancias_validar/updateValidaciones.php",
                    data : dataSend,
                    success : (serverResponse) => {
        
                    }
                }) */
            }).catch(console.log);
    }
    
}

const getElectivasAlumno = ({Alumno_id}) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/getElectivasAlumno.php",
            data : {
                Alumno_id : Alumno_id
            },
            success : (serverResponse) => {
                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;

                if(status === "danger"){
                    reject(message);
                }
                resolve(jsonResponse);
            }
        })
    });
}

const getNewCreditosElectivas = (electivasAlumno, cantidadAlterar) => {
    return new Promise((resolve) => {

        let puntosElectivas = [];
        electivasAlumno.forEach((electiva) => puntosElectivas.push({Creditos : electiva.Creditos, CreditosObtenidos : electiva.Creditos_acumulados}));

        valoresElectivas = puntosElectivas.reverse();

        valoresElectivas = valoresElectivas.reduce((acc,cv,ci) => {

            if(cantidadAlterar > 0 || ci === 0){
                let sobrante = (parseFloat(cv.CreditosObtenidos)) - (parseFloat(cantidadAlterar) * -1);

                if(sobrante >= 0){
                    cv.CreditosObtenidos = sobrante;
                    cantidadAlterar = 0;   
                }else{
                    cv.CreditosObtenidos = 0;
                    cantidadAlterar = Math.abs(sobrante);    
                }  
            }
            acc.push({...cv});
            return acc; 
        },[])
        
        resolve(valoresElectivas.reverse());
    });
}

$(document).ready(() => {
    fetchData().then(() => {
        //Configuramos para refrescar el embed donde se muetra el PDF
        $('#modal_archivo_subido').on('hidden.bs.modal', refreshEmbedFile);
        //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
        setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
    })
});

