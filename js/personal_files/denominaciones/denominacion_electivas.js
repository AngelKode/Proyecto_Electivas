let idRowTable = 0;
let allDataDenominacion = [];//Aqui guardaremos toda la información, para no tener que hacer otra petición
let dataRegisterToBeModified = {};

const setIDRow = (id,action) =>{
    idRowTable = id;
    //De acuerdo a la accion, vamos a llenar los datos del modal
    setShownData(action);
}

const showNotification = ({message = "", type = "info", element = "body", offset = {x : 30,y : 75},placement = {from : "top", align : "right"}, icon = "ok"}) => {
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

const addLocalDataDenominacion = (Register) => {
    //Agregamos el nuevo registro
    allDataDenominacion = [
        ...allDataDenominacion,
        {...Register}
    ];
}

const updateLocalDataDenominacion = (newData) => {
    //Lo agregamos al arreglo de todos los datos
    allDataDenominacion.find(({Register},index) => {
        if(Register.ID === idRowTable){
            allDataDenominacion[index] = {...newData};
            return true;
        }
        return false;
    });
}

const setShownData = (action) => {
    
    if(action === "update"){
        //Obtenemos el registro relacionado con el ID
        dataRegisterToBeModified = allDataDenominacion.find(({Register}) => Register.ID === idRowTable);

        const {Register} = dataRegisterToBeModified;
        const {Descripcion, Ejemplos, EjeTematico, Factor, Modalidad} = Register

        //Actualizamos los elementos con los datos obtenidos del modal para actualizar
        document.getElementById('updateEjeTematico').value = EjeTematico;
        document.getElementById('updateModalidad').value = Modalidad;
        document.getElementById('updateDescripcion').value = Descripcion;
        document.getElementById('updateFactor').value = Factor;
        document.getElementById('updateEjemplos').value = Ejemplos;
    }else{
        //Mostramos en la notificación el nombre de la denominación
        swal({
            title: "¿Desea eliminarlo?",
            type: "warning",
            showConfirmButton : true,
            showCancelButton : true,
            confirmButtonText: "Eliminar registro",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#DD6B55",
            closeOnConfirm: true,
            closeOnCancel: true,
        }, function(isConfirm){

            if(!isConfirm){
                showNotification({
                    message : "El registro no se ha elminado",
                    type : "info"
                })
            }else{
                deleteDenominacion();
            }

        });
    }

}

const fetchData = () => {
    return new Promise((resolve) => {
        $.ajax({
            method : 'GET',
            url : "./php/denominaciones/fetchDataDenominacion.php",
            success: (serverResponse) => {
                //Convertimos a JSON la respuesta
                const jsonResponse = JSON.parse(serverResponse);
                //Obtenemos message y status, en caso de ser undefined, quiere decir que se hizo correctamente la peticion
                const {message, status} = jsonResponse;
    
                if(status === undefined){
                    //Obtenemos el data-table
                    const tablaData = $("#tabla_registros_denominaciones").DataTable();                
    
                    //Recorremos cada registro y agregamos a la tabla
                    jsonResponse.forEach(({ID,EjeTematico,Modalidad, Descripcion,Factor,Ejemplos}) => {
                        const btnUpdate =  `<div>
                                                <button type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_editar_denominaciones" onclick = "setIDRow(${ID},'update')">
                                                    <i class="material-icons">update</i>
                                                    <span>Editar</span>
                                                </button>&nbsp&nbsp`;
                        const btnDelete =  `    <button type="button" class="btn btn-danger waves-effect" onclick = "setIDRow(${ID},'delete')">
                                                    <i class="material-icons">delete</i>
                                                    <span>Eliminar</span>
                                                </button>
                                            </div>`;
                        const btnGroup = btnUpdate + btnDelete;
    
                        tablaData.row.add([
                            EjeTematico,Modalidad, Factor, btnGroup
                        ]).draw().node().id = `row_ID_${ID}`
    
                        //Agregamos los datos al objeto que contiene toda la información
                        addLocalDataDenominacion({
                            Register : {
                                ID          : parseInt(ID),
                                Descripcion : Descripcion,
                                Ejemplos    : Ejemplos,
                                EjeTematico : EjeTematico,
                                Factor      : parseInt(Factor.substring(Factor.lastIndexOf('x') + 2, Factor.lastIndexOf('horas') - 1)),
                                Modalidad   : Modalidad,
                            }
                        });
                    });
                }else{
                    showNotification({
                        message : message,
                        type : status
                    })
                }
                
                resolve();
            }
        })
    });
}

const verifyUser = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/api/COOKIES_ADMIN.php',
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

const addNewDenominacion = () => {

    const ejeTematico = document.getElementById('newRowEjeTematico').value;
    const modalidad =  document.getElementById('newRowModalidad').value;
    const descripcion = document.getElementById('newRowDescripcion').value;
    const factorHoras = document.getElementById('newRowFactor').value;
    const factor = `1 x ${factorHoras} horas`;
    const ejemplos = document.getElementById('newRowEjemplos').value;

    //Verificamos que todos tengan datos
    const values = [ejeTematico, modalidad, descripcion,factorHoras, ejemplos];
    let isAllData = true;
    values.forEach((value) => {
        if(value.trim() === ""){
            isAllData = false;
        }
    });

    if(isAllData){

        showWaitingForServerResponse("Agregando registro...");

        $.ajax({
            method : 'POST',
            url    : "./php/denominaciones/addDenominacion.php",
            data   : {
                "EjeTematico" : ejeTematico,
                "Modalidad"   : modalidad,
                "Descripcion" : descripcion,
                "Factor"      : factor,
                "Ejemplos"    : ejemplos
            },
            success : (serverResponse) => {
    
                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse; 
                let icon = "warning-sign";
                 
                if(status === "success"){
                    //Obtenemos el ID que se le asignó al registro
                    const {ID} = jsonResponse;
    
                    //Obtenemos la tabla
                    const tablaData = $("#tabla_registros_denominaciones").DataTable();
                    
                    //Creamos los botones para el registro
                    const btnUpdate =  `<div>
                                            <button type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_editar_denominaciones" onclick = "setIDRow(${ID},'update')">
                                                    <i class="material-icons">update</i>
                                                    <span>Editar</span>
                                            </button>&nbsp&nbsp`;
                    const btnDelete =  `    <button type="button" class="btn btn-danger waves-effect" onclick = "setIDRow(${ID},'delete')">
                                                <i class="material-icons">delete</i>
                                                <span>Eliminar</span>
                                            </button>
                                        </div>`;
                    const btnGroup = btnUpdate + btnDelete;
    
                    //Agregamos el registro a la tabla
                    tablaData.row.add([
                        ejeTematico,modalidad, factor, btnGroup
                    ]).draw().node().id = `row_ID_${ID}`;
    
                    //Creamos el objeto de datos del nuevo registro
                    const dataRegisterToBeAdded = {
                        Register : {
                            ID          : parseInt(ID),
                            Descripcion : descripcion,
                            Ejemplos    : ejemplos,
                            EjeTematico : ejeTematico,
                            Factor      : parseInt(factor.substring(factor.lastIndexOf('x') + 2, factor.lastIndexOf('horas') - 1)),
                            Modalidad   : modalidad,
                        }
                    };
                    //Agregamos ese nuevo dato al arreglo de datos
                    addLocalDataDenominacion(dataRegisterToBeAdded);
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

                    $("#modal_alta_denominaciones").modal('hide');//Cerramos el modal

                    clearTimeout(timeOutObject);
                });
            }
        });
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

const updateDenominacion = () => {

    //Obtenemos los valores a actualizar
    const ejeTematico = document.getElementById('updateEjeTematico').value;
    const modalidad =  document.getElementById('updateModalidad').value;
    const descripcion = document.getElementById('updateDescripcion').value;
    const factorHoras = document.getElementById('updateFactor').value;
    const factor = `${1} x ${factorHoras} horas`;
    const ejemplos = document.getElementById('updateEjemplos').value;
    
    //Verificamos que todos tengan datos
    const values = [ejeTematico, modalidad, descripcion, factorHoras, ejemplos];
    let isAllData = true;
    values.forEach((value) => {
        if(value.trim() === ""){
            isAllData = false;
        }
    });

    if(isAllData){

        showWaitingForServerResponse("Actualizando registro...");

        $.ajax({
            method : "POST",
            url    : "./php/denominaciones/updateDenominacion.php",
            data   : {
                ID : idRowTable,
                EjeTematico : ejeTematico,
                Modalidad : modalidad,
                Descripcion : descripcion,
                Factor : factor,
                Ejemplos : ejemplos
            },
            success : (serverResponse) => {
                //Obtenemos la respuesta del servidor
                const {status, message} = JSON.parse(serverResponse);
                let icon = "warning-sign";
    
                //De acuerdo a la respuesta del servidor, mostramos la notificación
                if(status === "success"){
                    //Actualizamos los datos de la tabla
                    //Obtenemos la referencia de la tabla
                    const tablaData = $("#tabla_registros_denominaciones").DataTable();
                    //Obtenemos el renglon
                    const oldRowToBeUpdated = tablaData.row(`#row_ID_${idRowTable}`);
                    //Obtenemos el dato del renglon
                    let oldDataToBeUpdated = oldRowToBeUpdated.data();
    
                    //Creamos el nuevo arreglo de datos
                    oldDataToBeUpdated = [
                        ejeTematico,
                        modalidad,
                        factor,
                        oldDataToBeUpdated[3]
                    ];
                    
                    //Actualizamos los datos en la DataTable y en el arreglo de todos los datos
                    oldRowToBeUpdated.data(oldDataToBeUpdated);
    
                    //Creamos el nuevo objeto modificado
                    dataRegisterToBeModified = {
                        Register : {
                            ID          : idRowTable,
                            Descripcion : descripcion,
                            Ejemplos    : ejemplos,
                            EjeTematico : ejeTematico,
                            Factor      : factorHoras,
                            Modalidad   : modalidad,
                        }
                    }
                    //Actualizamos el dato
                    updateLocalDataDenominacion(dataRegisterToBeModified);
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

                    $("#modal_editar_denominaciones").modal('hide');//Cerramos el modal

                    clearTimeout(timeOutObject);
                });

            }
        });
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

const deleteDenominacion = () => {

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
    })

    $.ajax({
        method : "POST",
        url    : "./php/denominaciones/deleteDenominacion.php",
        data   : {
            ID : idRowTable
        },
        success : (serverResponse) => {
            //Obtenemos la respuesta del servidor
            const {status, message} = JSON.parse(serverResponse);
            let icon = "warning-sign";

            if(status === "success"){
                //Actualizamos los datos de la data
                const tablaData = $("#tabla_registros_denominaciones").DataTable();

                //Eliminamos el registro de la tabla y actualizamos
                tablaData.row(`#row_ID_${idRowTable}`).remove().draw();
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

                clearTimeout(timeOutObject);
            });
        }
    });
}

$(document).ready(() =>{
    //Verificamos que el que ingresa sea administrador
    verifyUser()
    .then(() => {
        fetchData().then(() => {
            //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
            setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
        });
    })
    .catch(({message}) => {
        const messageHTML = `<div>
                               ${message}
                            </div>`;
        $('.page-loader-wrapper').append(messageHTML);
    })
})
