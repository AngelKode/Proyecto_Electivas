const typeConstanciaShowing = {
    NoValidada : 1,
    Validada : 2,
    Todas  : 3
}

let ID_Constancia;
let constanciaActual;
let tableData = [];
let typeConstanciasActuales;

const initDataTable = () => {
    return new Promise((resolve) => {
        const configuraciones = {
            "paging" : true,
            "pageLength": 5,
            "drawCallback": function () {
                //Activamos el tooltip en cualquier cambio, en caso de que esa tabla cuente con tooltips
                $('.tooltipStatusDone').tooltip({
                    template : `<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner" style = "background-color:white;color:green;border: 1px solid green"></div></div>`
                });
                $('.tooltipStatusRejected').tooltip({
                    template : `<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner" style = "background-color:white;color:red;border: 1px solid red"></div></div>`
                });
            },
            "language": {
                "lengthMenu": "Mostrar _MENU_ registros",
                "zeroRecords": "Sin registros actualmente",
                "info": "Mostrando página _PAGE_ de _PAGES_",
                "infoEmpty": "Mostrando 0 de 0 registros",
                "infoFiltered": "(Filtrado de un total de _MAX_ registros)",
                "paginate": {
                    "first":      "Primero",
                    "last":       "Último",
                    "next":       "Siguiente",
                    "previous":   "Anterior"
                },
                "loadingRecords": "Cargando...",
                "processing":     "Procesando...",
                "search":         "Buscar:",
                "decimal":        ".",
                "thousands":      ",",
                "infoPostFix":    "",
                "aria": {
                    "sortAscending":  ": Habilitar orden de columna de forma ascendente",
                    "sortDescending": ": Habilitar orden de columna de forma descendente"
                },
                "buttons" : {
                    "copy": 'Copiar',
                    "copySuccess": {
                        "1": "Se guardó en el portapapeles 1 registro",
                        "_": "Se guardó en el portapapeles %d registros"
                    },
                    "print" : "Imprimir",
                    "copyTitle": 'Guardado en el portapapeles',
                    "copyKeys": 'Presiona <kbd>ctrl</kbd> o <kbd>\u2318</kbd> + <kbd>C</kbd> para copiar la información de la tabla<br>al portapapeles de tu sistema.<br><br>Para cancelar, de click a este mensaje o presione <kbd>Esc</kbd>.'    
                }
            },
            "dom": 'Bfrtip',
            "buttons": [
                'copy', 
                'csv', 
                'excel', 
                'pdf', 
                'print',
                {   
                    text: 'Constancias sin Revisión',
                    action: function ( e, dt, node, config ) {
                        renderConstanciasToValidate();
                    },
                    className : 'btn-warning'
                },
                {   
                    text: 'Constancias Revisadas',
                    action: function ( e, dt, node, config ) {
                        renderAllValidatedConstancias();
                    },
                    className : 'btn-info'
                },
                {   
                    text: 'Mostrar Todas',
                    action: function ( e, dt, node, config ) {
                        renderAllConstancias();
                    },
                    className : 'btn-success'
                }
            ],
            "responsive" : "true",
            "order" : [[4,'asc']]
        };
        
        let table = $('#tabla_registros_constancias_validar').DataTable();
        table.destroy();
        table = $('#tabla_registros_constancias_validar').DataTable(configuraciones);
        resolve();
    });
}

const renderAllConstancias = () => {
    //Actualizamos el tipo de constancias que se muestran actualmente
    typeConstanciasActuales = typeConstanciaShowing.Todas;

    const table = $("#tabla_registros_constancias_validar").DataTable();
    table.clear();
    tableData.forEach(({data,id}) => {
        table.row.add(data).draw().node().id = id;
    })
}

const renderAllValidatedConstancias = () => {
    //Actualizamos el tipo de constancias que se muestran actualmente
    typeConstanciasActuales = typeConstanciaShowing.Validada;

    const table = $("#tabla_registros_constancias_validar").DataTable();
    table.clear();
    tableData.forEach(({data,id}) => {
        if(!data[data.length - 1].includes("Validar")){
            table.row.add(data).draw().node().id = id;
        }
    })
    table.draw();
}

