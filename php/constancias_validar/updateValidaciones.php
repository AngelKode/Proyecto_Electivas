<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");
    
    $serverResponse = array();

    if(isset($_POST['ID']) && isset($_POST['Denominacion_id']) && isset($_POST['Valida']) && isset($_POST['Observaciones_encargado']) && isset($_POST['Creditos']) && isset($_POST['Alumno_id'])){

    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos
    mysqli_close($close);
?>