let allDataAlumnos = [];

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

const initDataTable = () => {
    return new Promise((resolve) => {
        const configuraciones = {
            "paging" : true,
            "pageLength": 5,
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
            "dom": '<"toolbar">frtip',
            "buttons": [
            ],
            "responsive" : "true",
            "order" : [[4,'asc']]
        };
        
        let table = $('#tabla_registros_asignaciones').DataTable();
        table.destroy();
        table = $('#tabla_registros_asignaciones').DataTable(configuraciones);

        //Agregamos los select y los botones necesarios
        const toolbarComponentsDataTable = `
                                            <div class="container-toolbar-options">
                                                <div class="item-toolbar-one">
                                                    <select class="selectpicker" data-size="5" data-dropup-auto="true" data-width="100%" id="departamentalElectiva" style="width:100%;" title='Departamental'>
                                                    </select>
                                                </div>
                                                <div class="item-toolbar-two">
                                                    <select class="selectpicker" data-size="5" data-dropup-auto="true" data-width="100%" id="oficioElectiva" style="width:100%;" title='Oficio'>
                                                    </select> 
                                                </div>
                                                <div class="item-toolbar-three">
                                                        <button type="button" class="btn btn-success waves-effect" onclick = "assignToAllElectivas()">
                                                            <i class="material-icons">post_add</i>
                                                            <span>Asignar Todos</span>
                                                        </button>
                                                </div>
                                                <div class="item-toolbar-four">
                                                        <button type="button" class="btn btn-warning waves-effect" onclick="generateExcel()">
                                                            <i class="material-icons">file_copy</i>
                                                            <span>Generar Excel</span>
                                                        </button>
                                                </div>
                                            </div>
                                            `;
        $("div.toolbar").html(toolbarComponentsDataTable);

        resolve();
    });
}


const generateExcel = () => {

    const departamental = $("#departamentalElectiva option:selected").text();

    if(departamental !== 'Departamental'){
        //Primero, agregamos los headers de las columnas
        let dataFileString = "No,BOLETA,NOMBRE,PROGRAMA-ACADEMICO,UNIDADES-DE-APRENDIZAJE-LIBERADAS\r\n";

        //Para cada registro, un renglon de excels
        let counterRegistros = 1;
        for(let alumnos in allDataAlumnos){
            if(allDataAlumnos.hasOwnProperty(alumnos)){
                //Filtramos los que aun no se han asignado oficios
                const {boleta, nombre_alumno,programa,nombre_electiva} = allDataAlumnos[alumnos];
                if(nombre_electiva['asignados'].length > 0){
                    //Usamos el metodo normalize con el parametro NFD para separar los acentos de sus letras, seguido de eso eliminamos el caracter de el acento
                    dataFileString += `${counterRegistros}, ${boleta} , ${nombre_alumno.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}, ${programa.normalize('NFD').replace(/[\u0300-\u036f]/g, '')} , ${nombre_electiva['asignados'].join("-")} \r\n`;
                }
                counterRegistros++;
            }
        }
        
        //Creamos el objeto Blob que contiene la información
        const blob = new Blob([dataFileString], { type: "text/csv;charset=UTF-8;" });
        const fileName = `${departamental}.csv`;

        //Checamos si existe msSaveBlob, para descargar el archivo(IE v +10)
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName);
        }else {
            const linkElement = document.createElement("a");//Elemento <a></a> HTML

            if (linkElement.download !== undefined) {
                //Creamos el objeto, descargamos, y luego lo eliminamos
    
                const urlElement = URL.createObjectURL(blob);//Objeto Blob de excel

                    linkElement.setAttribute("href", urlElement);//Agregamos el url generado al link
                    linkElement.setAttribute("download", fileName);//Agregamos la extension como será descargado el archivo
                    linkElement.style.visibility = "hidden";//Lo escondemos del DOM

                document.body.appendChild(linkElement);//Lo agregamos a la pagina

                linkElement.click();//Llamamos a la funcion click para descargar el archivo

                document.body.removeChild(linkElement);//Eliminamos el elemento <a></a>
            }
        }
    }else{
        //Mostramos una notificacion al usuario
        swal({
            title: "Error al generar el archivo Excel",
            text: "Eliga el departamental",
            type: "warning",
            showConfirmButton : false,
            timer : 2000
        });
    }
}

