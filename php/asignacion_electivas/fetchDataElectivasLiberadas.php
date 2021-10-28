<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

        //Obtenemos los registros de las electivas que ya se van a liberar o las electivas que ya fueron liberadas
        $mysqli_request = "SELECT electiva.ID AS 'id_electiva', electiva.Nombre AS 'nombre_electiva', alumno.ID AS 'id_alumno', alumno.Nombre AS 'nombre_alumno', alumno.Programa AS 'programa', alumno.Boleta AS 'boleta', asignaciones_oficios.id AS 'id_asignacion' FROM `electiva` INNER JOIN `alumno` on alumno.ID = electiva.Alumno_id LEFT OUTER JOIN `asignaciones_oficios` ON asignaciones_oficios.id_electiva = electiva.ID WHERE Creditos_acumulados >= Creditos;";
        $mysqli_response = mysqli_query($link, $mysqli_request);
    
        if($mysqli_response){
            $serverResponse['status'] = 'success';
            $serverResponse['data'] = array();
            while($mysqli_row = mysqli_fetch_array($mysqli_response)){
                $newData = array();
                $newData['id_electiva'] = $mysqli_row['id_electiva'];
                $newData['nombre_electiva'] = $mysqli_row['nombre_electiva'];
                $newData['id_alumno'] = $mysqli_row['id_alumno'];
                $newData['nombre_alumno'] = $mysqli_row['nombre_alumno'];
                $newData['programa'] = $mysqli_row['programa'];
                $newData['boleta'] = $mysqli_row['boleta'];
                $newData['id_asignacion'] = ($mysqli_row['id_asignacion'] == NULL) ? '0' : $mysqli_row['id_asignacion'];
                array_push($serverResponse['data'], $newData);
            }
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
        }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la base de datos
    mysqli_close($link);

?>