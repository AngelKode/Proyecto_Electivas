<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    $mysqli_request = "SELECT * from `departamentales`";
    $mysqli_response = mysqli_query($link, $mysqli_request);

    if($mysqli_response){
        $serverResponse['status'] = 'success';
        $serverResponse['data'] = array();
        while($mysqli_row = mysqli_fetch_array($mysqli_response)){
            $newData = array();
            $newData['id'] = $mysqli_row['id'];
            $newData['semestre'] = $mysqli_row['semestre'];
            $newData['departamental'] = $mysqli_row['departamental'];
            array_push($serverResponse['data'], $newData);
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);

?>