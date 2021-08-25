<?php
    include '../database/databaseConection.php';

    //Definimos el encabezado para configurar el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    //Hacemos la peticion a la BD
    $mysql_request = "SELECT * FROM `denominacion`;";
    $mysql_response = mysqli_query($link, $mysql_request);

    $serverResponse = array();

    if($mysql_response){
         while($mysql_row = mysqli_fetch_array($mysql_response)){
            $newData = array();
            $newData['ID'] = $mysql_row['ID'];
            $newData['EjeTematico'] = $mysql_row['EjeTematico'];
            $newData['Modalidad'] = $mysql_row['Modalidad'];
            $newData['Descripcion'] = $mysql_row['Descripcion'];
            $newData['Factor'] = $mysql_row['Factor'];
            $newData['Ejemplos'] = $mysql_row['Ejemplos'];
            array_push($serverResponse, $newData);
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