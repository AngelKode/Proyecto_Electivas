<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    $mysqli_request = "SELECT * FROM `departamentales`;";
    $mysqli_response = mysqli_query($link,$mysqli_request);

    if($mysqli_response){

        //Obtenemos todos los registros y los guardamos en la variable que será retornada como respuesta del servidor
        $serverResponse['data'] = array();
        while($data = mysqli_fetch_array($mysqli_response)){
            $dataArrayTemporal = array();
                $dataArrayTemporal['id'] = $data['id'];
                $dataArrayTemporal['semestre'] = $data['semestre'];
                $dataArrayTemporal['departamental'] = $data['departamental'];
                $dataArrayTemporal['observaciones'] = $data['observaciones'];
            array_push($serverResponse['data'],$dataArrayTemporal);
        }
        $serverResponse['status'] = 'success';
        $serverResponse['message'] = 'Datos obtenidos con éxito';
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
    }

    //Nos desconectamos de la bd
    mysqli_close($link);

    //Mandamos la respuesta
    echo json_encode($serverResponse);

?>