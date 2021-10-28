<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Checamos que se haya mandado el id del departamental
    if(isset($_GET['id_departamental'])){
        $mysqli_request = "SELECT oficios.id, oficios.fecha, oficios.num_oficio from `oficios` WHERE `id_departamental` = '".intval($_GET['id_departamental'])."';";
        $mysqli_response = mysqli_query($link, $mysqli_request);
    
        if($mysqli_response){
            $serverResponse['status'] = 'success';
            $serverResponse['data'] = array();
            while($mysqli_row = mysqli_fetch_array($mysqli_response)){
                $newData = array();
                $newData['id'] = $mysqli_row['id'];
                $newData['num_oficio'] = $mysqli_row['num_oficio'];
                $newData['fecha'] = $mysqli_row['fecha'];
                array_push($serverResponse['data'], $newData);
            }
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);

?>