const renderConstanciasToValidate = () => {
    //Actualizamos el tipo de constancias que se muestran actualmente
    typeConstanciasActuales = typeConstanciaShowing.NoValidada;

    const table = $("#tabla_registros_constancias_validar").DataTable();
    table.clear();
    tableData.forEach(({data,id}) => {
        if(data[data.length - 1].includes("Validar")){
            table.row.add(data).draw().node().id = id;
        }
    })
    table.draw();
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

const setIDConstancia = async (ID, isRevisada = false) => {
    ID_Constancia = ID;
    constanciaActual = await getConstanciaDataById(parseInt(ID_Constancia));

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
    if(constanciaActual !== undefined){
        $("#nombreActividadTitle").html(constanciaActual.Actividad);
        $("#horasActividadTitle").html(constanciaActual.Horas);
    }
}

const setFileToView = (option, fileName = undefined, horas = undefined, actividad = undefined) => {
    if(option === 'onTable'){ 
        $("#fileViewer").attr("src",`files/${fileName}`);
        $("#nombreActividadTitle").html(actividad);
        $("#horasActividadTitle").html(horas);
    }else{
        $("#fileViewer").attr("src",`files/${constanciaActual.Archivo}`);
    }
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

const getDenominacionData = () => {
    return new Promise((resolve) => {
        $.ajax({
            method : "GET",
            url    : "./php/denominaciones/fetchDataDenominacion.php",
            data : {},
            success : (serverResponse) => {

                const jsonResponse = JSON.parse(serverResponse);//Convertimos a JSON la respuesta
                $("#denominacionConstancia>option").remove();//Removemos todas las opciones del eje tematico
                const selectElementDenominaciones = $("#denominacionConstancia");//Obtenemos el select de las opciones

                jsonResponse.forEach((denominacion) => {
                    //Obtenemos la información de la denominación
                    const {ID,EjeTematico,Modalidad} = denominacion;
                    //Agregamos las opciones al select
                    selectElementDenominaciones.append(`<option value="${ID}">${EjeTematico} -- ${Modalidad}</option>`);
                });

                //Una vez agregadas todas las opciones, refrescamos el select
                selectElementDenominaciones.selectpicker('refresh');

                resolve();
            }
        })
    });
}

const getDenominacionDataById = (ID) => {
    return new Promise((resolve) => {
        $.ajax({
            method : "GET",
            url    : "./php/denominaciones/fetchDataDenominacion.php",
            data : {
                ID : ID
            },
            success : (serverResponse) => {
                const jsonResponse = JSON.parse(serverResponse);//Convertimos a JSON la respuesta
                const {status} = jsonResponse[0];

                if(status){
                    const {message} = jsonResponse[0]
                    reject(message)
                }else{
                    resolve(jsonResponse[0]);
                }
            }
        })
    });
}

const getConstanciaDataById = () => {
    return new Promise((resolve) => {
        $.ajax({
            method : "GET",
            url    : "./php/constancias_validar/getConstanciasAlumno.php",
            data : {
                ID_Constancia : ID_Constancia
            },
            success : (serverResponse) => {
                const jsonResponse = JSON.parse(serverResponse);//Convertimos a JSON la respuesta
                const {status} = jsonResponse[0];

                if(status){
                    const {message} = jsonResponse[0]
                    reject(message)
                }else{
                    resolve(jsonResponse[0]);
                }
            }
        })
    });
}

const fetchData = () => {
    return new Promise((resolve,reject) => {
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
                               Programa : Programa_Alumno, Horas, Valida, Archivo} = constancia;

                        const btnCheckConstancia = (parseInt(Valida) === 1) ? `<div style="width: 100%; height: 100%;">
                                                                        <button type="button" style="width: 100%; height: 100%;" class="btn btn-warning waves-effect" onclick="setIDConstancia(${ID_Constancia},false)">
                                                                            <i class="material-icons">query_builder</i>
                                                                            <span>Validar</span>
                                                                        </button>
                                                                    </div>`
                                                                  : `<div style="width: 100%; height: 100%;display:flex;justify-content:center;align-items:center;flex-grow:2;flex-direction:row;">
                                                                        <div style="flex:2; margin:5px;">
                                                                            <button type="button" style="width: 100%; height: 100%;" class="btn btn-info waves-effect" onclick="setIDConstancia(${ID_Constancia},true)">
                                                                                <i class="material-icons">update</i>
                                                                                <span>Editar validación</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>`;
                        //Creamos el icono para ver el archivo subido
                        const btnViewFileOnTable =`<div class="view_uploaded_file">
                                                        <img src="images/images-app/PDF_file_example.svg" alt="PDF" style="width: 3rem;height: 3rem;cursor: pointer;" role="button" onclick="setFileToView('onTable','${Archivo}',${Horas},'${Actividad_Alumno}')">
                                                   </div>`;

                        dataTable.row.add([
                            Programa_Alumno, Nombre_Alumno, Actividad_Alumno, Horas, btnViewFileOnTable,btnCheckConstancia
                        ]).draw().node().id = `row_ID_${ID_Constancia}`;

                        //Guardamos todos los datos data-table en el arreglo de toda la data obtenida de las constancias
                        tableData.push({
                            data : dataTable.row(`#row_ID_${ID_Constancia}`).data().slice(),
                            id : `row_ID_${ID_Constancia}`
                        });
                    });
                    
                    //Al terminar de agregar los datos a la tabla, mostramos unicamente los que aun están por validar
                    renderConstanciasToValidate();
                }else{
                    reject({
                        message : 'Error al obtener los datos.'
                    });
                }
                resolve();
            }
        });
    });
}

