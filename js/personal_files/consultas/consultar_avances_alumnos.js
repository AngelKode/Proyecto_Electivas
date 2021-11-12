let tableData = [];

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
             "dom": 'Bfrtip',
             "buttons": [],
             "responsive" : "true",
         };
         
         let table = $('#tabla_registros_alumnos').DataTable();
         table.destroy();
         table = $('#tabla_registros_alumnos').DataTable(configuraciones);

         resolve();
     });
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
                                         <th>Archivo</th>
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
                                         <th scope="row" colspan="7">Total</td>
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
     constancias.forEach(({ID,Actividad,EjeTematico, Modalidad, Horas, Factor, Creditos}) => {
         //Obtenemos las horas usadas
         const horasPorCredito = parseInt(Factor.substring(Factor.lastIndexOf('x') + 2, Factor.lastIndexOf('horas') - 1));
         const creditosTotales = parseFloat((parseFloat(Horas) / parseFloat(horasPorCredito)).toPrecision(5));
         const horasUsadas = (creditosTotales === Creditos) ? Horas : ((parseFloat(Creditos) * parseFloat(Horas)) / parseFloat(creditosTotales)).toFixed(1);
          
          //Creamos el icono para ver el archivo subido
          const btnViewFileOnTable =`<div class="view_uploaded_file">
                                         <img src="images/images-app/PDF_file_example.svg" alt="PDF" style="width: 3rem;height: 3rem;cursor: pointer;" role="button" onclick="setFileToView(${ID})">
                                     </div>`;
         body += `<tr>
                     <th scope = "row"><em>${Actividad}</em></th>
                     <th>${btnViewFileOnTable}</th>
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
 
 const getElectivasAlumno = (id) => {
     return new Promise((resolve, reject) => {
         $.ajax({
             method : "POST",
             url    : "./php/constancias_validar/getElectivasAlumno.php",
             data   : {
                  Alumno_id : id
             },
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

const setFileToView = (id_constancia) => {

     //Buscamos los datos de la constancia con el ID que tenemos
     const dataConstancia = tableData.find(({id}) => id === `${id_constancia}`)

     //Checamos que hayamos encontrado algo
     if(dataConstancia){
          //Asignamos la direccion del archivo que será abierto, asi como el nombre de la actividad y el numero de horas
          $("#fileViewer").attr("src",`files/${dataConstancia.nombre_archivo}`);
          $("#nombreActividadTitle").html(dataConstancia.actividad);
          $("#horasActividadTitle").html(dataConstancia.horas);

          //Abrimos el modal que muestra el archivos
          $('#modal_archivo_subido').modal('show');
     }else{
          swal({
               title: "!Vaya¡",
               text: "Parece que ha surgido un error",
               type: "warning",
               showConfirmButton : false,
               timer: 2500
          })
     }
}

const refreshEmbedFile = () => {
     $("#fileViewerContainer>embed").remove();
     $("#fileViewerContainer").html(`<embed src="" type="application/pdf" style="width: 100%;height: 70vh;overflow-y: scroll;" id="fileViewer">`); 
 }

const fetchDataAlumnos = () => {
     return new Promise((resolve, reject) => {
          $.ajax({
               method : 'GET',
               url    : './php/consulta_avances/fetchAvancesAlumnos.php',
               success : (serverResponse) => {
                    console.log(serverResponse)
                    const jsonResponse = JSON.parse(serverResponse)
                    const {status, message} = jsonResponse;

                    //Verificamos que se haya hecho con exito la peticion
                    if(status === 'success'){

                         //Obtenemos los datos, y vamos agregandolos a la tabla
                         const {data : data_alumnos} = jsonResponse;
                         const data_table = $("#tabla_registros_alumnos").DataTable();
                         //Recorremos a cada alumno en el arreglo de datos
                         for(let alumno in data_alumnos){
                              if(data_alumnos.hasOwnProperty(alumno)){
                                  
                                   //Obtenemos los datos del alumno
                                   const {id_alumno, boleta_alumno, programa_alumno} = data_alumnos[alumno][0];

                                   //Creamos el boton para acceder al desglose de electivas del alumno
                                   const btnViewModalDesglose = `<div style="width: 100%; height: 100%;">
                                                                 <button type="button" style="width: 100%; height: 100%;" class="btn btn-success waves-effect" onclick="showModalDesglose(${id_alumno})">
                                                                      <i class="material-icons">leaderboard</i>
                                                                      <span>Desglose</span>
                                                                 </button>
                                                            </div>`;

                                    //Agregamos el registro a la tabla
                                   data_table.row.add([
                                        boleta_alumno,alumno,programa_alumno,btnViewModalDesglose
                                   ]).draw().node().id = `row_ID_${id_alumno}`;     
                              }
                         }

                    }else{
                         reject(message);
                    }

                    resolve();
               }
          })
     })
}

const showModalDesglose = (id) => {
     
     //Mostramos notificacion indicando al usuario que se están obteniendo los datos
     const notification = showNotification({
          message : "Obteniendo la información...",
     });

     //Hacemos la peticion, y acomodamos los datos en el modal
     $.ajax({
          method : 'POST',
          url    : './php/desglose_creditos/fetchData.php',
          data   : {
               id_alumno : id
          },
          success : (serverResponse) => {

               const jsonResponse = JSON.parse(serverResponse);
               const {status, message} = jsonResponse;

               //Verificamos si se hizo con exito la peticion
               if(status === 'success'){
                    //Acomodamos los datos en acordeones, cada acordeon es para cada electiva, desglosando los creditos de cada una
                    const {electivas} = jsonResponse;

                    //Obtenemos las electivas del alumno
                    getElectivasAlumno(id)
                    .then( async (electivasAlumno) => {

                         //Separamos las constancias por electiva
                         let separatedElectivasByName = [];
                         electivasAlumno.forEach(({Nombre}) => {
                              separatedElectivasByName[Nombre] = [];
                         });

                         //Ya teniendo todas las electivas, agregamos las constancias a la electiva donde pertenencen
                         //y tambien al arreglo de todos los datos
                         tableData = [];//Limpiamos el arreglo
                         electivas.forEach((constancia) => {
                              separatedElectivasByName[constancia.Nombre].push({...constancia});

                              //Agregamos los datos al arreglo
                              tableData.push({
                                   id             : constancia.ID,
                                   actividad      : constancia.Actividad,
                                   horas          : constancia.Horas,
                                   nombre_archivo : constancia.Archivo
                              })
                         });

                         try {
                              //Teniendo todos los datos, creamos las secciones
                              await createSectionsElectivas(separatedElectivasByName)
                              .then(() => {
                                   //Le agregamos el nombre del alumno el cual se está desglosando
                                   const dataTable = $("#tabla_registros_alumnos").DataTable()
                                   const nombreAlumno = dataTable.row(`#row_ID_${id}`).data()[1];
                                   $("#name_alumno_title_modal").html(`<b>Alumno</b> : ${nombreAlumno}`)

                                   //Cuando se acaban de crear las secciones, mostramos el modal y cerramos la notificacion
                                   $("#modal_desglose_electivas").modal('show');
                              })
                              .catch(({message}) => {
                                   showNotification({
                                        message : message,
                                        type : 'danger',
                                        icon : 'warning'
                                   })
                              })   
                         } catch (error) {
                              showNotification({
                                   message : 'Error al obtener los datos de tus electivas. Inténtelo nuevamente',
                                   type : 'danger',
                                   icon : 'warning'
                              })
                         }
                    })
                    .catch(({message}) => {
                         showNotification({
                              message : message,
                              type : 'danger',
                              icon : 'warning'
                         })
                    })
                    .finally(() => {
                         notification.close();
                    })

               }else{
                    notification.close();

                    showNotification({
                         message : message,
                         type : status
                    })
               }
          }
     })
}