const assignToAllElectivas = () => {

    //Obtenemos el departamental y el oficio que se le asignará a la(s) electiva(s)
    const departamental_id = $("#departamentalElectiva").val();
    const oficio_id = $("#oficioElectiva").val();
    
    //Checamos que se hayan elegido el departamental y el oficio a asignarse
    if(!(departamental_id === '' || oficio_id === '')){

        //Mostramos una notificacion al usuario
        swal({
            title: "Asignando los oficios",
            text: "Espere un momento...",
            type: "info",
            showConfirmButton : false,
            timer : 2000
        });

        //Recorremos los que ya se completaron para asignarles oficios
        let dataOfElectivas = [];
        let affectedAlumnosID = [];

        for(let alumnos in allDataAlumnos){
            if(allDataAlumnos.hasOwnProperty(alumnos)){
                const {id_alumno, id_electiva} = allDataAlumnos[alumnos];

                if(id_electiva['noAsignados'].length > 0){
                    dataOfElectivas.push({
                        id_alumno : id_alumno,
                        id_electiva : [...id_electiva['noAsignados']],
                        nombre      : alumnos
                    });
                    //Agregamos el ID del alumno que se alteró su información
                    affectedAlumnosID.push(alumnos);
                }
            }
        }

        //Teniendo los datos que se van a mandar, hacemos la peticion
        $.ajax({
            method : 'POST',
            url    : './php/asignacion_electivas/addMultipleAsignacionOficios.php',
            data   : {
                id_departamental : departamental_id,
                id_oficio : oficio_id,
                electivasToAdd : JSON.stringify(dataOfElectivas)
            },
            success : (serverResponse) => {

                setTimeout(() => {
                    const jsonResponse = JSON.parse(serverResponse);
                    const {status, message} = jsonResponse;
                    const id_new_oficios = jsonResponse.id_oficios;//Obtenemos el ID de los oficios que se asignaron

                    if(status === 'success'){
                        //Si todo salió bien, modificamos la tabla, y modificamos los datos de cada registro con las IDs generadas
                        
                        affectedAlumnosID.forEach((alumno,index) => {
                            if(allDataAlumnos.hasOwnProperty(alumno)){
                                //Obtenemos el renglon de las electivas que aun no habian sido asignados con un oficio
                                //y eliminamos el renglon, para pasar la información a 1 solo renglón en caso de que haya mas de 1

                                //Obtenemos el Id del alumno, el nombre de las electivas que se agregaron y sus IDs
                                const {id_alumno, nombre_electiva, id_electiva} = allDataAlumnos[alumno];
                                    const nombre_electivas_no_asignadas = [...nombre_electiva['noAsignados']];//Obtenemos el nombre de las electivas que se agregaron
                                    const id_electivas_no_asignadas = [...id_electiva['noAsignados']];
                                const dataTable = $("#tabla_registros_asignaciones").DataTable();

                                //Checamos si hay mas de 1 renglon
                                if(allDataAlumnos[alumno].id_asignacion['asignados'].length > 0){
                                    //Entra en caso de haber al menos 1 electiva ya con oficio asignado

                                    //Eliminamos el renglon ya que pasan a ser 'asignados'
                                    dataTable.row(`#row_ID_${id_alumno}_noAsignados`).remove().draw();

                                    //Agregamos el nombre de las electivas a el renglon donde están las electivas que ya tienen oficio
                                    const rowData = dataTable.row(`#row_ID_${id_alumno}_asignados`).data();

                                    rowData[3] += `, ${nombre_electivas_no_asignadas.join(" , ")}`;
                                    //Actualizamos la información
                                    dataTable.row(`#row_ID_${id_alumno}_asignados`).data(rowData);

                                }else{
                                    //Si no, aun no tiene electivas con oficio asignado

                                    //Obtenemos la información del renglon, para actualizarla
                                    const rowData = dataTable.row(`#row_ID_${id_alumno}_noAsignados`).data();

                                    //Actualizamos el icono de asignar y el boton de acciones
                                    rowData[0] = `<div style="display: flex;justify-content: center;align-items: center; width: auto;">
                                                <span class="material-icons">
                                                    check_box
                                                </span>
                                            </div>`;
                                    rowData[rowData.length - 1] = `<div style="width: 100%; height: 100%;display:flex;justify-content:center;align-items:center;flex-grow:2;flex-direction:row;">
                                                                    <div style="flex:2; margin:5px;">
                                                                        <button type="button" style="width: 100%; height: 100%;" class="btn btn-danger waves-effect" onclick="deleteOficioElectiva(${id_alumno})">
                                                                            <i class="material-icons">delete_forever</i>
                                                                            <span>Quitar</span>
                                                                        </button>
                                                                    </div>
                                                                </div>`;

                                    dataTable.row(`#row_ID_${id_alumno}_noAsignados`).data(rowData);
                                    //Cambiamos el ID a 'asignados'
                                    dataTable.row(`#row_ID_${id_alumno}_noAsignados`).node().id = `row_ID_${id_alumno}_asignados`;
                                }

                                //Actualizamos el id de los oficios
                                const newArrayIdAsignacion = allDataAlumnos[alumno].id_asignacion['asignados'].concat([...id_new_oficios[alumno]]);
                                allDataAlumnos[alumno].id_asignacion['asignados'] = newArrayIdAsignacion;
                                allDataAlumnos[alumno].id_asignacion['noAsignados'] = [];

                                //Actualizamos el id de las electivas
                                const newArrayIdElectiva = allDataAlumnos[alumno].id_electiva['asignados'].concat([...id_electivas_no_asignadas]);
                                allDataAlumnos[alumno].id_electiva['asignados'] = newArrayIdElectiva;
                                allDataAlumnos[alumno].id_electiva['noAsignados'] = [];

                                //Actualizamos el nombre de las electivas
                                const newArrayNombreElectiva = allDataAlumnos[alumno].nombre_electiva['asignados'].concat([...nombre_electivas_no_asignadas]);
                                allDataAlumnos[alumno].nombre_electiva['asignados'] = newArrayNombreElectiva;
                                allDataAlumnos[alumno].nombre_electiva['noAsignados'] = [];
                            }
                        })   
                    }

                    //Mostramos una notificacion
                    showNotification({
                        message : message,
                        type : status
                    })

                    swal.close();
                }, 1000);
            }
        })

    }else{
        //Si no, mostramos una notificacion
        swal({
            title: "No se pudo agregar el oficio a la(s) electiva(s)",
            text: "Eliga el departamental y/o el oficio para asignar",
            type: "info",
            showConfirmButton : false,
            timer : 2000
        });
    }
}

