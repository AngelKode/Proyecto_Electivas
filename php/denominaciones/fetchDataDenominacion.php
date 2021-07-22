<?php
    include '../database/databaseConection.php';

    //Ahora hacemos la peticion, y obtenemos los datos
    $mysql_request = "SELECT * FROM `denominacion`;";
    $mysql_response = mysqli_query($link,$mysql_request);
    

    if($mysql_response){
        //Arreglo donde estarán los resultados
        $responseServer = array();

        //Para cada renglon, vamos agregándolo al arreglo
        while($mysql_data = mysqli_fetch_array($mysql_response)){
            array_push($responseServer, $mysql_data);
        }

        //Codificamos a json el resultado, y lo mandamos
        echo json_encode($responseServer);
    }else{
        //En caso de algun error, mandamos un mensaje
        $responseServer = array(
            "status"  => 'danger',
            "message" => 'No se ha podido hacer la petición a la base de datos. Inténtelo nuevamente.'
        );

        //Mandamos la respuesta
        echo json_encode($responseServer);
    }

    //Nos desconectamos de la BD
    mysqli_close($link);
?>