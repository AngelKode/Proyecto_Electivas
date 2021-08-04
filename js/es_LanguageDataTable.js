$(document).ready(function(){

    const tablasRegistros = ["denominaciones", "constancias","constancias_validar"];
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
        },
        "dom": 'Bfrtip',
        "buttons": [
            'copy', 'csv', 'excel', 'pdf', 'print',
        ]
    };

    tablasRegistros.forEach((nombre) => {
        //Checamos que el objeto exista
        if(document.getElementById("tabla_registros_"+nombre) !== undefined){
            //Configuramos la tabla
            table = $('#tabla_registros_'+nombre).DataTable();
    
            table.destroy();
            
            table = $('#tabla_registros_'+nombre).DataTable(configuraciones);
        }
    });
});