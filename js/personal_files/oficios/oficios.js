
let idRow;
let idRowOficios;
let allDataDepartamental = [];
let dataOficiosActual = [];

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

const showWaitingForServerResponse = (message) => {
    swal({
        title: message,
        text: "Espere un momento por favor...",
        type: "info",
        showConfirmButton : false
    });
}

const setIDRow = (ID,action) => {
    //Actualizamos el dato ID del registro que se va a actualizar/eliminar
    idRow = ID;
    //Llenamos los datos del modal
    setValuesModal(action);
}

const setIDRowOficios = (ID, action) => {
    idRowOficios = ID;

    setValuesModalOficios(action);
}

const setValuesModal = async (action) => {
    //Obtenemos los datos
    const {semestre, departamental, observaciones} = allDataDepartamental.find(({ID}) => ID === `${idRow}`);

    switch(action){
        case 'configOficio': {

            const notification = showNotification({
                message : "Obteniendo la información...",
                type    : 'info'
            });

            //Esperamos a obtener los datos de la bd
            try {
                await getOficiosRelatedTo();
                $("#modal_oficios").modal('show');//Mostramos el modal
            } catch (error) {
                showNotification({
                    message : error,
                    type    : 'danger'
                })
            }

            notification.close();//Cerramos la notificacion

            break;
        }
        case 'update' : {
            $("#updateSemestreDepartamental").val(semestre);
                $("#updateSemestreDepartamental").selectpicker('refresh')
            $("#updateDepartamental").val(departamental.split(" ")[0]);
                $("#updateDepartamental").selectpicker('refresh')
            $("#updateObservacionesDepartamental").html(observaciones);
            break;
        }
        case 'delete' : {
            $("#deleteSemestreDepartamental").val(semestre);
                $("#deleteSemestreDepartamental").selectpicker('refresh')
            $("#deleteDepartamental").val(departamental.split(" ")[0]);
                $("#deleteDepartamental").selectpicker('refresh')
            $("#deleteObservacionesDepartamental").html(observaciones);
            break;
        }
    }
}

const setValuesModalOficios = (action) => {

    //Obtenemos los datos
    const {fecha_inicio,numero_oficio} = dataOficiosActual.find(({ID}) => ID === `${idRowOficios}`);

    if(action === 'update'){
        $("#updateFechaOficio").val(fecha_inicio);
        $("#updateNumeroOficio").val(numero_oficio);
    }else{
        $("#deleteFechaOficio").val(fecha_inicio);
        $("#deleteNumeroOficio").val(numero_oficio); 
    }

}

const getOficiosRelatedTo = () => {
    return new Promise((resolve,reject) => {
        $.ajax({
            method  :  'GET',
            url     : './php/oficios/fetchDataOficios.php',
            data    : {
                ID_departamental : idRow
            },
            success : (serverResponse) => {
                
                const {status,message,data : dataOficios} = JSON.parse(serverResponse);

                const tablaRegistrosOficios = $("#tabla_registros_oficios").DataTable();
                tablaRegistrosOficios.clear().draw();

                //Si entra a la condición, se obtuvieron datos o se hizo la peticion correctamente
                if(status === 'success'){
                    //Si hay al menos 1 registro, iteramos sobre el arreglo que contiene los oficios
                    if(dataOficios.length  > 0){
                        
                        dataOficios.forEach(({id,fecha,num_oficio}) => {
                            
                            const botonesAcciones = `<div style = "display : flex; flex-direction:row;flex-wrap:wrap;flex-grow:2;align-items:center;justify-content:center;">
                                                        <div style="margin:5px">
                                                            <button style="flex:1;" type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_update_oficio" onclick="setIDRowOficios(${id},'update')">
                                                                <i class="material-icons">update</i>
                                                                <span>Editar</span>
                                                            </button>
                                                        </div>
                                                        <div style="margin:5px">
                                                            <button style="flex:1;" type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_delete_oficio" onclick="setIDRowOficios(${id},'delete')">
                                                                <i class="material-icons">delete</i>
                                                                <span>Eliminar</span>
                                                            </button>
                                                        </div>
                                                    </div>`;
                            tablaRegistrosOficios.row.add([
                                fecha, num_oficio, botonesAcciones
                            ]).draw().node().id = `row_ID_${id}`;

                            //Agregamos los datos al arreglo de todos los datos
                            dataOficiosActual.push({
                                ID : id,
                                fecha_inicio : fecha,
                                numero_oficio : num_oficio
                            })
                        })
                    }
                }else{
                    reject(message);
                }
                
                resolve()
            }
        })
    })
}

