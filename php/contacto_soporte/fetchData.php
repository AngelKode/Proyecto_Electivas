<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    $mysqli_request = "SELECT * FROM `contacto_soporte`;";
    $mysqli_response = mysqli_query($link, $mysqli_request);

    if($mysqli_response){

        $serverResponse['status'] = 'success';
        $serverResponse['data'] = array();
        
        if(mysqli_num_rows($mysqli_response) > 0){
            $dataRow = mysqli_fetch_array($mysqli_response);
            $data = array();
            $data['ID'] = $dataRow['ID'];
            $data['whats_app'] = ($dataRow['whats_app'] == NULL) ? 'Sin número' : $dataRow['whats_app'];
            $data['telefono_escuela'] = ($dataRow['telefono_escuela'] == NULL) ? 'Sin número' : $dataRow['telefono_escuela'];
            $data['email'] = ($dataRow['email'] == NULL) ? 'Sin email' : $dataRow['email'];

            array_push($serverResponse['data'], $data);
        }

    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente';
    }

    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);

?>