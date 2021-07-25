<?php

    include '../database/databaseConection.php';

     //Definimos el encabezado para setear el set de caracteres
     header("Content-Type: text/html;charset=utf-8");

     //Configuramos el set de caracteres para la consulta
     mysqli_set_charset($link, "utf8");
     
    $IDRegisterToDelete = $_POST['ID'];
    
    $serverResponse = array();

    //Checamos los datos que se mandaron
    if(isset($IDRegisterToDelete)){
        $mysql_request = "DELETE FROM `denominacion` WHERE ID = ". $IDRegisterToDelete . ";";
        $mysql_response = mysqli_query($link, $mysql_request);

        //Verificamos que se haya hecho con exito la peticion
        if($mysql_response && (mysqli_affected_rows($link) > 0)){
            $serverResponse['status'] = "success";
            $serverResponse['message'] = "Denominación eliminada correctamente.";
        }else{
            $serverResponse['status'] = "warning";
            $serverResponse['message'] = "Error al querer eliminar la denominación. Inténtelo nuevamente.";
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);
?>