const getDataSelect = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/asignacion_electivas/fetchDataDepartamentales.php',
            success : (serverResponse) => {
                
                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;

                if(status === 'success'){

                    //Recorremos los datos obtenidos para agregarlos al select de los departamentales
                    const {data} = jsonResponse;
                    $("#departamentalElectiva>option").remove();//Removemos todas las opciones de los departamentales
                    const selectDepartamental = $("#departamentalElectiva");//Obtenemos el select de las opciones

                    data.forEach(({id, semestre, departamental}) => {
                        selectDepartamental.append(`<option value=${id}>${semestre} - ${departamental}</option>`)
                    })

                    //Una vez agregadas todas las opciones, refrescamos el select
                    selectDepartamental.selectpicker('refresh');

                    resolve()
                }else{
                    reject({
                        message : message
                    });
                }
    
            }
        })
    })
}

const getElectivasLiberadasAlumnos = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : 'GET',
            url    : './php/asignacion_electivas/fetchDataElectivasLiberadas.php',
            success : (serverResponse) => {

                const jsonResponse = JSON.parse(serverResponse);
                const {status, message} = jsonResponse;

                if(status === 'success'){
                    //Recorremos el arreglo y lo agregamos a la tabla
                    const dataTable = $("#tabla_registros_asignaciones").DataTable();
                    const {data : dataAlumnos} = jsonResponse;

                    //Juntamos todas las electivas de un mismo alumno y juntarlas en 1 solo registro
                    const sameElectivaAlumno = dataAlumnos.reduce((acc,cv) => {
                        //Checamos si ya hay un alumno
                        if(!acc[cv.nombre_alumno]){
                            acc[cv.nombre_alumno] = [];
                            acc[cv.nombre_alumno] = cv;

                            //Dependiendo el valor, ya le fue asignado un oficio o no, y se agrega a las liberadas o 
                            //a las que aun no han sido liberadas
                            if(cv.id_asignacion === `0`){
                                acc[cv.nombre_alumno].id_asignacion = {asignados : [],noAsignados : [cv.id_asignacion]};
                                acc[cv.nombre_alumno].id_electiva = {asignados : [], noAsignados : [cv.id_electiva]};
                                acc[cv.nombre_alumno].nombre_electiva = {asignados : [], noAsignados : [cv.nombre_electiva]};
                            }else{
                                acc[cv.nombre_alumno].id_asignacion = {asignados : [cv.id_asignacion], noAsignados : []};
                                acc[cv.nombre_alumno].id_electiva = {asignados : [cv.id_electiva], noAsignados : []};
                                acc[cv.nombre_alumno].nombre_electiva = {asignados : [cv.nombre_electiva], noAsignados : []};
                            }

                        }else{
                            //Dependiendo el valor, ya le fue asignado un oficio o no, y lo agregamos a los IDs de las electivas
                            //que ya fueron asignadas con su oficio o a las que no

                             //--ID de la tabla de Oficios
                             if(cv.id_asignacion === `0`){
                                acc[cv.nombre_alumno].id_asignacion.noAsignados.push(cv.id_asignacion);
                                acc[cv.nombre_alumno].id_electiva.noAsignados.push(cv.id_electiva);
                                acc[cv.nombre_alumno].nombre_electiva.noAsignados.push(cv.nombre_electiva); 
                             }else{
                                acc[cv.nombre_alumno].id_asignacion.asignados.push(cv.id_asignacion);
                                acc[cv.nombre_alumno].id_electiva.asignados.push(cv.id_electiva);
                                acc[cv.nombre_alumno].nombre_electiva.asignados.push(cv.nombre_electiva)
                             } 
                        }
                        return acc;
                    },[]);

                    for(let alumnos in sameElectivaAlumno){
                        if(sameElectivaAlumno.hasOwnProperty(alumnos)){

                            const {id_electiva, id_asignacion, id_alumno, nombre_alumno, nombre_electiva, programa} = sameElectivaAlumno[alumnos];

                            //Recorremos los que ya fueron asignados y los que no de sus oficios
                             for(let statusElectiva in nombre_electiva){
                                if(nombre_electiva.hasOwnProperty(statusElectiva) && id_electiva.hasOwnProperty(statusElectiva) && id_asignacion.hasOwnProperty(statusElectiva)){

                                    //Si no tiene elementos, no hacemos nada
                                    if (!nombre_electiva[statusElectiva].length < 1){
                                                                            //Obtenemos los datos del nombre de las electivas
                                        const data_nombre_electiva = nombre_electiva[statusElectiva];
                                        
                                        //Dependiendo la posicion del hash, será la presentacion que tendrá en la tabla
                                        let isAssigned;
                                        let btnAccion;

                                        if(statusElectiva === 'asignados'){
                                            isAssigned = `<div style="display: flex;justify-content: center;align-items: center; width: auto;">
                                                                        <span class="material-icons">
                                                                            check_box
                                                                        </span>
                                                                </div>`;
                                                                

                                            btnAccion = `<div style="width: 100%; height: 100%;display:flex;justify-content:center;align-items:center;flex-grow:2;flex-direction:row;">
                                                            <div style="flex:2; margin:5px;">
                                                                <button type="button" style="width: 100%; height: 100%;" class="btn btn-danger waves-effect" onclick="deleteOficioElectiva(${id_alumno})">
                                                                    <i class="material-icons">delete</i>
                                                                    <span>Quitar</span>
                                                                </button>
                                                            </div>
                                                        </div>`;
                                        }else{
                                            isAssigned = `<div style="display: flex;justify-content: center;align-items: center; width: auto;">
                                                            <span class="material-icons">
                                                                    check_box_outline_blank
                                                            </span>
                                                        </div>`;
                                            btnAccion = `<div style="width: 100%; height: 100%;display:flex;justify-content:center;align-items:center;flex-grow:2;flex-direction:row;">
                                                            <div style="flex:2; margin:5px;">
                                                                <button type="button" style="width: 100%; height: 100%;" class="btn btn-info waves-effect" onclick="addOficioElectiva(${id_alumno})">
                                                                    <i class="material-icons">post_add</i>
                                                                    <span>Asignar</span>
                                                                </button>
                                                            </div>
                                                        </div>`;
                                        }
                                        //Agregamos el registro a la tabla
                                        dataTable.row.add([
                                            isAssigned, programa, nombre_alumno, data_nombre_electiva.join(" , "), btnAccion
                                        ]).draw().node().id = `row_ID_${id_alumno}_${statusElectiva}`;

                                    }
                                }
                            }
                        }
                    }
                    //Asignamos los datos a una variable global
                    Object.assign(allDataAlumnos, sameElectivaAlumno)

                    resolve();
                }else{
                    reject({
                        message : message
                    })
                }
            }
        })
    })
}