const addDepartamental = () => {
    //Obtenemos los datos
    const semestreSelected = $("#addSemestreDepartamental").val();
    const departamentalSelected = $("#addDepartamental").val();
    const observaciones = $("#addObservacionesDepartamental").val();

    //Checamos que estén todos los datos
    if(!(semestreSelected === '' || departamentalSelected === '' || observaciones === '')){

        //Mostramos una pantalla de carga
        swal({
            title: "Añadiendo registro...",
            text: "Espere un momento por favor...",
            type: "info",
            showConfirmButton : false
        });

        //Agregamos el registro solo si no existe un registro igual
        $.ajax({
            method : 'POST',
            url    : './php/oficios/addDepartamentales.php',
            data   : {
                semestre      : semestreSelected,
                departamental : departamentalSelected,
                observaciones : observaciones
            },
            success : (serverResponse) => {
                
                //Despues de 1 seg, quitamos el anuncio de carga
                setTimeout(() => {
                    swal.close();

                    const {status, message, ID} = JSON.parse(serverResponse);
                    const botonesAcciones = `<div style = "display : flex; flex-direction:row;flex-wrap:wrap;flex-grow:3;align-items:center;justify-content:center;">
                                                <div style="margin:5px">
                                                    <button style="flex:1;" type="button" class="btn btn-warning waves-effect" onclick="setIDRow(${ID},'configOficio')">
                                                        <i class="material-icons">description</i>
                                                        <span>Oficios</span>
                                                    </button>
                                                </div>
                                                <div style="margin:5px">
                                                    <button style="flex:1;" type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_update_departamental" onclick="setIDRow(${ID},'update')">
                                                        <i class="material-icons">update</i>
                                                        <span>Editar</span>
                                                    </button>
                                                </div>
                                                <div style="margin:5px">
                                                    <button style="flex:1;" type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_delete_departamental" onclick="setIDRow(${ID},'delete')">
                                                        <i class="material-icons">delete</i>
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>`;

                    //Si se agregó el registro, lo agregamos a la tabla
                    if(status === 'success'){
                        
                        const tablaRegistros = $("#tabla_registros_departamentales").DataTable();

                        tablaRegistros.row.add([
                            semestreSelected, `${departamentalSelected} Departamental`, botonesAcciones
                        ]).draw().node().id = `row_ID_${ID}`;

                        //Agregamos el registro al registro de todos los departamentales
                        allDataDepartamental.push({
                            ID : `${ID}`,
                            semestre : semestreSelected,
                            departamental : `${departamentalSelected} Departamental`,
                            observaciones : observaciones
                        });
                    }
                    
                    //Mostramos una notificacion del estatus de la peticion
                    showNotification({
                        message : message,
                        type : status
                    });

                    //Cerramos el modal
                    $("#modal_add_departamental").modal('hide');

                }, 1000);
            }
        }) 
    }else{
        swal({
            title: "¡Cuidado!",
            text: "1 o más datos faltantes. Chécalos:)",
            type: "warning",
            showConfirmButton : true,
            target : document.getElementById('modal_add_departamental')
        })
    }
}

