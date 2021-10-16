<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    if(isset($_GET['ID_departamental'])){
        //Obtenemos los oficios relacionados con el ID del registro
        $mysqli_request = "SELECT * FROM `oficios` WHERE `id_departamental` = '".$_GET['ID_departamental']."';";
        $mysqli_response = mysqli_query($link, $mysqli_request);

        if($mysqli_response){
            $serverResponse['data'] = array();
            while($dataRow = mysqli_fetch_array($mysqli_response)){
                
                //Obtenemos los datos por registro
                $dataRowAux = array();
                $dataRowAux['id'] = $dataRow['id'];
                $dataRowAux['fecha'] = $dataRow['fecha'];
                $dataRowAux['num_oficio'] = $dataRow['num_oficio'];

                //Lo agregamos a la respuesta
                array_push($serverResponse['data'],$dataRowAux);
            }
            $serverResponse['status'] = 'success';
            $serverResponse['message'] = 'Datos obtenidos correctamente';
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
        }

    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente.';
    }


    //Nos desconectamos de la bd
    mysqli_close($link);

    //Mandamos la respuesta
    echo json_encode($serverResponse);

?>