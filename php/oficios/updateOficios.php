<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Verificamos que todos los datos se hayan recibido correctamente
    if(isset($_POST['ID']) && isset($_POST['fecha_oficio']) && isset($_POST['numero_oficio'])){
        
        //Hacemos la peticion a la bd
        $mysqli_request = "UPDATE `oficios` SET `fecha` = '".$_POST['fecha_oficio']."', `num_oficio` = '".$_POST['numero_oficio']."' WHERE `id` = '".intval($_POST['ID'])."';";
        $mysqli_response = mysqli_query($link, $mysqli_request);

        if($mysqli_response){
            //Checamos si se actualizó o no
            if(mysqli_affected_rows($link) > 0){
                $serverResponse['status'] = 'success';
                $serverResponse['message'] = 'Oficio actualizado correctamente.';
            }else{
                $serverResponse['status'] = 'info';
                $serverResponse['message'] = 'No se hicieron cambios en el oficio.';
            }
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