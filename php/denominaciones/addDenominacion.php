<?php
    include '../database/databaseConection.php';

    //Obtenemos cada valor enviado para crear la denominacion
    $EjeTematico = $_POST['EjeTematico'];
    $Modalidad = $_POST['Modalidad'];
    $Descripcion = $_POST['Descripcion'];
    $Factor = $_POST['Factor'];
    $Ejemplos = $_POST['Ejemplos'];

    //Verificamos que todos los parámetros se hayan enviado
    if(isset($EjeTematico) && isset($Modalidad) && isset($Descripcion) && isset($Factor) && isset($Ejemplos)){
        
        //Hacemos la peticion
        $mysql_request = "INSERT INTO `denominacion`(`EjeTematico`, `Modalidad`, `Descripcion`, `Factor`, `Ejemplos`) VALUES ('".$EjeTematico."','".$Modalidad."','".$Descripcion."','".$Factor."','".$Ejemplos."');";
        $mysql_response =  mysqli_query($link,$mysql_request);

        $responseServer = array();

        if(mysqli_affected_rows($link) > 0){
            $responseServer['status'] = "success";
            $responseServer['message'] = "Nueva denominación agregada correctamente";
            $responseServer['ID'] = mysqli_insert_id($link);//Obtenemos el ID que se le asignó al nuevo registro
        }else{
            $responseServer['status'] = "warning";
            $responseServer['message'] = "No se pudo agregar la nueva denominación. Inténtelo nuevamente";
        }

        //Mandamos la respuesta del servidor
        echo json_encode($responseServer);
        
    }else{
        $responseServer = array(
            "status" => "danger",
            "message" => "Error al querer agregar la denominación. Motivo : 'Error del Servidor'"
        );

        echo json_encode($responseServer);
    }

    //Nos desconectamos de la BD
    mysqli_close($link);
?>