const setFormattedName = (cadena) => {
     return new Promise((resolve, reject) => {
          //Verificamos si se manda algo valido
          if(!cadena.trim().length > 0){
               resolve('');
          }

          //Separamos la cadena en un arreglo
          const arrayCadena = cadena.split(" ");

          //Recorremos el arreglo, y cambiamos la primer letra a mayuscula
          arrayCadena.forEach((palabra,index) => {
               const charUpperCase = palabra[0].toUpperCase();
               const newCadena = `${charUpperCase}${palabra.substr(1)}`;
               arrayCadena[index] = newCadena;
          })

          resolve(arrayCadena.join(" "));
     })
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

     verifyUser()//Verificamos el usuario
     .then(() => initDataTable())//Verificamos que la tabla se haya iniciado correctamente
     .then(() => fetchDataAlumnos())//Verificamos que se hayan obtenido los datos de los alumnos correctamente
     .then(() => {
          //Quitamos la pantalla de carga al obtener todos los datos y mostrarlos en la tabla
          setTimeout(function () { $('.page-loader-wrapper').fadeOut(); }, 50);
     
          //Configuramos para que al momento de cerrarse el modal de la información, eliminamos todos los elementos del modal
          $("#modal_desglose_electivas").on('hidden.bs.modal', () => {
               $("#panel_info>div").remove()
          })
     
          //Configuramos para evitar que se desactive el modal del desglose al cerrar el modal de visualizacion del archivo
          $('#modal_archivo_subido').on('hidden.bs.modal', () => {
               $(document.body).addClass('modal-open')
          })
     
          //Configuramos para refrescar el embed donde se muetra el PDF
          $('#modal_archivo_subido').on('hidden.bs.modal', refreshEmbedFile);
     })
     .catch((errMessage) => {
          const {message} = errMessage;
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