const updateDepartamental = () => {
    //Obtenemos los nuevos datos
    const semestreSelectedUpdate = $("#updateSemestreDepartamental").val();
    const departamentalSelectedUpdate = $("#updateDepartamental").val();
    const observacionesUpdate = $("#updateObservacionesDepartamental").val();

    if(!(semestreSelectedUpdate === '' || departamentalSelectedUpdate === '' || observacionesUpdate === '')){
        //Mostramos una pantalla de carga
        swal({
            title: "Modificando registro...",
            text: "Espere un momento por favor...",
            type: "info",
            showConfirmButton : false
        });

        $.ajax({
            method : 'POST',
            url    : './php/oficios/updateDepartamentales.php',
            data   : {
                ID  : idRow,
                semestreNuevo : semestreSelectedUpdate,
                departamentalNuevo : `${departamentalSelectedUpdate} Departamental`,
                observaciones : observacionesUpdate
            },
            success : (serverResponse) => {

                const {status, message} = JSON.parse(serverResponse);

                if(status === 'success'){
                    //Modificamos el registro y los datos de la tabla
                    allDataDepartamental.find((registro) => {
                        if(registro.ID === `${idRow}`){
                            registro.semestre = semestreSelectedUpdate;
                            registro.departamental = departamentalSelectedUpdate;
                            registro.observaciones = observacionesUpdate;
                        }
                    })

                    const tablaRegistros = $("#tabla_registros_departamentales").DataTable();
                    const oldDataRow = tablaRegistros.row(`#row_ID_${idRow}`);
                    const newDataRow = oldDataRow.data();
                    newDataRow[0] = semestreSelectedUpdate;
                    newDataRow[1] = `${departamentalSelectedUpdate} Departamental`;
                    oldDataRow.data(newDataRow);
                }

                //Mostramos una notificacion del estatus de la peticion
                showNotification({
                    message : message,
                    type : status
                });

                //Cerramos la notificacion
                swal.close();

                //Cerramos el modal
                $("#modal_update_departamental").modal('hide');
            }
        })

    }else{
        swal({
            title: "¡Cuidado!",
            text: "1 o más datos faltantes. Chécalos:)",
            type: "warning",
            showConfirmButton : true,
            target : document.getElementById('modal_add_departamental')
        })
    }

}

const deleteDepartamental = () => {
    swal({
        title: "¿Está seguro de eliminar el departamental?",
        text: "Si lo elimina, tendrá que crearlo de nuevo",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Eliminar departamental",
        cancelButtonText: "Cancelar operación",
        closeOnConfirm: true,
        closeOnCancel: true
    }, function (isConfirm) {
        if (!isConfirm) {
            showNotification({
                message : "El departamental no se ha elminado",
                type : "info"
            })
            $("#modal_delete_departamental").modal('hide')
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
                url    : "./php/oficios/deleteDepartamental.php",
                data   : {
                    ID : idRow
                },
                success : (serverResponse) => {
                    //Obtenemos la respuesta del servidor
                    const {status, message} = JSON.parse(serverResponse);
                    let icon = "warning-sign";
                    
                    if(status === "success"){
                        //Actualizamos los datos de la data
                        const tablaData = $("#tabla_registros_departamentales").DataTable();

                        //Eliminamos el registro de la tabla y actualizamos
                        tablaData.row(`#row_ID_${idRow}`).remove().draw();
                        icon = "ok";

                        //Eliminamos el registro del arreglo
                        allDataDepartamental.forEach((registro, index, array) => {
                            if(registro.ID === `${idRow}`){
                                array.splice(index , 1)
                            }
                        })
                    }

                    const waitTime = () => {
                        return new Promise((resolve) => {
                            const timeOutObject = setTimeout(()=>{
                                resolve(timeOutObject);
                            },800);
                        })
                    }
    
                    waitTime().then((timeOutObject) =>{
                        swal.close()
    
                        //Mostramos la notificacion al usuario
                        showNotification({
                            message : message,
                            type : status,
                            icon : icon
                        });
                        
                        $("#modal_delete_departamental").modal('hide')//Cerramos el modal

                        clearTimeout(timeOutObject);
                    });
                }
            });
        }
    });
}

