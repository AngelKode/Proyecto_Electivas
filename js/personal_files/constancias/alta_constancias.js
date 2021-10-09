
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

const showNotification = ({message = "", type = "info", element = "body", offset = {x : 30,y : 75},placement = {from : "top", align : "right"}, icon="ok"}) => {
        $.notify({
            message: message,
            icon : `glyphicon glyphicon-${icon}`
        },{
            type: type,
            allow_dismiss: false,
            newest_on_top: true,
            element : element,
            placement: placement,
            delay: 3000,
            timer: 1000,
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

const showWaitingForServerResponse = (message) => {
    swal({
        title: message,
        text: "Espere un momento por favor...",
        type: "info",
        showConfirmButton : false
    });
}

const closeAlert = () =>{
    swal.close();
}

const getStatusRequestView = (IDRow,doneRevision,reasonRejected="") => {

    let statusRevision = "";
    
    if(parseInt(doneRevision) === 1){
        statusRevision =   `<div>
                                <button type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_editar_constancias_and" onclick="setIDRow(${IDRow},'update')">
                                    <i class="material-icons">update</i>
                                    <span>Editar</span>
                                </button>
                                <button type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_eliminar_constancias_and" onclick="setIDRow(${IDRow},'delete')">
                                    <i class="material-icons">delete</i>
                                    <span>Eliminar</span>
                                </button>
                            </div>`;
    }else if(parseInt(doneRevision) === 2){
        statusRevision =   `<div class="bg-green text-center tooltipStatusDone" data-toggle="tooltip" data-placement="top" title="Constancia aceptada" style="cursor: pointer;">
                                <span>
                                    Validada
                                </span>
                            </div>`;
    }else{
        statusRevision = `<div class="bg-red text-center tooltipStatusRejected" data-toggle="tooltip" data-placement="top" title="${reasonRejected}" style="cursor: pointer;">
                            <span>
                                Rechazada
                            </span>
                          </div>`;
    }

    return statusRevision;
};

let allDataConstancias = [];
let idRow;
let routeFiles = "files";
let constanciaToBeUpdated;

const setIDRow = (ID,action) => {
    //Actualizamos el dato ID del registro que se va a actualizar/eliminar
    idRow = ID;
    //Llenamos los datos del modal
    setValuesModal(action);
}

const setValuesModal = (action) => {
    //Obtenemos los valores para el modal
    constanciaToBeUpdated = allDataConstancias.find((register) => register.ID === `${idRow}`);
    const {Actividad,Archivo,Fecha_fin,Fecha_inicio,Horas,Observaciones} = constanciaToBeUpdated;

    if(action === "update"){
        document.getElementById("updateActividad").value = Actividad;
        document.getElementById("updateFechaInicio").value = Fecha_inicio;
        document.getElementById("updateFechaFin").value = Fecha_fin;
        document.getElementById("updateHoras").value = Horas;
            document.getElementById("actualFile").innerHTML = Archivo.split("-data-")[1];
        document.getElementById("updateObservaciones").value = Observaciones;
    }else{
        document.getElementById("actividadDelete").value = Actividad;
        document.getElementById("fechaInicioDelete").value = Fecha_inicio;
        document.getElementById("fechaFinDelete").value = Fecha_fin;
        document.getElementById("horasDelete").value = Horas;
        document.getElementById("nameFileDelete").innerHTML = Archivo.split("-data-")[1];
        document.getElementById("observacionesDelete").value = Observaciones;  
    }

}
const refreshEmbedFile = () => {
    $("#fileViewerContainer>iframe").remove();
    $("#fileViewerContainer").html(`<iframe src="" type="application/pdf" style="width: 100%;height: 70vh;overflow-y: scroll;" id="fileViewer"></iframe>`); 
}

const openFileToView = (fileName) => {
    console.log(fileName)
    $("#fileViewer").attr("src",`${routeFiles}/${fileName}`);
    $('#modal_archivo_subido').modal('show');
}

const getActualFile = async () => {
    const actualConstancia = await getDataFile();
    return actualConstancia.Archivo;
}

const getDataFile = () => {
    return new Promise((resolve) => {
        allDataConstancias.find((data) => {
            if(data.ID === `${idRow}`){
                resolve(data)
            }
        });
    })
}

const addLocalDataConstancias = (Register) => {
    //Agregamos el nuevo registro
    allDataConstancias = [
        ...allDataConstancias,
        {...Register}
    ];
}

const updateLocalDataConstancias = (newData) => {
    //Lo agregamos al arreglo de todos los datos
    allDataConstancias.find(({ID},index) => {
        if(ID === `${idRow}`){
            allDataConstancias[index] = {...newData};
            return true;
        }
        return false;
    });
}

const fetchDataConstancias = () => {
    return new Promise((resolve) => {
        $.ajax({
            method : "GET",
            url : "./php/constancias/fetchDataConstancias.php",
            success : (serverResponse) => {
                //Obtenemos la respuesta en formato JSON
                const jsonServerResponse = JSON.parse(serverResponse);
                const {status, message} = jsonServerResponse;
                
                //Si no está definido 'status', quiere decir que se hizo con exito la peticion
                if(status === undefined){
                    //Obtenemos la tabla
                    const tablaData = $("#tabla_registros_constancias").DataTable();
    
                    jsonServerResponse.forEach((dataRow) => {
                        //Desestructuramos la informacion de cada registro
                        //Denominacion_id, Alumno_id,Fecha_inicio,Observaciones,Observaciones_encargado,Creditos
                        const{
                            ID, 
                            Actividad,  
                            Fecha_fin, Horas, Archivo,  
                            Valida,Observaciones_encargado 
                            } = dataRow;

                        //Creamos el icono para ver el archivo subido
                        const viewUploadedFile =`<div class="view_file">
                                                        <img src="images/images-app/PDF_file_example.svg" alt="PDF" style="width: 3rem;height: 3rem;cursor: pointer;" role="button" onclick="openFileToView('${Archivo}')">
                                                 </div>`;
                        //De acuerdo al estado de la solicitud, mostramos los elementos en la tabla
                        const statusRequest = getStatusRequestView(ID,Valida,Observaciones_encargado);

                        //Agregamos el dato a la tabla
                        tablaData.row.add([
                            Actividad, Fecha_fin, Horas, viewUploadedFile, statusRequest
                        ]).draw().node().id = `row_ID_${ID}`;
    
                        //Agregamos los datos a la memoria local
                        addLocalDataConstancias(dataRow);
                    });
                }else{
                    //En caso de algún error, notificamos al usuario
                    const {message,status} = jsonServerResponse;
                    showNotification({
                        message : message,
                        type : status,
                        icon : "exclamation-sign"
                    })
                }
                resolve();
            }
        })
    })
}

const addNewConstancia = () => {

    //Obtenemos los datos de la nueva constancia
    const valueNombreActividad = $("#newRowNombreActividad").val();
    const valueFechaInicio =  $("#newRowFechaInicio").val();
    const valueFechaFin =  $("#newRowFechaFin").val();
    const valueHoras = $("#newRowHoras").val();
        const inputFileDOM = $("#newRowFile");
        const {files} = inputFileDOM[0]; 
    const valueObservaciones = $("#newRowObservaciones").val();
    
    //Verificamos que no haya dejado espacios en blanco, que haya elegido un archivo, que las fechas sean correctas y el formato de las horas tambien
    if(!(valueNombreActividad.trim() === "" || valueFechaInicio.trim() === "" || valueFechaFin.trim() === "" ||
         valueHoras.trim() === "" || files[0] === undefined || valueObservaciones.trim() === "")){

            //Verificamos que las fechas de inicio y fin sean coherentes
            const dataFechaInicio = valueFechaInicio.split("-");
                const fechaInicioDate = new Date(dataFechaInicio[0],dataFechaInicio[1],dataFechaInicio[2])
            const dataFechaFin = valueFechaFin.split("-");
                const fechaFinDate = new Date(dataFechaFin[0],dataFechaFin[1],dataFechaFin[2])

            if(fechaInicioDate.getTime() > fechaFinDate.getTime()){
                swal({
                    title: "¡Cuidado!",
                    text: "Ingresa correctamente la fecha de inicio y término de la actividad",
                    type: "warning",
                    showConfirmButton : true
                })
                return;
            }
            //Verificamos que las fechas de inicio y fin sean coherentes

            //Obtenemos el nombre y el tamaño del archivo
            const {name : valueNameFile, size} = files[0];

            let formDataToAdd = new FormData();
            formDataToAdd.append('FileData',files[0]);
            formDataToAdd.append('Actividad',valueNombreActividad);
            formDataToAdd.append('FechaInicio', valueFechaInicio);
            formDataToAdd.append('FechaFin',valueFechaFin);
            formDataToAdd.append('Horas', valueHoras);
            formDataToAdd.append('FileName', valueNameFile);
            formDataToAdd.append('Observaciones', valueObservaciones);

            showWaitingForServerResponse("Añadiendo registro...");

            $.ajax({
                method : "POST",
                url    : "./php/constancias/addNewConstancia.php",
                data   : formDataToAdd,
                contentType: false,
                processData: false,
                success : (serverResponse) => {
                     //Obtenemos la respuesta del servidor
                    const {status,message,ID,newFileName} = JSON.parse(serverResponse);
                    let icon = "warning-sign";
        
                    //Si el status es 'success', la constancia se subió correctamente y lo agregamos a la tabla
                    if(status === "success"){
                        //Obtenemos el objeto DataTable
                        const dataTable = $("#tabla_registros_constancias").DataTable();
                        //Creamos el icono para ver el archivo subido
                        const viewUploadedFile =`<div>
                                                    <img src="images/images-app/PDF_file_example.svg" alt="PDF" style="width: 3rem;height: 3rem;cursor: pointer;  role="button" onclick="openFileToView('${newFileName}')">
                                                </div>`;
                        //Obtenemos que se va a mostrar en la columna de acciones, dependiendo el estado de revision de la constancia
                        const statusRequest = getStatusRequestView(ID,1);
        
        
                        //Agregamos la constancia a la tabla
                        dataTable.row.add([
                            valueNombreActividad, valueFechaFin, valueHoras, viewUploadedFile, statusRequest
                        ]).draw().node().id = `row_ID_${ID}`;
        
                        //Actualizamos los datos
                        const dataRegisterToBeAdded = {
                            ID : `${ID}`,
                            Actividad : valueNombreActividad,
                            Alumno_id : 1,
                            Archivo    : newFileName,
                            Creditos : null,
                            Denominacion : null,
                            Fecha_fin : valueFechaFin,
                            Fecha_inicio : valueFechaInicio,
                            Horas : valueHoras,
                            Observaciones : valueObservaciones,
                            Observaciones_encargado : null,
                            Valida : null
                        }
        
                        //Agregamos el dato para tenerlo más a la mano
                        addLocalDataConstancias(dataRegisterToBeAdded);
                        icon = "ok";//Le damos el valor al icono de 'ok' que se mostrará en la notificacion

                        const waitTime = () => {
                            return new Promise((resolve) => {
                                const timeOutObject = setTimeout(()=>{
                                    resolve(timeOutObject);
                                },800);
                            })
                        }
        
                        waitTime().then((timeOutObject) =>{
                            closeAlert();
        
                            //Mostramos la notificacion al usuario
                            showNotification({
                                message : message,
                                type : status,
                                icon : icon
                            });
        
                            //Cerramos el modal
                            $("#modal_alta_constancias").modal('hide');
    
                            clearTimeout(timeOutObject);
                        });

                    }else{
                        //Si la 
                        setTimeout(() => {
                            swal({
                                title: "Error al subir la constancia",
                                text: message,
                                type: "info",
                                showConfirmButton : true
                            });
                        }, 1000);
                    }
                }
            });        
    }else{
         //Si hay espacios en blanco, se lo indicamos al usuario
         swal({
            title: "¡Cuidado!",
            text: "1 o más datos faltantes. Chécalos:)",
            type: "warning",
            showConfirmButton : true
        });
    } 
}

const updateConstancia = () => {
    //Obtenemos los valores nuevos para la constancia
    const valueUpdateActividad = document.getElementById("updateActividad").value;
    const valueUpdateFechaInicio = document.getElementById("updateFechaInicio").value;
    const valueUpdateFechaFin = document.getElementById("updateFechaFin").value;
    const valueUpdateHoras = document.getElementById("updateHoras").value;
    const valueUpdateObservaciones = document.getElementById("updateObservaciones").value;
    const updateFileDOM = $("#updateNewFile");
        const {files} = updateFileDOM[0];
        const fileData = files[0];

    //Verificamos que no haya dejado espacios vacíos
    if(!(valueUpdateActividad.trim() === "" || valueUpdateFechaInicio.trim() === "" || valueUpdateFechaFin.trim() === "" ||
       valueUpdateHoras.trim() === "" || valueUpdateObservaciones.trim() === "")){


        //Verificamos que las fechas de inicio y fin sean coherentes
        const dataFechaInicio = valueUpdateFechaInicio.split("-");
            const fechaInicioDate = new Date(dataFechaInicio[0],dataFechaInicio[1],dataFechaInicio[2])
        const dataFechaFin = valueUpdateFechaFin.split("-");
            const fechaFinDate = new Date(dataFechaFin[0],dataFechaFin[1],dataFechaFin[2])

        if(fechaInicioDate.getTime() > fechaFinDate.getTime()){
            swal({
                title: "¡Cuidado!",
                text: "Ingresa correctamente la fecha de inicio y término de la actividad",
                type: "warning",
                showConfirmButton : true
            })
            return;
        }
        //Verificamos que las fechas de inicio y fin sean coherentes

        //Verificamos si el usuario eligio un archivo o no
        const fileAvailable = (fileData) ? fileData.name : null;

        //Dependiendo si eligió un archivo, será el contenido de formData
        const formData = new FormData();
        formData.append('Actividad', valueUpdateActividad);
        formData.append('FechaInicio', valueUpdateFechaInicio);
        formData.append('FechaFin',valueUpdateFechaFin);
        formData.append('Horas', valueUpdateHoras);
        formData.append('Observaciones', valueUpdateObservaciones);
        formData.append('ID', idRow);

        if(fileAvailable !== null){
            formData.append('FileData', fileData); 
            formData.append('FileName', fileData.name);
            formData.append('OldFileName', constanciaToBeUpdated.Archivo);
        }

        showWaitingForServerResponse("Actualizando registro...");

        //Teniendo todos los datos, hacemos la peticion
        $.ajax({
            method : "POST",
            url : "./php/constancias/updateConstancia.php",
            data : formData,
            contentType : false,
            processData : false,
            success : (serverResponse) => { 
                //Convertimos a JSON
                const jsonServerResponse = JSON.parse(serverResponse);
                const {status, message, newFileName} = jsonServerResponse;
                const fileName = (newFileName === undefined) ? constanciaToBeUpdated.Archivo : newFileName;
                let icon = "warning-sign";

                if(status === "success"){
                    //Creamos el nuevo objeto modificado
                    dataRegisterToBeModified = {
                        ID : `${idRow}`,
                        Actividad : valueUpdateActividad,
                        Alumno_id : 2,
                        Archivo    : fileName,
                        Creditos : null,
                        Denominacion : null,
                        Fecha_fin : valueUpdateFechaFin,
                        Fecha_inicio : valueUpdateFechaInicio,
                        Horas : valueUpdateHoras,
                        Observaciones : valueUpdateObservaciones,
                        Observaciones_encargado : null,
                        Valida : null
                    }
                    //Actualizamos los datos
                    updateLocalDataConstancias(dataRegisterToBeModified);
                    
                    //Actualizamos la tabla
                    const tablaData = $("#tabla_registros_constancias").DataTable();
                    const oldRow = tablaData.row(`#row_ID_${idRow}`);
                    const oldRowData = oldRow.data();
                    let newData = [];
                    
                    if(newFileName !== undefined){
                        //Creamos el icono para ver el archivo subido
                        const viewUploadedFile =`<div class="view_file">
                                                        <img src="images/images-app/PDF_file_example.svg" alt="PDF" style="width: 3rem;height: 3rem;cursor: pointer;" role="button" onclick="openFileToView('${newFileName}')">
                                                </div>`;
                        newData = [
                            valueUpdateActividad, valueUpdateFechaFin, valueUpdateHoras, viewUploadedFile,oldRowData[4] 
                        ];
                    }else{
                        newData = [
                            valueUpdateActividad, valueUpdateFechaFin, valueUpdateHoras, oldRowData[3],oldRowData[4] 
                        ];
                    }

                    oldRow.data(newData);
                    icon = "ok";
                }

                const waitTime = () => {
                    return new Promise((resolve) => {
                        const timeOutObject = setTimeout(()=>{
                            resolve(timeOutObject);
                        },800);
                    })
                }

                waitTime().then((timeOutObject) =>{
                    closeAlert();

                    //Mostramos la notificacion al usuario
                    showNotification({
                        message : message,
                        type : status,
                        icon : icon
                    });

                    //Cerramos el modal
                    $("#modal_editar_constancias_and").modal('hide'); 

                    clearTimeout(timeOutObject);
                });

            }
        });
    }else{
        //Si hay espacios en blanco, se lo indicamos al usuario
        swal({
            title: "¡Cuidado!",
            text: "1 o más datos faltantes. Chécalos:)",
            type: "warning",
            showConfirmButton : true
        });
    }
}

const deleteConstancia = () => {

    //Obtenemos el modal
    const modalDeleteConstancia = $("#modal_eliminar_constancias_and");
    //Obtenemos el nombre del archivo
    const {Archivo} = allDataConstancias.find((register) => register.ID === `${idRow}`);

        //Confirmamos si de verdad quiere eliminar el registro
        swal({
            title: "¿Está seguro de eliminar la constancia?",
            text: "Si lo elimina, tendrá que crearlo de nuevo",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Eliminar constancia",
            cancelButtonText: "Cancelar operación",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (!isConfirm) {
                showNotification({
                    message : "La constancia no se ha elminado",
                    type : "info"
                })
                modalDeleteConstancia.modal('hide');
            }else{

                const waitForPastAlert = () =>{
                    return new Promise((resolve) =>{
                        const timeOutObject = setTimeout(()=>{
                            showWaitingForServerResponse("Eliminando registro...");
                            resolve(timeOutObject);
                        },200);
                    });
                }
            
                waitForPastAlert().then((timeOutObject) => {
                    clearTimeout(timeOutObject);
                });

                $.ajax({
                    method : "POST",
                    url    : "./php/constancias/deleteConstancia.php",
                    data   : {
                        ID : idRow,
                        NameFile : Archivo
                    },
                    success : (serverResponse) => {
                        //Obtenemos la respuesta del servidor
                        const {status, message} = JSON.parse(serverResponse);
                        let icon = "warning-sign";
                        
                        if(status === "success"){
                            //Actualizamos los datos de la data
                            const tablaData = $("#tabla_registros_constancias").DataTable();
    
                            //Eliminamos el registro de la tabla y actualizamos
                            tablaData.row(`#row_ID_${idRow}`).remove().draw();
                            icon = "ok";
                        }

                        const waitTime = () => {
                            return new Promise((resolve) => {
                                const timeOutObject = setTimeout(()=>{
                                    resolve(timeOutObject);
                                },800);
                            })
                        }
        
                        waitTime().then((timeOutObject) =>{
                            closeAlert();
        
                            //Mostramos la notificacion al usuario
                            showNotification({
                                message : message,
                                type : status,
                                icon : icon
                            });
                            
                            modalDeleteConstancia.modal('hide')//Cerramos el modal
    
                            clearTimeout(timeOutObject);
                        });
                    }
                });
            }
        });
}

$(document).ready(() => {
        //Agregamos los listeners de los botones
        setDataMenu()
        .then(() => {
            fetchDataConstancias().then(() => {
                //Configuramos para refrescar el embed donde se muetra el PDF
                $('#modal_archivo_subido').on('hidden.bs.modal', refreshEmbedFile);
                
                $("#actualFile").on('click', () => {
                    getActualFile().then((file) => {
                        openFileToView(file)
                    })
                    
                })
                //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
                setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
            });
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