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
    //Obtenemos el registro relacionado con el ID
    dataRegisterToBeModified = allDataDenominacion.find(({Register}) => Register.ID === idRowTable);

    const {Register} = dataRegisterToBeModified;
    const {Descripcion, Ejemplos, EjeTematico, Factor, Modalidad} = Register
    const {Creditos : FactorCreditos, Horas : FactorHoras} = Factor;

    if(action === "update"){
        //Actualizamos los elementos con los datos obtenidos del modal para actualizar
        document.getElementById('updateEjeTematico').value = EjeTematico;
        document.getElementById('updateModalidad').value = Modalidad;
        document.getElementById('updateDescripcion').value = Descripcion;
        document.getElementById('updateFactorCreditos').value = FactorCreditos;
        document.getElementById('updateFactorHoras').value = FactorHoras;
        document.getElementById('updateEjemplos').value = Ejemplos;
    }else{
        //Actualizamos los elementos con los datos obtenidos del modal para actualizar
        document.getElementById('deleteEjeTematico').value = EjeTematico;
        document.getElementById('deleteModalidad').value = Modalidad;
        document.getElementById('deleteDescripcion').value = Descripcion;
        document.getElementById('deleteFactorCreditos').value = FactorCreditos;
        document.getElementById('deleteFactorHoras').value = FactorHoras;
        document.getElementById('deleteEjemplos').value = Ejemplos;
    }

}

const fetchData = () => {
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
                    const btnDelete =  `    <button type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_eliminar_denominaciones" onclick = "setIDRow(${ID},'delete')">
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
                            Factor      : {
                                Creditos : parseInt(Factor.substring(0,Factor.lastIndexOf('x') - 1)),
                                Horas    : parseInt(Factor.substring(Factor.lastIndexOf('x') + 2, Factor.lastIndexOf('horas') - 1))
                            },
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
            
        }
    })
}

const addNewDenominacion = () => {

    const ejeTematico = document.getElementById('newRowEjeTematico').value;
    const modalidad =  document.getElementById('newRowModalidad').value;
    const descripcion = document.getElementById('newRowDescripcion').value;
    const factorCreditos = document.getElementById('newRowFactorCreditos').value;
    const factorHoras = document.getElementById('newRowFactorHoras').value;
        const factor = `${factorCreditos} x ${factorHoras} horas`;
    const ejemplos = document.getElementById('newRowEjemplos').value;

    //Verificamos que todos tengan datos
    const values = [ejeTematico, modalidad, descripcion, factorCreditos, factorHoras, ejemplos];
    let isAllData = true;
    values.forEach((value) => {
        if(value.trim() === ""){
            isAllData = false;
        }
    });

    if(isAllData){
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
                    const btnDelete =  `    <button type="button" class="btn btn-danger waves-effect" data-toggle="modal" data-target="#modal_eliminar_denominaciones" onclick = "setIDRow(${ID},'delete')">
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
                            Factor      : {
                                Creditos : parseInt(factor.substring(0,factor.lastIndexOf('x') - 1)),
                                Horas    : parseInt(factor.substring(factor.lastIndexOf('x') + 2, factor.lastIndexOf('horas') - 1))
                            },
                            Modalidad   : modalidad,
                        }
                    };
                    //Agregamos ese nuevo dato al arreglo de datos
                    addLocalDataDenominacion(dataRegisterToBeAdded);
                    
                    $("#modal_alta_denominaciones").modal('hide');//Cerramos el modal
                    icon = "ok";
                }
                //Mostramos una notificación
                showNotification({
                    message : message,
                    type : status,
                    icon : icon
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
    const factorCreditos = document.getElementById('updateFactorCreditos').value;
    const factorHoras = document.getElementById('updateFactorHoras').value;
        const factor = `${factorCreditos} x ${factorHoras} horas`;
    const ejemplos = document.getElementById('updateEjemplos').value;
    
    //Verificamos que todos tengan datos
    const values = [ejeTematico, modalidad, descripcion, factorCreditos, factorHoras, ejemplos];
    let isAllData = true;
    values.forEach((value) => {
        if(value.trim() === ""){
            isAllData = false;
        }
    });

    if(isAllData){
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
                $("#modal_editar_denominaciones").modal('hide');//Cerramos el modal
    
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
                            Factor      : {
                                Creditos : factorCreditos,
                                Horas    : factorHoras
                            },
                            Modalidad   : modalidad,
                        }
                    }
                    //Actualizamos el dato
                    updateLocalDataDenominacion(dataRegisterToBeModified);
                    icon = "ok";
                }
                //Mostramos la notificacion al usuario
                showNotification({
                    message : message,
                    type : status,
                    icon : icon
                })
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
    //Obtenemos el modal
    const modalDeleteRegister = $("#modal_eliminar_denominaciones");

    //Confirmamos si de verdad quiere eliminar el registro
    swal({
        title: "¿Está seguro de eliminar el registro?",
        text: "Si lo elimina, tendrá que crearlo de nuevo",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Eliminar registro",
        cancelButtonText: "Cancelar operación",
        closeOnConfirm: true,
        closeOnCancel: true
    }, function (isConfirm) {
        if (!isConfirm) {
            showNotification({
                message : "El registro no se ha elminado",
                type : "info"
            })
            modalDeleteRegister.modal('hide');
        }else{
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

                    $("#modal_eliminar_denominaciones").modal('hide');//Cerramos el modal

                    if(status === "success"){
                        //Actualizamos los datos de la data
                        const tablaData = $("#tabla_registros_denominaciones").DataTable();

                        //Eliminamos el registro de la tabla y actualizamos
                        tablaData.row(`#row_ID_${idRowTable}`).remove().draw();
                        icon = "ok";
                    }
                    //Mostramos la notificación al usuario
                    showNotification({
                        message : message,
                        type : status,
                        icon : icon
                    })
                }
            });
        }
    });
}

$(document).ready(() =>{
    fetchData();
})