const addOficio = () => {
    //Obtenemos los datos del nuevo oficio
    const fechaOficio = $("#addFechaOficio").val();
    const numeroOficio = $("#addNumeroOficio").val().trim();

    //Checamos que todos los datos hayan sido ingresados
    if(!(fechaOficio === '' || numeroOficio === '')){

        //Mostramos una pantalla de carga
        swal({
            title: "Añadiendo oficio...",
            text: "Espere un momento por favor...",
            type: "info",
            showConfirmButton : false
        });

        //Lo guardamos en la bd
         $.ajax({
            method : 'POST',
            url    : './php/oficios/addOficios.php',
            data   : {
                ID_departamental : idRow,
                fecha_oficio     : fechaOficio,
                numero_oficio    : numeroOficio
            },
            success : (serverResponse) => {

                //Nos esperamos 1 seg
                const waitForPastAlert = () =>{
                    return new Promise((resolve) =>{
                        const timeOutObject = setTimeout(()=>{
                            const {status, message, id} = JSON.parse(serverResponse);

                            if(status === 'success'){
                                const botonesAcciones =`<div style = "display : flex; flex-direction:row;flex-wrap:wrap;flex-grow:2;align-items:center;justify-content:center;">
                                                            <div style="margin:5px">
                                                                <button style="flex:1;" type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_update_oficio" onclick="setIDRowOficios(${id},'update')">
                                                                    <i class="material-icons">update</i>
                                                                    <span>Editar</span>
                                                                </button>
                                                            </div>
                                                            <div style="margin:5px">
                                                                <button style="flex:1;" type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_delete_oficio" onclick="setIDRowOficios(${id},'delete')">
                                                                    <i class="material-icons">delete</i>
                                                                    <span>Eliminar</span>
                                                                </button>
                                                            </div>
                                                        </div>`;
                                //Si se agregó correctamente, lo agregamos al arreglo de todos los datos y a la tabla
                                const tablaOficios = $("#tabla_registros_oficios").DataTable();
            
                                tablaOficios.row.add([
                                    fechaOficio, numeroOficio, botonesAcciones
                                ]).draw().node().id = `row_ID_${id}`;
            
                                //Agregamos el oficio al arreglo de los oficios actuales
                                dataOficiosActual.push({
                                    ID : `${id}`,
                                    fecha_inicio : fechaOficio,
                                    numero_oficio : numeroOficio
                                })

                                //Limpiamos los campos
                                $("#addFechaOficio").val("");
                                $("#addNumeroOficio").val("");
                                $("#containerAddNumeroOficio").removeClass('focused')
                            }
            
                            swal.close();
            
                            showNotification({
                                message : message,
                                type : status,
                                element : "#tabla_registros_oficios",
                                placement : {
                                    from : "bottom", 
                                    align : "left"
                                },
                                offset : {
                                    x : 0,
                                    y : 20
                                }
                            })

                            resolve(timeOutObject);
                        },1000);
                    });
                }
            
                waitForPastAlert().then((timeOutObject) => {
                    clearTimeout(timeOutObject);
                });
            }
        })
    }else{
        swal({
            title: "¡Cuidado!",
            text: "1 o más datos faltantes. Chécalos:)",
            type: "warning",
            showConfirmButton : true,
            target : document.getElementById('modal_oficios')
        })
    }
}

