<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();
    $mysqli_query = "SELECT constancia.Fecha_Recibido FROM `constancia` WHERE constancia.Fecha_Recibido IS NOT NULL ORDER BY constancia.Fecha_Recibido;";
    $mysqli_response = mysqli_query($link, $mysqli_query);

    //Verificamos que se haya hecho con exito las consultas
    if($mysqli_response){
        //Recorremos todos los resultados
        $serverResponse['fechas_constancias_recibidas'] = array();
        while($dataRow = mysqli_fetch_array($mysqli_response)){
            array_push($serverResponse['fechas_constancias_recibidas'], $dataRow['Fecha_Recibido']);
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
    }
    
    echo json_encode($serverResponse);
    //Nos desconectamos de la BD
    mysqli_close($link);
?>