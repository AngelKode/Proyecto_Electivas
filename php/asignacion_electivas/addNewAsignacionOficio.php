<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html; charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf-8");

    $serverResponse = array();

    //Verificamos que hayamos recibido los parametros para hacer la peticion
    if(isset($_POST['id_departamental']) && isset($_POST['id_oficio']) && isset($_POST['id_alumno']) && isset($_POST['id_electiva'])){

        //Hacemos la peticion para cada electiva
        $id_oficios = array();
        foreach($_POST['id_electiva'] as $id_electiva){
            //Hacemos la peticion
            $mysqli_request = "INSERT INTO `asignaciones_oficios` (`id_alumno`,`id_electiva`,`id_oficio`,`id_departamental`) VALUES('".intval($_POST['id_alumno'])."','".intval($id_electiva)."','".intval($_POST['id_oficio'])."','".intval($_POST['id_departamental'])."');";
            $mysqli_response = mysqli_query($link, $mysqli_request);

            if($mysqli_response){
                array_push($id_oficios, "".mysqli_insert_id($link)."");
            }else{
                $serverResponse['status'] = 'danger';
                $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente';
                //Mandamos la respuesta
                echo json_encode($serverResponse);

                //Nos desconectamos de la base de datos
                mysqli_close($link);
                exit;
            }
        }
        $serverResponse['status'] = 'success';
        $serverResponse['message'] = 'Se han asignado los oficios correctamente.';
        $serverResponse['id_oficios'] = $id_oficios;

    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);

?>