const updateOficio = () => {
    //Obtenemos los datos del nuevo oficio
    const fechaOficioUpdate = $("#updateFechaOficio").val();
    const numeroOficioUpdate = $("#updateNumeroOficio").val().trim();

    //Checamos que todos los datos hayan sido ingresados
    if(!(fechaOficioUpdate === '' || numeroOficioUpdate === '')){

        //Mostramos una pantalla de carga
        swal({
            title: "Modificando oficio...",
            text: "Espere un momento por favor...",
            type: "info",
            showConfirmButton : false
        });

        //Lo guardamos en la bd
         $.ajax({
            method : 'POST',
            url    : './php/oficios/updateOficios.php',
            data   : {
                ID : idRowOficios,
                fecha_oficio     : fechaOficioUpdate,
                numero_oficio    : numeroOficioUpdate
            },
            success : (serverResponse) => {

                //Nos esperamos 1 seg
                const waitForPastAlert = () =>{
                    return new Promise((resolve) =>{
                        const timeOutObject = setTimeout(()=>{
                            const {status, message} = JSON.parse(serverResponse);

                            if(status === 'success'){
                                //Si se actualizo correctamente, lo actualizamos en la tabla
                                const tablaOficios = $("#tabla_registros_oficios").DataTable();
                                const oldDataRow = tablaOficios.row(`#row_ID_${idRowOficios}`);
                                const newDataRow = oldDataRow.data();
                                newDataRow[0] = fechaOficioUpdate;
                                newDataRow[1] = numeroOficioUpdate;
                                oldDataRow.data(newDataRow);
            
                                //Actualizamos el oficio en el arreglo
                                dataOficiosActual.find((registro) => {
                                    if(registro.ID === `${idRowOficios}`){
                                        registro.fecha_inicio = fechaOficioUpdate;
                                        registro.numero_oficio = numeroOficioUpdate;
                                    }
                                })
                            }
            
                            swal.close();
            
                            showNotification({
                                message : message,
                                type : status,
                                element : "#tabla_registros_oficios",
                                placement : {
                                    from : "bottom", 
                                    align : "left"
                                },
                                offset : {
                                    x : 0,
                                    y : 20
                                }
                            })
            
                            //Cerramos el modal
                            $("#modal_update_oficio").modal('hide')
                            resolve(timeOutObject);
                        },1000);
                    });
                }
            
                waitForPastAlert().then((timeOutObject) => {
                    clearTimeout(timeOutObject);
                });
            }
        })
    }else{
        swal({
            title: "¡Cuidado!",
            text: "1 o más datos faltantes. Chécalos:)",
            type: "warning",
            showConfirmButton : true,
            target : document.getElementById('modal_oficios')
        })
    }
}

const deleteOficio = () => {
    swal({
        title: "¿Está seguro de eliminar el oficio?",
        text: "Si lo elimina, tendrá que crearlo de nuevo",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Eliminar oficio",
        cancelButtonText: "Cancelar operación",
        closeOnConfirm: true,
        closeOnCancel: true,
    }, function (isConfirm) {
        if (!isConfirm) {
            showNotification({
                message : "El oficio no se ha elminado",
                type : "info",
                element : "#tabla_registros_oficios",
                placement : {
                    from : "bottom", 
                    align : "left"
                },
                offset : {
                    x : 0,
                    y : 20
                }
            })
            $("#modal_delete_oficio").modal('hide')
        }else{

            const waitForPastAlert = () =>{
                return new Promise((resolve) =>{
                    const timeOutObject = setTimeout(()=>{
                        //Mostramos una pantalla de carga
                        swal({
                            title: "Eliminando oficio...",
                            text: "Espere un momento por favor...",
                            type: "info",
                            showConfirmButton : false
                        });

                        resolve(timeOutObject);
                    },200);
                });
            }
        
            waitForPastAlert().then((timeOutObject) => {
                clearTimeout(timeOutObject);
            });

            const waitingTime = () =>{
                return new Promise((resolve) =>{
                    const timeOutObject = setTimeout(()=>{
                        $.ajax({
                            method : "POST",
                            url    : "./php/oficios/deleteOficio.php",
                            data   : {
                                ID : idRowOficios
                            },
                            success : (serverResponse) => {
                                //Obtenemos la respuesta del servidor
                                const {status, message} = JSON.parse(serverResponse);
                                let icon = "warning-sign";
                                
                                if(status === "success"){
                                    //Actualizamos los datos de la data
                                    const tablaData = $("#tabla_registros_oficios").DataTable();
            
                                    //Eliminamos el registro de la tabla y actualizamos
                                    tablaData.row(`#row_ID_${idRowOficios}`).remove().draw();
                                    icon = "ok";

                                    //Y lo eliminamos del arreglo
                                    dataOficiosActual.forEach((registro,index,array) => {
                                        if(registro.ID === `${idRowOficios}`){
                                            array.splice(index , 1)
                                        }
                                    })
                                }
                
                                swal.close();
                
                                //Mostramos la notificacion al usuario
                                showNotification({
                                    message : message,
                                    type : status,
                                    icon : icon,
                                    element : "#tabla_registros_oficios",
                                    placement : {
                                        from : "bottom", 
                                        align : "left"
                                    },
                                    offset : {
                                        x : 0,
                                        y : 20
                                    }
                                });
                                    
                                $("#modal_delete_oficio").modal('hide')//Cerramos el modal
            
                                clearTimeout(timeOutObject);
                            }
                        });
                        resolve(timeOutObject);
                    },800);
                });
            }
        
            waitingTime().then((timeOutObject) => {
                clearTimeout(timeOutObject);
            });
        }
    });
}

