<?php
    include '../database/databaseConection.php';

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