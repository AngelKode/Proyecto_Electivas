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

const setDataFile = () => {
    //Actualizamos el encabezado del modal al ver el documento PDF
    $("#nombreActividadTitle").html(constanciaActual.Actividad);
    $("#horasActividadTitle").html(constanciaActual.Horas);
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

const uploadRevision = async () =>{

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
                ID_Constancia  : ID_Constancia,
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

                    const creditosOtorgados = getCreditosOtorgados(Factor).toPrecision(5);
                    
                    dataSend.Denominacion_id = parseInt(denominacion);
                    dataSend.Observaciones_encargado = observacionesEncargado;
                    dataSend.Creditos = creditosOtorgados;

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

            //Actualizamos la constancia
            updateConstanciaAlumno(dataSend)
            .then(() => {
                //Obtenemos los créditos de electivas del alumno, para hacer la suma en caso de que se valide
                if(parseInt(isValida) === 2){
                    getElectivasAlumno(constanciaActual)
                    .then(async (electivasAlumno) => {
                        //Obtenemos los nuevos valores de las electivas del alumno
    
                        //Creamos un arreglo para guardar la relacion entre el ID de la constancia y el ID de la electiva a la que pertenece la constancia 
                        let idElectivaConstancia = [];
                        
                        //Obtenemos el nuevo arreglo de electivas sumando los creditos que se liberaron 
                        let [nuevasElectivas,creditosByElectiva] = await getNewCreditosElectivas_Add(electivasAlumno, dataSend.Creditos);
                                                
                        //Agregamos un nuevo objeto con el ID de la constancia y cuantos creditos pertenecen a cada electiva
                        idElectivaConstancia.push({
                            ID_Constancia  : constanciaActual.ID,
                            Creditos : {...creditosByElectiva}
                        });
                        
                        //Actualizamos las electivas del alumno
                        await updateElectivasAlumno(nuevasElectivas.slice());
    
                        //Agregamos los nuevos registros a la tabla de las constancias validadas
                        await addNewConstanciaValidada(idElectivaConstancia)
                        .then(() => {})
                        .catch(({status, message}) => {
                            showNotification({
                                message : message,
                                type : status
                            })
                        });
                    });
                }

                //Actualizamos la constancia actual
                constanciaActual.Creditos = parseFloat(dataSend.Creditos).toPrecision(5);
                constanciaActual.Denominacion_id = dataSend.Denominacion_id + "";
                constanciaActual.Observaciones_encargado = dataSend.Observaciones_encargado;
                constanciaActual.Valida = dataSend.Valida + "";    
                                        
                //Actualizamos los datos en el arreglo de todas las constancas
                updateLocalDataConstancias(newDataConstancia);
                    
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
                    
                //Mostramos la notificacion de que se hicieron los cambios
                showNotification({
                    message : "La revisión se ha guardado correctamente.",
                    type : 'success'
                })
                    
                //Cerramos el modal
                $("#modal_validar_constancias").modal('hide');
            });
        }
    }else{

        const isNewStatusConstanciaValida = (parseInt(isValida) === 2) ? true : false;
        const isDenominacionElegida = ($("#denominacionConstancia").val() === null) ? false : true;
        const newDenominacionConstancia = (isDenominacionElegida && isNewStatusConstanciaValida) ? $("#denominacionConstancia").val().trim() : 0;

        //Verificamos que no se dejen espacios vacios
        if((!isDenominacionElegida && isNewStatusConstanciaValida) || (observacionesEncargado === "")){
            swal({
                title: "¡Cuidado!",
                text: "1 o más datos faltantes. Chécalos:)",
                type: "warning",
                showConfirmButton : false,
                timer: 2000
            });
        }else{
            //Encontramos la nueva denominación que se le asignará a la constancia
            let denominacionNueva = (parseInt(newDenominacionConstancia) !== 0) ? allDataDenominaciones.find(({ID}) => ID === newDenominacionConstancia) 
                                                                                : {ID : 0, Factor : '1 x 0 horas'};
            
            const {Factor : FactorNuevo} = denominacionNueva;                             
            const newCreditosToAdd = (parseInt(denominacionNueva.ID) !== 0) ? getCreditosOtorgados(FactorNuevo).toPrecision(5) : 0 + "";

            let dataSend = {
                ID_Constancia  : ID_Constancia,
                Denominacion_id : newDenominacionConstancia,
                Observaciones_encargado : observacionesEncargado,
                Creditos : newCreditosToAdd,
                Alumno_id : constanciaActual.Alumno_id,
                Valida : parseInt(isValida),
            };

            let newDataConstancia = {
                Denominacion_id : newDenominacionConstancia + "",
                Observaciones_encargado : observacionesEncargado,
                Valida : isValida + ""
            };

            updateConstanciaAlumno(dataSend)
                .then(() => {
                    getCreditosConstanciasAlumno(dataSend.Alumno_id)
                    .then(async (creditosAlumno) => {
                        //Creo un nuevo objeto, pero con los creditos acumulados todos iguales a 0
                        let electivasAlumno = await getElectivasAlumno(constanciaActual);
                        let electivasAlumnoEmpty = electivasAlumno.map((el) => {
                            el.Creditos_acumulados = 0+"";
                            return el;
                        });

                        //Creamos un arreglo para guardar la relacion entre el ID de la constancia y el(las) ID de la electiva a la que pertenece cada constancia 
                        let idElectivasConstancias = [];

                        //Recorro todos los créditos autorizados para el alumno, para sumarlos y obtener las nuevas electivas
                        creditosAlumno.forEach(async (el) => {
                            //Obtenemos el nuevo arreglo sumando los creditos 
                            let [newConstancia, creditosByElectiva] = await getNewCreditosElectivas_Add(electivasAlumnoEmpty, el.Creditos);
                            
                            //Agregamos un nuevo objeto con el ID de la constancia y cuantos creditos pertenecen a cada electiva
                            idElectivasConstancias.push({
                                ID_Constancia  : el.ID,
                                Creditos : {...creditosByElectiva}
                            });

                            //Referenciamos el nuevo resultado
                            electivasAlumnoEmpty = newConstancia;
                        });

                        //Actualizamos las electivas del alumno
                        await updateElectivasAlumno(electivasAlumnoEmpty.slice());

                        //Obtenemos la ID de la constancia que se le eliminaran todos los registros, en caso de que se vaya a eliminar
                        const idConstanciaToDelete = (parseInt(denominacionNueva.ID) === 0) ? ID_Constancia : 0;

                        //Actualizamos los registros en la tabla de creditos liberados, y dependiendo si se actualizan datos, o si se
                        //invalida la constancia, hacemos los cambios
                        await updateCreditosLiberadosAlumno(idConstanciaToDelete,idElectivasConstancias.slice())
                        .then(() => {
                            showNotification({
                                message : "Constancia actualizada correctamente.",
                                type : 'success'
                            });
                        })
                        .catch(({status, message}) => {
                            showNotification({
                                message : message,
                                type : status
                            })
                        });

                        //Actualizo el valor de la constancia actual
                        constanciaActual.Creditos = parseFloat(newCreditosToAdd).toPrecision(5);
                        constanciaActual.Denominacion_id = newDenominacionConstancia + "";
                        constanciaActual.Observaciones_encargado = observacionesEncargado;
                        constanciaActual.Valida = isValida + "";

                        //Actualizo el registro en el arreglo de todas las constancias
                        updateLocalDataConstancias(newDataConstancia);

                        //Cerramos el modal
                        $("#modal_validar_constancias").modal('hide');
                    });
                });
        }
    }
    
}

