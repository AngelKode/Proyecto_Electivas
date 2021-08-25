<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();
    $serverResponse['electivas'] = array();

    if(isset($_COOKIE['token_id'])){
        $mysql_request = "SELECT * FROM `electiva` WHERE `Alumno_id` = ".$_COOKIE['token_id']. " ORDER BY Nombre;";
        $mysql_response = mysqli_query($link, $mysql_request);
            
        if(mysqli_num_rows($mysql_response) > 0){
            while($row = mysqli_fetch_array($mysql_response)){
                $answer['Nombre'] = $row['Nombre'];
                $answer['Creditos'] = $row['Creditos'];
                $answer['Creditos_acumulados'] = $row['Creditos_acumulados'];
                array_push($serverResponse['electivas'],$answer);
            }
            $serverResponse['status'] = 'success';
        }else{
            $serverResponse['status'] = "danger";
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Acceso denegado. Inicie sesión";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);
?>