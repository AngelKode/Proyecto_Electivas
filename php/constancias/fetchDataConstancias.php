<?php

    session_start();

    if(isset($_SESSION['token'])){
        include '../database/databaseConection.php';

        //Definimos el encabezado para setear el set de caracteres
        header("Content-Type: text/html;charset=utf-8");
   
        //Configuramos el set de caracteres para la consulta
        mysqli_set_charset($link, "utf8");
   
       $serverResponse = array();
       
        $mysql_request = "SELECT * FROM `constancia` WHERE `Alumno_id` = '".intval($_SESSION['token'])."';";
        $mysql_response = mysqli_query($link, $mysql_request);
    
        if($mysql_response){
            while($mysql_row = mysqli_fetch_array($mysql_response)){
                array_push($serverResponse, $mysql_row);
            }
        }else{
            $serverResponse['status'] = "danger";
            $serverResponse['message'] = "Error del servidor. Recargue la página.";
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Acceso denegado. Inicie sesión";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Cerramos la conexión
    mysqli_close($link);
?>