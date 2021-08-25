<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    function getJSONData($dataToConvert){
        $dataResult = array();

        foreach($dataToConvert as $dataValue){
            $dataNew = array();
            foreach($dataValue as $valueKey => $valueData){
                $dataNew[$valueKey] = $valueData;
            }
            array_push($dataResult, $dataNew);
        }

        return $dataResult;
    }

    $serverResponse = array();

    if(isset($_POST['newDataElectivas'])){
        //Convertimos la informacion que se envió
        $newDataElectivas = json_decode($_POST['newDataElectivas']);

        //Convertimos a un arreglo para poder manipularlo
        $newDataElectivasArray = getJSONData($newDataElectivas);

        //Actualizamos las electivas del alumno
        $mysql_requests = array();
        foreach($newDataElectivasArray as $row){
            array_push($mysql_requests, "UPDATE `electiva` SET `Creditos_acumulados` = '".floatval($row['Creditos_acumulados'])."' WHERE ID =".intval($row['ID']));
        }

        $mysql_multi_requests = join(";",$mysql_requests);
        $mysql_response = mysqli_multi_query($link, $mysql_multi_requests);

        if($mysql_response){
            $serverResponse['status'] = "success";
            $serverResponse['message'] = "Constancia actualizada correctamente";
        }else{
            $serverResponse['status'] = "danger";
            $serverResponse['message'] = "Error al actualizar los créditos. Inténtelo nuevamente.";
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);
?>