const addNewConstanciaValidada = (newConstanciaLiberada) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/addCreditosLiberados.php",
            data : {
                newRegistroElectivasLiberadas : JSON.stringify(newConstanciaLiberada)
            },
            success : (serverResponse) => {

                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;
                
                if(status !== "success"){
                    reject({
                        status : status,
                        message : message
                    });
                }
                resolve();
            }
        });
    });
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

const getAllConstanciasAlumno = ({Alumno_id}) => {
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

const getNewCreditosElectivas_Add = (electivasAlumno, cantidadAlterar) => {
    return new Promise((resolve) => {

        let puntosElectivas = [];
        electivasAlumno.forEach((electiva) => puntosElectivas.push({Creditos : electiva.Creditos, Creditos_acumulados : electiva.Creditos_acumulados, ID : electiva.ID}));

        let creditosByElectiva = [];

        let valoresElectivasNuevas = electivasAlumno.reduce((acc,cv) => {
            if(!(parseFloat(cv.Creditos_acumulados) >= parseFloat(cv.Creditos))){
                let sumaCreditos = parseFloat(cv.Creditos_acumulados) + parseFloat(cantidadAlterar);
                
                //Agregamos un objeto que contiene el ID de la electiva, y cuantos creditos pertenecen a esa electiva,
                //Cada objeto es una constancia
                creditosByElectiva.push({
                    IDElectiva : cv.ID,
                    Creditos   : (parseFloat(sumaCreditos) > parseFloat(cv.Creditos)) ? cantidadAlterar - (parseFloat(sumaCreditos) - cv.Creditos) : parseFloat(cantidadAlterar)
                })

                if(parseFloat(sumaCreditos) >= parseFloat(cv.Creditos)){
                    cv.Creditos_acumulados = parseFloat(cv.Creditos).toPrecision(5);
                    cantidadAlterar = Math.abs((sumaCreditos - parseFloat(cv.Creditos))); 
                }else{
                    cv.Creditos_acumulados = sumaCreditos.toPrecision(5);   
                    cantidadAlterar = 0; 
                }
            }
            acc.push({...cv});
            return acc;            
        },[]);
        
        resolve([valoresElectivasNuevas, creditosByElectiva]);
    });
}

const updateElectivasAlumno = (newDataElectivas) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/updateElectivas.php",
            data : {
                newDataElectivas : JSON.stringify(newDataElectivas)
            },
            success : (serverResponse) => {

                const {status, message} = JSON.parse(serverResponse);

                if(!status === "success"){
                    showNotification({
                        message : message,
                        type : status
                    })
                    reject(message);
                }
                resolve();
            }
        });
    })
}

