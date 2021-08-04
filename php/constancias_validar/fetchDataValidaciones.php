<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    //Obtenemos las constancias que han sido subidas por los alumnos
    $mysql_request_constancias = "SELECT alumno.Nombre, alumno.Programa, constancia.ID,constancia.Alumno_id, constancia.Actividad, constancia.Fecha_inicio, constancia.Fecha_fin, constancia.Horas, constancia.Archivo, constancia.Valida, constancia.Denominacion_id, constancia.Observaciones_encargado, constancia.Creditos 
                      FROM `constancia` INNER JOIN `alumno` ON constancia.Alumno_id = alumno.ID;";

    //Hacemos la peticion de las constancias
    $mysql_response_constancias = mysqli_query($link, $mysql_request_constancias);

    $serverResponse['dataConstancias'] = array();

    //Verificamos que la peticion se haya realizado correctamente
    if($mysql_response_constancias){
        //Almacenamos todos los registros encontrados
        while($mysql_row_constancias = mysqli_fetch_array($mysql_response_constancias)){
            array_push($serverResponse['dataConstancias'], $mysql_row_constancias);
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Recargue la página.";
    }
    
    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);

    //Cerramos la conexion con la base de datos
    mysqli_close($link);
?>