const addOficioElectiva = (id) => {
    
    //Obtenemos el registro con los datos necesarios para agregar(les) el oficio a la(s) electiva(s)
    let dataElectivas;
    for(let alumnos in allDataAlumnos){
        if(allDataAlumnos.hasOwnProperty(alumnos)){
            if(allDataAlumnos[alumnos].id_alumno === `${id}`){
                dataElectivas = {...allDataAlumnos[alumnos]};
                break;
            }
        }
    }

    //Verificamos que se haya encontrado un registro
    if(dataElectivas){
        //Obtenemos el departamental y el oficio que se le asignará a la(s) electiva(s)
        const departamental_id = $("#departamentalElectiva").val();
        const oficio_id = $("#oficioElectiva").val();
        const id_electivas_no_asignadas = [...dataElectivas.id_electiva['noAsignados']];
        const nombre_electivas_no_asignadas = [...dataElectivas.nombre_electiva['noAsignados']];

        //Checamos que se hayan elegido el departamental y el oficio a asignarse
        if(!(departamental_id === '' || oficio_id === '')){
            //Mostramos una notificacion que se está asginando el oficio a(las) electiva(s)
            swal({
                title: "Asignando el oficio",
                text: "Espere un momento...",
                type: "info",
                showConfirmButton : false,
            });

            //Mandamos a hacer la peticion
            $.ajax({
                method : 'POST',
                url    : './php/asignacion_electivas/addNewAsignacionOficio.php',
                data   : {
                    id_departamental : departamental_id,
                    id_oficio        : oficio_id,
                    id_alumno        : dataElectivas.id_alumno,
                    id_electiva      : id_electivas_no_asignadas 
                },
                success : (serverResponse) => {
                    
                    setTimeout(() => {
                        const jsonResponse = JSON.parse(serverResponse);
                        const {status, message} = jsonResponse;

                        //Si se hizo correctamente la peticion, modificamos en la tabla
                        if(status === 'success'){
                            
                            //Obtenemos el renglon de las electivas que aun no habian sido asignados con un oficio
                            //y eliminamos el renglon, para pasar la información a 1 solo renglón en caso de que haya mas de 1
                            const dataTable = $("#tabla_registros_asignaciones").DataTable();
                            const id_new_oficios = jsonResponse.id_oficios;

                            //Checamos si hay mas de 1 renglon
                            if(dataElectivas.id_asignacion['asignados'].length > 0){
                                //Entra en caso de haber al menos 1 electiva ya con oficio asignado

                                //Eliminamos el renglon ya que pasan a ser 'asignados'
                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_noAsignados`).remove().draw();

                                //Agregamos el nombre de las electivas a el renglon donde están las electivas que ya tienen oficio
                                const rowData = dataTable.row(`#row_ID_${dataElectivas.id_alumno}_asignados`).data();

                                rowData[3] += `, ${nombre_electivas_no_asignadas.join(" , ")}`;
                                //Actualizamos la información
                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_asignados`).data(rowData);

                            }else{
                                //Si no, aun no tiene electivas con oficio asignado

                                //Obtenemos la información del renglon, para actualizarla
                                const rowData = dataTable.row(`#row_ID_${dataElectivas.id_alumno}_noAsignados`).data();

                                //Actualizamos el icono de asignar y el boton de acciones
                                rowData[0] = `<div style="display: flex;justify-content: center;align-items: center; width: auto;">
                                            <span class="material-icons">
                                                check_box
                                            </span>
                                        </div>`;
                                rowData[rowData.length - 1] = `<div style="width: 100%; height: 100%;display:flex;justify-content:center;align-items:center;flex-grow:2;flex-direction:row;">
                                                                <div style="flex:2; margin:5px;">
                                                                    <button type="button" style="width: 100%; height: 100%;" class="btn btn-danger waves-effect" onclick="deleteOficioElectiva(${id})">
                                                                        <i class="material-icons">delete_forever</i>
                                                                        <span>Quitar</span>
                                                                    </button>
                                                                </div>
                                                            </div>`;

                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_noAsignados`).data(rowData);
                                //Cambiamos el ID a 'asignados'
                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_noAsignados`).node().id = `row_ID_${id}_asignados`;
                            }

                            //Agregamos los ids generados de los oficios
                            for(let alumnos in allDataAlumnos){
                                if(allDataAlumnos.hasOwnProperty(alumnos)){
                                    if(allDataAlumnos[alumnos].id_alumno === `${id}`){

                                        //Actualizamos el id de los oficios
                                        const newArrayIdAsignacion = allDataAlumnos[alumnos].id_asignacion['asignados'].concat([...id_new_oficios]);
                                        allDataAlumnos[alumnos].id_asignacion['asignados'] = newArrayIdAsignacion;
                                        allDataAlumnos[alumnos].id_asignacion['noAsignados'] = [];

                                        //Actualizamos el id de las electivas
                                        const newArrayIdElectiva = allDataAlumnos[alumnos].id_electiva['asignados'].concat([...id_electivas_no_asignadas]);
                                        allDataAlumnos[alumnos].id_electiva['asignados'] = newArrayIdElectiva;
                                        allDataAlumnos[alumnos].id_electiva['noAsignados'] = [];

                                        //Actualizamos el nombre de las electivas
                                        const newArrayNombreElectiva = allDataAlumnos[alumnos].nombre_electiva['asignados'].concat([...nombre_electivas_no_asignadas]);
                                        allDataAlumnos[alumnos].nombre_electiva['asignados'] = newArrayNombreElectiva;
                                        allDataAlumnos[alumnos].nombre_electiva['noAsignados'] = [];
                                    }
                                }
                            }
                        }
                        showNotification({
                            message : message,
                            type    : status
                        })
                        swal.close();
                    }, 1000);
                }
            })
        }else{
            //Si no, mostramos una notificacion
            swal({
                title: "No se pudo agregar el oficio a la(s) electiva(s)",
                text: "Eliga el departamental y/o el oficio para asignar",
                type: "info",
                showConfirmButton : false,
                timer : 2000
            });
        }
    }
}