const updateConstanciaAlumno = ({ID_Constancia, Denominacion_id, Observaciones_encargado, Creditos, Valida}) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/updateConstancia.php",
            data   : {
                ID  : ID_Constancia,
                Denominacion_id : Denominacion_id,
                Observaciones_encargado : Observaciones_encargado,
                Creditos : Creditos,
                Valida : Valida
            },
            success : resolve  
        })
    });
}

const updateCreditosLiberadosAlumno = (idConstanciaToDelete = 0,newRegistrosElectivasLiberadas) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/updateCreditosLiberados.php",
            data : {
                IDConstanciaToDelete : idConstanciaToDelete,
                newRegistrosElectivasLiberadas : JSON.stringify(newRegistrosElectivasLiberadas)
            },
            success : (serverResponse) => {

                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;
                
                if(status !== "success"){
                    reject({
                        status : status,
                        message : message
                    });
                }
                resolve();
            }
        });
    });
}

const getCreditosConstanciasAlumno = (Alumno_id) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : "POST",
            url    : "./php/constancias_validar/getConstanciasAlumno.php",
            data   : {
                Alumno_id : Alumno_id
            },
            success : (serverResponse) => {
                const serverResponseJSON = JSON.parse(serverResponse);
                const {status, message} = serverResponseJSON;

                if(!status){
                    resolve(serverResponseJSON);
                }
                reject(message);
            }  
        })
    });
}

$(document).ready(() => {
    fetchData().then(() => {
        //Configuramos para refrescar el embed donde se muetra el PDF
        $('#modal_archivo_subido').on('hidden.bs.modal', refreshEmbedFile);
        //Configuramos para que cada que se abra el modal, se actualicen los datos del mismo
        $('#modal_archivo_subido').on('show.bs.modal', setDataFile);
        //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
        setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
    })
});

