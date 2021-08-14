<?php

    include '../database/databaseConection.php';

    $serverResponse = array();

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");
    
    if(isset($_POST['ID']) && isset($_POST['Creditos']) && isset($_POST['Observaciones_encargado']) && isset($_POST['Valida']) && isset($_POST['Denominacion_id'])){
        //Hacemos la peticion para actualizar los datos de la constancia que actualizó el encargado
        //Si el nuevo valor de la denominacion es 0, la constancia pasa a ser no valida, si no, se modifica la denominacion
        $valorDenominacionID = (intval($_POST['Denominacion_id']) == 0) ? 'null' : "'".intval($_POST['Denominacion_id'])."'";
        $mysql_request = "UPDATE `constancia` SET `Denominacion_id` = ".$valorDenominacionID.", `Valida` = '".intval($_POST['Valida'])."', `Observaciones_encargado` = '".$_POST['Observaciones_encargado']."', `Creditos` = '".floatval($_POST['Creditos'])."' WHERE ID = '".intval($_POST['ID'])."';";
        $mysql_response = mysqli_query($link, $mysql_request);

        if($mysql_response){
            $serverResponse['status'] = 'success';
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente'; 
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);
?>