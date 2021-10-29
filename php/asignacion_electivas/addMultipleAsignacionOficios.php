<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html; charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf-8");

    $serverResponse = array();

    //Verificamos que hayamos recibido los parametros para hacer la peticion
    if(isset($_POST['electivasToAdd']) && isset($_POST['id_departamental']) && isset($_POST['id_oficio'])){

        $decodeData = json_decode($_POST['electivasToAdd'], true);
        $generatedIds = array();

        foreach($decodeData as $dataAlumno){
            //Obtenemos el id del alumno y el id de las electivas
            $idAlumno = $dataAlumno['id_alumno'];
            $id_electivas = $dataAlumno['id_electiva'];
            $nombreAlumno = $dataAlumno['nombre'];

            //Recorremos todas las electivas y hacemos las peticiones
            $generatedIds[$nombreAlumno] = array();
            foreach($id_electivas as $id){
                $mysqli_query = "INSERT INTO `asignaciones_oficios` (`id_alumno`,`id_electiva`,`id_oficio`,`id_departamental`) VALUES('".intval($idAlumno)."','".intval($id)."','".intval($_POST['id_oficio'])."','".intval($_POST['id_departamental'])."');";
                $mysqli_response = mysqli_query($link, $mysqli_query);

                if($mysqli_response){
                    //Agregamos el ID que se generó del oficio
                    array_push($generatedIds[$nombreAlumno], mysqli_insert_id($link));
                }else{
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error en la base de datos. Inténtelo nuevamente.';

                    //Mandamos la respuesta
                    echo json_encode($serverResponse);

                    //Nos desconectamos de la base de datos
                    mysqli_close($link);

                    exit;
                }
            }
        }

        $serverResponse['status'] = 'success';
        $serverResponse['message'] = 'Se han asignado los oficios correctamente.';
        $serverResponse['id_oficios'] = $generatedIds;

    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);

?>