const fetchData = () => {
    return new Promise((resolve,reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/oficios/fetchDataDepartamentales.php',
            success : (serverResponse) => {

                const {status,message,data} = JSON.parse(serverResponse);

                if(status === 'success'){
                    //Agregamos los registros a la tabla
                    const tablaRegistros = $("#tabla_registros_departamentales").DataTable();

                    data.forEach(({id : ID, semestre,departamental,observaciones}) => {
                        const botonesAcciones = `<div style = "display : flex; flex-direction:row;flex-wrap:wrap;flex-grow:3;align-items:center;justify-content:center;">
                                                <div style="margin:5px">
                                                    <button style="flex:1;" type="button" class="btn btn-warning waves-effect" onclick="setIDRow(${ID},'configOficio')">
                                                        <i class="material-icons">description</i>
                                                        <span>Oficios</span>
                                                    </button>
                                                </div>
                                                <div style="margin:5px">
                                                    <button style="flex:1;" type="button" class="btn btn-primary waves-effect" data-toggle="modal" data-target="#modal_update_departamental" onclick="setIDRow(${ID},'update')">
                                                        <i class="material-icons">update</i>
                                                        <span>Editar</span>
                                                    </button>
                                                </div>
                                                <div style="margin:5px">
                                                    <button style="flex:1;" type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_delete_departamental" onclick="setIDRow(${ID},'delete')">
                                                        <i class="material-icons">delete</i>
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>`;
                        tablaRegistros.row.add([
                            semestre, departamental, botonesAcciones 
                        ]).draw().node().id = `row_ID_${ID}`;

                        //Agregamos al arreglo de datos
                        allDataDepartamental.push({
                            ID : ID,
                            semestre : semestre,
                            departamental : departamental,
                            observaciones : observaciones
                        });
                    })
                    resolve();
                }else{
                    reject(message);
                }
                
            }
        })
    })
}


$(document).ready(() => {
    verifyUser()
    .then(() => {
        fetchData()
        .then(() => {
            //Agregamos un listener cuando se cierre el modal de editar y eliminar oficio
            $("#modal_update_oficio").on('hidden.modal.bs', () => {
                $(document.body).addClass('modal-open')
            })
            $("#modal_delete_oficio").on('hidden.modal.bs', () => {
                $(document.body).addClass('modal-open')
            })

            //Agregamos un listener al boton de agregar oficio
            $("#btnAddOficio").on('click', addOficio);

            //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
            setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
        })
        .catch((errMessage) => {
            console.log(errMessage)
        })
    })
    .catch(({message}) => {
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