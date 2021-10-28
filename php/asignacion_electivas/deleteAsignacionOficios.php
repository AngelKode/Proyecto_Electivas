<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html; charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf-8");

    $serverResponse = array();

    //Verificamos que hayamos recibido los parametros para hacer la peticion
    if(isset($_POST['id_oficios_to_delete'])){

        //Recorremos los ID's que se van a eliminar
        foreach($_POST['id_oficios_to_delete'] as $ID_oficios){
            $mysqli_request = "DELETE FROM `asignaciones_oficios` WHERE `id` = '".intval($ID_oficios)."';";
            $mysqli_response = mysqli_query($link, $mysqli_request);

            //En caso de error, nos salimos
            if(!$mysqli_response){
                $serverResponse['status'] = 'danger';
                $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente';
                //Mandamos la respuesta
                echo json_encode($serverResponse);
                exit;
            }
        }
        $serverResponse['status'] = 'success';
        $serverResponse['message'] = 'Se eliminaron los oficios de las electivas correctamente';
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);

?>