const deleteOficioElectiva = (id) => {
    
    //Obtenemos el registro con los datos necesarios para eliminar los oficios
    let dataElectivas;
    for(let alumnos in allDataAlumnos){
        if(allDataAlumnos.hasOwnProperty(alumnos)){
            if(allDataAlumnos[alumnos].id_alumno === `${id}`){
                dataElectivas = {...allDataAlumnos[alumnos]};
                break;
            }
        }
    }

        //Verificamos que se haya encontrado un registro
        if(dataElectivas){

            //Obtenemos los datos que serán actualizados
            const id_electivas_asignadas = [...dataElectivas.id_electiva['asignados']];
            const id_asignacion_electivas = [...dataElectivas.id_asignacion['asignados']];
            const nombre_electivas = [...dataElectivas.nombre_electiva['asignados']];

            //Mostramos una notificacion que se está haciendo la peticion para eliminarlo
            swal({
                title: "Eliminando la asignación del oficio",
                text: "Espere un momento...",
                type: "info",
                showConfirmButton : false,
            });

            //Mandamos a hacer la peticion
            $.ajax({
                method : 'POST',
                url    : './php/asignacion_electivas/deleteAsignacionOficios.php',
                data   : {
                    id_oficios_to_delete : id_asignacion_electivas
                },
                success : (serverResponse) => {

                    setTimeout(() => {
                        const jsonResponse = JSON.parse(serverResponse);
                        const {status, message} = jsonResponse;
    
                        //Si se hizo correctamente la peticion, modificamos en la tabla
                        if(status === 'success'){
                            
                            const dataTable = $("#tabla_registros_asignaciones").DataTable();

                            //Checamos si tiene algun dato o no los no asignados
                            if(dataElectivas.nombre_electiva['noAsignados'].length > 0){
                                //Entra en caso de haber al menos 1 electiva ya con oficio asignado

                                //Eliminamos el renglon ya que pasan a ser 'no asignados'
                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_asignados`).remove().draw();

                                //Agregamos el nombre de las electivas a el renglon donde están las electivas que no tienen oficio
                                const rowData = dataTable.row(`#row_ID_${dataElectivas.id_alumno}_noAsignados`).data();
                                    //Ordenamos alfabeticamente
                                    let actualElectivas = rowData[3].split(",");
                                    actualElectivas = actualElectivas.concat([...nombre_electivas]);
                                    actualElectivas = [...new Set(actualElectivas)];
                                    actualElectivas.sort()
                                rowData[3] = actualElectivas.join(',');
                                //Actualizamos la información
                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_noAsignados`).data(rowData);
                            }else{
                                //Si no, no hay electivas sin oficio

                                //Obtenemos la información del renglon, para actualizarla
                                const rowData = dataTable.row(`#row_ID_${dataElectivas.id_alumno}_asignados`).data();

                                //Actualizamos el icono de asignar y el boton de acciones
                                rowData[0] = `<div style="display: flex;justify-content: center;align-items: center; width: auto;">
                                            <span class="material-icons">
                                                check_box_outline_blank
                                            </span>
                                        </div>`;
                                rowData[rowData.length - 1] = `<div style="width: 100%; height: 100%;display:flex;justify-content:center;align-items:center;flex-grow:2;flex-direction:row;">
                                                                <div style="flex:2; margin:5px;">
                                                                    <button type="button" style="width: 100%; height: 100%;" class="btn btn-info waves-effect" onclick="addOficioElectiva(${id})">
                                                                        <i class="material-icons">post_add</i>
                                                                        <span>Asignar</span>
                                                                    </button>
                                                                </div>
                                                            </div>`;

                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_asignados`).data(rowData);
                                //Cambiamos el ID a 'asignados'
                                dataTable.row(`#row_ID_${dataElectivas.id_alumno}_asignados`).node().id = `row_ID_${id}_noAsignados`;
                            }

                            //Eliminamos los datos relacionados con los oficios asignados
                            for(let alumnos in allDataAlumnos){
                                if(allDataAlumnos.hasOwnProperty(alumnos)){
                                    if(allDataAlumnos[alumnos].id_alumno === `${id}`){
                                        //Actualizamos el id de los oficios
                                        const newArrayIdAsignacion = allDataAlumnos[alumnos].id_asignacion['noAsignados'].concat([...id_asignacion_electivas]) 
                                        allDataAlumnos[alumnos].id_asignacion['asignados'] = [];
                                        allDataAlumnos[alumnos].id_asignacion['noAsignados'] = newArrayIdAsignacion;

                                        //Actualizamos el id de las electivas
                                        const newArrayIdElectiva =  allDataAlumnos[alumnos].id_electiva['noAsignados'].concat([...id_electivas_asignadas]);
                                        allDataAlumnos[alumnos].id_electiva['asignados'] = [];
                                        allDataAlumnos[alumnos].id_electiva['noAsignados'] = newArrayIdElectiva;

                                        //Actualizamos el nombre de las electivas
                                        const newArrayNombreElectiva = allDataAlumnos[alumnos].nombre_electiva['noAsignados'].concat([...nombre_electivas]);
                                        allDataAlumnos[alumnos].nombre_electiva['asignados'] = [];
                                        allDataAlumnos[alumnos].nombre_electiva['noAsignados'] = newArrayNombreElectiva;
                                    }
                                }
                            }
                        }
                        showNotification({
                            message : message,
                            type    : status
                        })
                        swal.close();
                    }, 1000);
                }
            })
        }
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

    verifyUser()//Verificamos que haya sesión del usuario
    .then(() => initDataTable())//Inicializamos la DataTable
    .then(() => getDataSelect())//Obtenemos las opciones para el select de los departamentales
    .then(() => getElectivasLiberadasAlumnos())//Obtenemos las electivas que ya fueron liberadas
    .then(() => {
        //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
        setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
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