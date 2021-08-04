<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    if(isset($_POST['Alumno_id'])){
        $mysql_request = "SELECT * FROM `electiva` WHERE `Alumno_id` = ".$_POST['Alumno_id']. ";";
        $mysql_response = mysqli_query($link, $mysql_request);

        if(mysqli_num_rows($mysql_response) > 0){
            while($row = mysqli_fetch_array($mysql_response)){
                array_push($serverResponse,$row);
            }
        }else{
            $serverResponse['status'] = "danger";
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);
?>