const uploadRevision = async () =>{

    const isValida = ($('#isValidaConstancia').val() !== null) ? $('#isValidaConstancia').val().trim() : "";
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
            
            //Obtenemos los datos que serán enviados
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

                    //Actualizamos la constancia
                    updateConstanciaAlumno(dataSend)
                    .then(() => {
                        //Obtenemos los créditos de electivas del alumno, para hacer la suma en caso de que se valide
                        if(parseInt(isValida) === 2){
                            getElectivasAlumno(constanciaActual)
                            .then(async (electivasAlumno) => {
                                try {
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
                                } catch (error) {
                                    showNotification({
                                        message : `Error al hacer los cambios. Inténtelo nuevamente`,
                                        type : 'danger',
                                        icon : 'warning'
                                    })
                                }
                            });
                        }
                    
                        //Actualizamos la constancia actual
                        constanciaActual.Creditos = parseFloat(dataSend.Creditos).toPrecision(5);
                        constanciaActual.Denominacion_id = dataSend.Denominacion_id + "";
                        constanciaActual.Observaciones_encargado = dataSend.Observaciones_encargado;
                        constanciaActual.Valida = dataSend.Valida + "";    
                                                                    
                                                
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
                    
                        //Checamos cuales se estan mostrando, para renderizar la tabla
                        if(typeConstanciasActuales === typeConstanciaShowing.Validada){
                            renderAllValidatedConstancias();
                        }else if(typeConstanciasActuales === typeConstanciaShowing.NoValidada){
                            renderConstanciasToValidate();
                        }else{
                            renderAllConstancias();
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
            }else{
                const denominacion = ($("#denominacionConstancia").val() === null) ? "" : $("#denominacionConstancia").val().trim();
                //Checamos si todos los campos están llenos
                if(!(denominacion === "" || observacionesEncargado === "")){
                    //Obtenemos el factor de la denominacion
                    const {Factor} = await getDenominacionDataById(parseInt(denominacion))

                    const creditosOtorgados = getCreditosOtorgados(Factor).toPrecision(5);
                    
                    dataSend.Denominacion_id = parseInt(denominacion);
                    dataSend.Observaciones_encargado = observacionesEncargado;
                    dataSend.Creditos = creditosOtorgados;

                    newDataConstancia.Denominacion_id = parseInt(denominacion);

                    //Actualizamos la constancia
                    updateConstanciaAlumno(dataSend)
                    .then(() => {
                        //Obtenemos los créditos de electivas del alumno, para hacer la suma en caso de que se valide
                        if(parseInt(isValida) === 2){
                            getElectivasAlumno(constanciaActual)
                            .then(async (electivasAlumno) => {
                                try {
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
                                } catch (error) {
                                    showNotification({
                                        message : `Error al hacer los cambios. Inténtelo nuevamente`,
                                        type : 'danger',
                                        icon : 'warning'
                                    })
                                }
                            });
                        }

                        //Actualizamos la constancia actual
                        constanciaActual.Creditos = parseFloat(dataSend.Creditos).toPrecision(5);
                        constanciaActual.Denominacion_id = dataSend.Denominacion_id + "";
                        constanciaActual.Observaciones_encargado = dataSend.Observaciones_encargado;
                        constanciaActual.Valida = dataSend.Valida + "";    
                                                
                            
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

                        //Checamos cuales se estan mostrando, para renderizar la tabla
                        if(typeConstanciasActuales === typeConstanciaShowing.Validada){
                            renderAllValidatedConstancias();
                        }else if(typeConstanciasActuales === typeConstanciaShowing.NoValidada){
                            renderConstanciasToValidate();
                        }else{
                            renderAllConstancias();
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
            //Obtenemos la denominacion de la base de datos
            let denominacionNueva = (newDenominacionConstancia !== 0) ? await getDenominacionDataById(parseInt(newDenominacionConstancia)) : {Factor : '1 x 0 horas', ID : 0};
            
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

            updateConstanciaAlumno(dataSend)
                .then(() => {
                    getCreditosConstanciasAlumno(dataSend.Alumno_id)
                    .then(async (creditosAlumno) => {
                        //Encerramos dentro de un bloque try-catch para detectar posibles errores al hacer los cambios
                        try {
                            //Creo un nuevo objeto, pero con los creditos acumulados todos iguales a 0
                            let electivasAlumno = await getElectivasAlumno(constanciaActual);
                            let electivasAlumnoEmpty = electivasAlumno.map((el) => {
                                el.Creditos_acumulados = 0+"";
                                return el;
                            });

                            //Creamos un arreglo para guardar la relacion entre el ID de la constancia y el(las) ID de la electiva a la que pertenece cada constancia 
                            let idElectivasConstancias = [];

                            if(creditosAlumno.length > 0){
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
                            }else{
                                //En caso de que sea 0, no tiene ninguna electiva validada, y solamente sumamos la actual y agregamos al arreglo
                                let [,creditosByElectiva] = await getNewCreditosElectivas_Add(electivasAlumnoEmpty, newCreditosToAdd);
                                
                                //Agregamos un nuevo objeto con el ID de la constancia y cuantos creditos pertenecen a cada electiva
                                idElectivasConstancias.push({
                                    ID_Constancia  : ID_Constancia,
                                    Creditos : {...creditosByElectiva}
                                });

                            }

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

                            //Cerramos el modal
                            $("#modal_validar_constancias").modal('hide');
                        } catch (error) {
                            showNotification({
                                message : `Error al hacer los cambios. Inténtelo nuevamente`,
                                type : 'danger',
                                icon : 'warning'
                            })
                        }
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
            method : "GET",
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
    //Verificamos que el que ingresa sea administrador
    verifyUser()
    .then(() => {
        //Inicializamos la tabla
        initDataTable()
        .then(() => {
            fetchData()
            .then(() => {
                //Configuramos para refrescar el embed donde se muetra el PDF
                $('#modal_archivo_subido').on('hidden.bs.modal', refreshEmbedFile);
                //Configuramos para que cada que se abra el modal, se actualicen los datos del mismo
                $('#modal_archivo_subido').on('show.bs.modal', setDataFile);
                //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
                setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
            }) 
            .catch(({message}) => {
                const messageHTML = `<div>
                                        ${message}
                                    </div>`;
                $('.page-loader-wrapper').append(messageHTML);
            })  
        });   
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
});

