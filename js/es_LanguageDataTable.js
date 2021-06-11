$(document).ready(function(){
    table = $('#tabla_registros_denominaciones').DataTable();
    
    table.destroy();
    
    table = $('#tabla_registros_denominaciones').DataTable({
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
        "scrollX":        "350px",
        "scrollY":        "288.5px",
        "scrollCollapse": true,
        "paging":         false,
        "dom": 'Bfrtip',
        "responsive": true,
        "buttons": [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    });
});