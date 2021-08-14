<?php
    include '../database/databaseConection.php';

     //Definimos el encabezado para setear el set de caracteres
     header("Content-Type: text/html;charset=utf-8");

     //Configuramos el set de caracteres para la consulta
     mysqli_set_charset($link, "utf8");

    $mysql_request = "SELECT * FROM `constancia`;";
    $mysql_response = mysqli_query($link, $mysql_request);

    $serverResponse = array();

    if($mysql_response){
        while($mysql_row = mysqli_fetch_array($mysql_response)){
            array_push($serverResponse, $mysql_row);
        }
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Recargue la página.";
    }
    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Cerramos la conexión
    mysqli_close($link);
?>